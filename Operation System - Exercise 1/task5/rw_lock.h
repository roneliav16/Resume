#ifndef RW_LOCK_H
#define RW_LOCK_H

#include <stdatomic.h>

/*
 * Define the read-write lock type.
 * Write your struct details in this file..
 */
typedef struct {
    atomic_int ticket;        // Next available ticket
    atomic_int cur_ticket;    // Current ticket being served
    atomic_int reader_count;  // Number of active readers
    atomic_int writer;   
} rwlock;

/*
 * Initializes the read-write lock.
 */
void rwlock_init(rwlock* lock);

/*
 * Acquires the lock for reading.
 */
void rwlock_acquire_read(rwlock* lock);

/*
 * Releases the lock after reading.
 */
void rwlock_release_read(rwlock* lock);

/*
 * Acquires the lock for writing. This operation should ensure exclusive access.
 */
void rwlock_acquire_write(rwlock* lock);

/*
 * Releases the lock after writing.
 */
void rwlock_release_write(rwlock* lock);

#endif // RW_LOCK_H
