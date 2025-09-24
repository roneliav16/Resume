#include "tas_semaphore.h"

/*
 * TODO: Implement semaphore_init using a TAS spinlock.
 */
void semaphore_init(semaphore* sem, int initial_value) {
    // Initialize the semaphore's count and the spinlock
    atomic_init(&sem->count, initial_value);
    atomic_flag_clear(&sem->lock); // Initialize the lock to unlocked stat
}

/*
 * TODO: Implement semaphore_wait using the TAS spinlock mechanism.
 */
void semaphore_wait(semaphore* sem) {
    while((atomic_flag_test_and_set(&sem->lock)) && (atomic_load(&sem->count) <= 0)) {
        // Spin until the lock is acquired and the semaphore count is greater than 0
        sched_yield(); // Yield the CPU to allow other threads to run
    }
    atomic_fetch_sub(&sem->count, 1);  // Decrement semaphore
}

/*
 * TODO: Implement semaphore_signal using the TAS spinlock mechanism.
 */
void semaphore_signal(semaphore* sem) {
    // TODO: Acquire the spinlock, increment the semaphore value, then release the spinlock.
    atomic_fetch_add(&sem->count, 1); // Increment the semaphore count
    atomic_flag_clear(&sem->lock); // Release the lock
}
