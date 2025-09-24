#include "local_storage.h"
#include <stdlib.h>
#include <stdio.h>
#include "rw_lock.h"
/*
 * TODO: Define the global TLS array.
 */
tls_data_t g_tls[MAX_THREADS];
rwlock tls_rwlock;

/*
 * TODO: Implement init_storage to initialize g_tls.
 */
void init_storage(void) {
    // TODO: Set all thread_id fields to -1 and data pointers to NULL.
    rwlock_init(&tls_rwlock);
    rwlock_acquire_write(&tls_rwlock);
    for (int i = 0; i < MAX_THREADS; i++) {
        g_tls[i].thread_id = -1;
        g_tls[i].data = NULL;
    }
    rwlock_release_write(&tls_rwlock);
}

/*
 * TODO: Implement tls_thread_alloc to allocate a TLS entry for the calling thread.
 */
void tls_thread_alloc(void) {
    int64_t self_id = (int64_t)pthread_self();

    rwlock_acquire_write(&tls_rwlock);

    // Check if this thread already has a slot
    for (int i = 0; i < MAX_THREADS; i++) {
        if (g_tls[i].thread_id == self_id) {
            rwlock_release_write(&tls_rwlock);
            return; // Already allocated
        }
    }

    // Find an empty slot
    for (int i = 0; i < MAX_THREADS; i++) {
        if (g_tls[i].thread_id == -1) {
            g_tls[i].thread_id = self_id;
            g_tls[i].data = NULL; // Initialize data to NULL
            rwlock_release_write(&tls_rwlock);
            return;
        }
    }

    // No available slot
    printf("thread [%ld] failed to initialize, not enough space\n", (long)self_id);
    rwlock_release_write(&tls_rwlock);
    exit(1);
}

/*
 * TODO: Implement get_tls_data to retrieve the TLS data for the calling thread.
 */
void* get_tls_data(void) {
    // TODO: Search for the calling thread's entry and return its data.
    int64_t self_id = (int64_t)pthread_self();
    rwlock_acquire_read(&tls_rwlock);
    for (int i = 0; i < MAX_THREADS; i++) {
        if (g_tls[i].thread_id == self_id) {
            void* retVal = g_tls[i].data;
            rwlock_release_read(&tls_rwlock);
            return retVal;
        }
    }
    // If we reach here, the thread was not found
    printf("thread [%ld] hasn't been initialized in the TLS\n", (long)self_id);
    rwlock_release_read(&tls_rwlock);
    exit(2);
}

/*
 * TODO: Implement set_tls_data to update the TLS data for the calling thread.
 */
void set_tls_data(void* data) {
    // TODO: Search for the calling thread's entry and set its data.
    int64_t self_id = (int64_t)pthread_self();

    rwlock_acquire_write(&tls_rwlock);

    for (int i = 0; i < MAX_THREADS; i++) {
        if (g_tls[i].thread_id == self_id) {
            g_tls[i].data = data;
            rwlock_release_write(&tls_rwlock);
            return;
        }
    }
    // If we reach here, the thread was not found
    printf("thread [%ld] hasn't been initialized in the TLS\n", (long)self_id);
    rwlock_release_write(&tls_rwlock);
    exit(2);
}

/*
 * TODO: Implement tls_thread_free to free the TLS entry for the calling thread.
 */
void tls_thread_free(void) {
    // TODO: Reset the thread_id and data in the corresponding TLS entry.
    int64_t self_id = (int64_t)pthread_self();

    rwlock_acquire_write(&tls_rwlock);

    for (int i = 0; i < MAX_THREADS; i++) {
        if (g_tls[i].thread_id == self_id) {
            g_tls[i].thread_id = -1;
            g_tls[i].data = NULL;
            rwlock_release_write(&tls_rwlock);
            return;
        }
    }
    // If we reach here, the thread was not found
    printf("thread [%ld] hasn't been initialized in the TLS\n", (long)self_id);
    rwlock_release_write(&tls_rwlock);
    exit(2);
}