#include "tl_semaphore.h"

/*
 * TODO: Implement semaphore_init for the Ticket Lock semaphore.
 */
void semaphore_init(semaphore* sem, int initial_value) {
    // Initialize the semaphore's count and the spinlock
    atomic_init(&sem->count, initial_value); // Set the initial count
    atomic_init(&sem->ticket, 0); // Initialize the ticket number
    atomic_init(&sem->cur_ticket, 0); // Initialize the current ticket number
}

/*
 * TODO: Implement semaphore_wait using the Ticket Lock mechanism.
 */
void semaphore_wait(semaphore* sem) {
    int my_ticket = atomic_fetch_add(&sem->ticket, 1); // Get my ticket number

    while((my_ticket != atomic_load(&sem->cur_ticket)) || (atomic_load(&sem->count) <= 0)) {
        // Spin until it's your turn
        sched_yield(); // Yield the CPU to allow other threads to run
    }

    // Critical section: decrement the semaphore count
    atomic_fetch_sub(&sem->count, 1);  // Decrement semaphore
    atomic_fetch_add(&sem->cur_ticket, 1); // Increment the current ticket number
}

/*
 * TODO: Implement semaphore_signal using the Ticket Lock mechanism.
 */
void semaphore_signal(semaphore* sem) {
    atomic_fetch_add(&sem->count, 1); // Increment the semaphore count
}
