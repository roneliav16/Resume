#include "rw_lock.h"

/*
 * TODO: Implement rwlock_init.
 */
void rwlock_init(rwlock* lock) {
    atomic_init(&lock->ticket, 0);
    atomic_init(&lock->cur_ticket, 0);
    atomic_init(&lock->reader_count, 0);
    atomic_init(&lock->writer, 0);
}

/*
 * TODO: Implement rwlock_acquire_read.
 */
void rwlock_acquire_read(rwlock* lock) {
    while (1) {
        // Wait while a writer is active
        while (atomic_load(&lock->writer) != 0) {
            sched_yield();
        }

        atomic_fetch_add(&lock->reader_count, 1);

        // Check again that no writer became active after reader_count increment
        if (atomic_load(&lock->writer) == 0) {
            break;  // safe to proceed
        }

        // Undo and retry
        atomic_fetch_sub(&lock->reader_count, 1);
    }
}

/*
 * TODO: Implement rwlock_release_read.
 */
void rwlock_release_read(rwlock* lock) {
    atomic_fetch_sub(&lock->reader_count, 1);
}

/*
 * TODO: Implement rwlock_acquire_write.
 */
void rwlock_acquire_write(rwlock* lock) {
    int my_ticket = atomic_fetch_add(&lock->ticket, 1);

    // Wait until it's this writer's turn
    while (atomic_load(&lock->cur_ticket) != my_ticket) {
        sched_yield();
    }

    // Indicate a writer is now active
    atomic_store(&lock->writer, 1);

    // Wait until there are no active readers
    while (atomic_load(&lock->reader_count) > 0) {
        sched_yield();
    }
}

/*
 * TODO: Implement rwlock_release_write.
 */
void rwlock_release_write(rwlock* lock) {
    atomic_store(&lock->writer, 0);                // Writer done
    atomic_fetch_add(&lock->cur_ticket, 1);        // Allow next ticket
}
