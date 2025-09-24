#include "cp_pattern.h"
#include <stdio.h>
#include <stdlib.h>
#include "ticket_lock.h"
#include "cond_var.h"
#include "queue.h"
#include <pthread.h>

#define MAX_QUEUE_SIZE 1000000
#define bool int
#define true 1
#define false 0

queue q;
atomic_int producer_count = 0;
ticket_lock lock_queue;
ticket_lock lock_print;
condition_variable cv;
pthread_t *producer_threads;
pthread_t *consumer_threads;
bool boolean_array[MAX_QUEUE_SIZE] = {false};
// atomic_int consumer_count = 0;


void global_init(int consumers, int producers) {
    producer_threads = malloc(producers * sizeof(pthread_t));
    if (producer_threads == NULL) {
        // Always check if malloc failed
        fprintf(stderr, "Memory allocation failed\n");
        exit(1);
    }
    consumer_threads = malloc(consumers * sizeof(pthread_t));
    if (consumer_threads == NULL) {
        // Always check if malloc failed
        fprintf(stderr, "Memory allocation failed\n");
        exit(1);
    }
    // Initialize the queue
    queue_init(&q);
    // Initialize the ticket lock
    ticketlock_init(&lock_queue);
    ticketlock_init(&lock_print);
    // Initialize the condition variable
    condition_variable_init(&cv);
}

void* produce(void* arg) {
    // Each consumer thread will repeatedly generate a random number and try to push it to the queue if it doesn't exist
    while (atomic_load(&producer_count) < MAX_QUEUE_SIZE) {
        int num = rand() % MAX_QUEUE_SIZE; // Generate a number between 0 and 999,999

        // Check if the number exists in the queue
        ticketlock_acquire(&lock_queue); // Acquire the lock before checking the queue

        if (boolean_array[num] == false) {
            boolean_array[num] = true; // Mark the number as existing
            queue_push(&q, num);
            condition_variable_signal(&cv);

            char message[100]; // Buffer to hold the message
            snprintf(message, sizeof(message),"Producer %lu generated number: %d\n",(unsigned long)pthread_self(), num);
            print_msg(message);
            atomic_fetch_add(&producer_count, 1); // Increment the producer count
        }
        
        ticketlock_release(&lock_queue); // Release the lock after checking the queue
    }
    return NULL;
}

void* consume(void* arg) {
    while (1) {
        ticketlock_acquire(&lock_queue); // Acquire the lock before checking the queue
        if (queue_size(&q) == 0 && atomic_load(&producer_count) == MAX_QUEUE_SIZE) {
            ticketlock_release(&lock_queue); // Release the lock after checking the queue
            break; // Exit the loop if the queue is empty and all numbers are produced
        }

        while (queue_size(&q) == 0 && atomic_load(&producer_count) < MAX_QUEUE_SIZE) {
            condition_variable_wait(&cv, &lock_queue);
        }
        
        bool result = false;
        int num = queue_pop(&q); // Pop the first number in the queue
        if (num % 6 == 0) {
            result = true; // Check if the number is divisible by 6
        }
    
        char message[100]; // Buffer to hold the message
        char* result_str = result ? "True" : "False"; // Convert the boolean result to string
        snprintf(message, sizeof(message),"Consumer %lu checked %d. Is it divisible by 6? %s\n",(unsigned long)pthread_self(), num, result_str);
        print_msg(message);
    
        ticketlock_release(&lock_queue); // Release the lock after checking the queue
    }
    return NULL;
}

void global_destroy() {
    // Free the allocated memory for producer and consumer threads
    free(producer_threads);
    free(consumer_threads);
    // // Destroy the queue
    queue_destroy(&q);
}

/*
 * TODO: Implement start_consumers_producers.
 * This function should:
 *  - Print the configuration (number of consumers, producers, seed).
 *  - Seed the random number generator using srand().
 *  - Create producer and consumer threads.
 */
