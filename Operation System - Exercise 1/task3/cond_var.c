#include "cond_var.h"
#include <sched.h>

/*
 * TODO: Implement condition_variable_init.
 */
void condition_variable_init(condition_variable* cv) {
    atomic_init(&cv->waiters, 0); // Initialize the waiter count to 0
    atomic_init(&cv->to_signal, 0); // Initialize the signal count to 0
    ticketlock_init(&cv->int_lock); // Initialize the internal ticket lock
}

/*
 * TODO: Implement condition_variable_wait.
 */
void condition_variable_wait(condition_variable* cv, ticket_lock* ext_lock) {
    atomic_fetch_add(&cv->waiters, 1); // Increment the waiter count
    // Release the external lock
    ticketlock_release(ext_lock);
    while (1) {
        ticketlock_acquire(&cv->int_lock); // Acquire the internal lock
        if (atomic_load(&cv->to_signal) > 0) {
            atomic_fetch_sub(&cv->waiters, 1); // Decrement the waiter count
            atomic_fetch_sub(&cv->to_signal, 1); // Decrement the signal count
            ticketlock_release(&cv->int_lock); // Release the internal lock
            break; // Successfully claimed a signal slot
        }
        ticketlock_release(&cv->int_lock); // Release the internal lock
        sched_yield(); // Yield CPU until signaled
    }

    ticketlock_acquire(ext_lock); // Reacquire the external lock
}

/*
 * TODO: Implement condition_variable_signal.
 */
void condition_variable_signal(condition_variable* cv) {
    ticketlock_acquire(&cv->int_lock); // Acquire the internal lock
    if (atomic_load(&cv->waiters) > atomic_load(&cv->to_signal)) {  // Check if there are waiters
        atomic_fetch_add(&cv->to_signal, 1); // Allow one waiter to proceed
    }
    ticketlock_release(&cv->int_lock); // Release the internal lock
}

/*
 * TODO: Implement condition_variable_broadcast.
 */
void condition_variable_broadcast(condition_variable* cv) {
    ticketlock_acquire(&cv->int_lock); // Acquire the internal lock
    if (atomic_load(&cv->waiters) > 0) {
        atomic_store(&cv->to_signal, atomic_load(&cv->waiters)); // Allow one waiter to proceed
    }
    ticketlock_release(&cv->int_lock); // Release the internal lock
}
