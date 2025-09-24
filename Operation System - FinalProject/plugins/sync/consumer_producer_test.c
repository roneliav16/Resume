#include "consumer_producer.h"
#include <stdio.h>
#include <pthread.h>
#include <string.h>
#include <assert.h>
#include <unistd.h>
#include <stdlib.h>

static consumer_producer_t test_queue;
static int items_produced = 0;
static int items_consumed = 0;

void* producer_thread(void* arg) {
    int num_items = *(int*)arg;
    
    for (int i = 0; i < num_items; i++) {
        char item[32];
        snprintf(item, sizeof(item), "item_%d", i);
        char* heap_item = strdup(item);
        printf("Producer: Adding %s\n", item);
        const char* error = consumer_producer_put(&test_queue, heap_item);
        if (error) {
            printf("Producer error: %s\n", error);
            free(heap_item);
            break;
        }
        items_produced++;
        usleep(100000); // 100ms delay
    }
    
    return NULL;
}

void* consumer_thread(void* arg) {
    int num_items = *(int*)arg;
    
    for (int i = 0; i < num_items; i++) {
        char* item = consumer_producer_get(&test_queue);
        if (item) {
            printf("Consumer: Got %s\n", item);
            items_consumed++;
            free(item);
        }
        usleep(150000); // 150ms delay (slower than producer)
    }
    
    return NULL;
}

static void* signaler_thread_fn(void* arg) {
    (void)arg;
    sleep(1);
    consumer_producer_signal_finished(&test_queue);
    return NULL;
}


int main() {
    printf("Starting consumer-producer tests...\n");
    
    // Test 1: Basic initialization and cleanup
    printf("\nTest 1: Queue initialization and cleanup\n");
    const char* error = consumer_producer_init(&test_queue, 5);
    assert(error == NULL);
    consumer_producer_destroy(&test_queue);
    printf("Test 1: PASSED\n");
    
    // Test 2: Single item put/get
    printf("\nTest 2: Single item put/get\n");
    error = consumer_producer_init(&test_queue, 3);
    assert(error == NULL);

    char* heap_item = strdup("test_item");
    error = consumer_producer_put(&test_queue, heap_item);
    assert(error == NULL);

    char* item = consumer_producer_get(&test_queue);
    assert(item != NULL);
    assert(strcmp(item, "test_item") == 0);
    free(item);

    consumer_producer_destroy(&test_queue);
    printf("Test 2: PASSED\n");
    
    // Test 3: Multi-threaded producer-consumer
    printf("\nTest 3: Multi-threaded producer-consumer\n");
    error = consumer_producer_init(&test_queue, 3);
    assert(error == NULL);
    
    items_produced = 0;
    items_consumed = 0;
    int num_items = 10;
    
    pthread_t producer, consumer;
    pthread_create(&producer, NULL, producer_thread, &num_items);
    pthread_create(&consumer, NULL, consumer_thread, &num_items);
    
    pthread_join(producer, NULL);
    pthread_join(consumer, NULL);
    
    printf("Produced: %d, Consumed: %d\n", items_produced, items_consumed);
    assert(items_produced == num_items);
    assert(items_consumed == num_items);
    
    consumer_producer_destroy(&test_queue);
    printf("Test 3: PASSED\n");
    
    // Test 4: Finished signaling
    printf("\nTest 4: Finished signaling\n");
    error = consumer_producer_init(&test_queue, 5);
    assert(error == NULL);
    
    // Signal finished from another thread
    pthread_t signaler_thread;
    pthread_create(&signaler_thread, NULL, signaler_thread_fn, NULL);
    
    // This should block for about 1 second then return
    assert(consumer_producer_wait_finished(&test_queue) == 0);
    
    pthread_join(signaler_thread, NULL);
    consumer_producer_destroy(&test_queue);
    printf("Test 4: PASSED\n");
    
    printf("\nAll consumer-producer tests PASSED!\n");
    return 0;
}