void start_consumers_producers(int consumers, int producers, int seed) {
    global_init(consumers, producers);
    //Print the configuration (number of consumers, producers, seed).
    printf("Number of Consumers: %d\nNumber of Producers: %d\nseed: %d\n", consumers, producers, seed);

    //Seed the random number generator using srand().
    srand(seed);
    
    //Create producer and consumer threads.
    for (int i = 0; i < producers; i++) {
        pthread_create(&producer_threads[i], NULL, produce, NULL);
    }
    for (int i = 0; i < consumers; i++) {
        pthread_create(&consumer_threads[i], NULL, consume, NULL);
    }
}


/*
 * TODO: Implement stop_consumers to stop all consumers threads.
 */
void stop_consumers() {
    // Signal all consumers to stop waiting
    condition_variable_broadcast(&cv);
}

/*
 * TODO: Implement print_msg to perform synchronized printing.
 */
void print_msg(const char* msg) {
    // TODO: Print the message ensuring output does not overlap.
    ticketlock_acquire(&lock_print); // Acquire the lock before printing
    printf("%s", msg); // Print the message
    ticketlock_release(&lock_print); // Release the lock after printing
}

/*
 * TODO: Implement wait_until_producers_produced_all_numbers 
 * The function should wait until all numbers between 0 and 1,000,000 have been produced.
 */
void wait_until_producers_produced_all_numbers() {
    // TODO: Wait until production of numbers (0 to 1,000,000) is complete.
    while(atomic_load(&producer_count) < MAX_QUEUE_SIZE) {
        // Wait until all numbers are produced
        sched_yield(); // Yield CPU to other threads
    }
}

/*
 * TODO: Implement wait_consumers_queue_empty to wait until queue is empty, 
 * if queue is already empty - return immediately without waiting.
 */
void wait_consumers_queue_empty() {
    while(1) {
        ticketlock_acquire(&lock_queue);
        if (queue_size(&q) == 0 && atomic_load(&producer_count) == MAX_QUEUE_SIZE) {
            ticketlock_release(&lock_queue); // Release the lock after checking the queue
            break; // Exit the loop if the queue is empty and all numbers are produced
        }
        ticketlock_release(&lock_queue); // Release the lock after checking the queue
        sched_yield(); // Yield CPU to other threads
    }  
}
bool is_digit(char c) {
    return c >= '0' && c <= '9';
}

bool is_argv_valid(int argc, char* argv[]) {
    // Check if the number of arguments is correct
    if (argc != 4) {
        return false;
    }
    // Check if the first argument is a valid integer
    for (int i = 0; argv[1][i] != '\0'; i++) {
        if (!is_digit(argv[1][i])) {
            return false;
        }
    }
    // Check if the second argument is a valid integer
    for (int i = 0; argv[2][i] != '\0'; i++) {
        if (!is_digit(argv[2][i])) {
            return false;
        }
    }
    // Check if the third argument is a valid integer
    for (int i = 0; argv[3][i] != '\0'; i++) {
        if (!is_digit(argv[3][i])) {
            return false;
        }
    }
    int consumers = atoi(argv[1]);
    int producers = atoi(argv[2]);
    int seed = atoi(argv[3]);
    if(consumers <= 0 || producers <= 0 || seed < 0) {
        return false;
    }
    
    return true;
}
/*
 * TODO: Implement a main function that controls the producer-consumer process
 */
int main(int argc, char* argv[]) {
    // TODO: Parse arguments.
    // TODO: Start producer-consumer process.
    // TODO: Wait for threads to finish and clean up resources.
    if (!is_argv_valid(argc, argv)) {
        printf("usage: cp_pattern [consumers] [producers] [seed]\n");
        exit(1);
    } else {
        // Start the producer-consumer process
        start_consumers_producers(atoi(argv[1]), atoi(argv[2]), atoi(argv[3]));
        // Wait until all numbers are produced
        wait_until_producers_produced_all_numbers();
        // Join the producer threads
        for (int i = 0; i < atoi(argv[2]); i++) {
            pthread_join(producer_threads[i], NULL);
        }
        // Wait until the queue is empty
        wait_consumers_queue_empty();
        // Stop all consumer threads
        stop_consumers();
        // Join the consumer threads
        for (int i = 0; i < atoi(argv[1]); i++) {
            pthread_join(consumer_threads[i], NULL);
        }

        // Free the allocated memory for producer and consumer threads
        global_destroy();
    }
    exit(0);
    return 0;
}
