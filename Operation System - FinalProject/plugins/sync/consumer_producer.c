#include "consumer_producer.h"
#include <stdlib.h>
#include <string.h>
#include <pthread.h>

const char* consumer_producer_init(consumer_producer_t* queue, int capacity) {
    if (!queue || capacity <= 0) {
        return "Invalid queue or capacity";
    }
    
    // Initialize the queue structure
    queue->items = (char**)malloc(capacity * sizeof(char*));
    if (!queue->items) {
        return "Failed to allocate memory for queue items";
    }
    
    queue->capacity = capacity;
    queue->count = 0;
    queue->head = 0;
    queue->tail = 0;
    if (pthread_mutex_init(&queue->mutex, NULL) != 0) {
        free(queue->items);
        return "Failed to initialize mutex";
    }
    
    // Initialize monitors
    if (monitor_init(&queue->not_full_monitor) != 0) {
        free(queue->items);
        return "Failed to initialize not_full_monitor";
    }
    
    if (monitor_init(&queue->not_empty_monitor) != 0) {
        monitor_destroy(&queue->not_full_monitor);
        free(queue->items);
        return "Failed to initialize not_empty_monitor";
    }
    
    if (monitor_init(&queue->finished_monitor) != 0) {
        monitor_destroy(&queue->not_empty_monitor);
        monitor_destroy(&queue->not_full_monitor);
        free(queue->items);
        return "Failed to initialize finished_monitor";
    }
    
    // Initially signal not_full (queue is empty)
    monitor_signal(&queue->not_full_monitor);
    
    return NULL; 
}

void consumer_producer_destroy(consumer_producer_t* queue) {
    if (!queue) return;
    
    // Free any remaining items
    for (int i = 0; i < queue->count; i++) {
        int index = (queue->head + i) % queue->capacity;
        if (queue->items[index]) {
            free(queue->items[index]);
        }
    }
    
    // Free the items array
    if (queue->items) {
        free(queue->items);
    }
    
    // Destroy monitors
    monitor_destroy(&queue->not_full_monitor);
    monitor_destroy(&queue->not_empty_monitor);
    monitor_destroy(&queue->finished_monitor);
    pthread_mutex_destroy(&queue->mutex);
}

const char* consumer_producer_put(consumer_producer_t* queue, const char* item) {
    if (!queue || !item) {
        return "Invalid queue or item";
    }
    pthread_mutex_lock(&queue->mutex);
    // Wait until queue is not full
    while (1) {
        if (queue->count < queue->capacity) {
            break; // Queue has space
        }
        pthread_mutex_unlock(&queue->mutex);
        monitor_wait(&queue->not_full_monitor);
        pthread_mutex_lock(&queue->mutex);
    }
    queue->items[queue->tail] = (char*)item;
    queue->tail = (queue->tail + 1) % queue->capacity;
    queue->count++;

    // Signal that queue is not empty
    monitor_signal(&queue->not_empty_monitor);

    // If queue is now full, reset not_full_monitor
    if (queue->count == queue->capacity) {
        monitor_reset(&queue->not_full_monitor);
    }
    pthread_mutex_unlock(&queue->mutex);

    return NULL;
}

char* consumer_producer_get(consumer_producer_t* queue) {
    if (!queue) return NULL;
    pthread_mutex_lock(&queue->mutex);
    // Wait until queue is not empty
    while (1) {
        if (queue->count > 0) {
            break; // Queue has items
        }
        pthread_mutex_unlock(&queue->mutex);
        monitor_wait(&queue->not_empty_monitor);
        pthread_mutex_lock(&queue->mutex);
    }
    // Get item from queue
    char* item = queue->items[queue->head];
    queue->items[queue->head] = NULL;
    queue->head = (queue->head + 1) % queue->capacity;
    queue->count--;

    // Signal that queue is not full
    monitor_signal(&queue->not_full_monitor);

    // If queue is now empty, reset not_empty_monitor
    if (queue->count == 0) {
        monitor_reset(&queue->not_empty_monitor);
    }
    pthread_mutex_unlock(&queue->mutex);

    return item;
}

void consumer_producer_signal_finished(consumer_producer_t* queue) {
    if (!queue) return;
    monitor_signal(&queue->finished_monitor);
}

int consumer_producer_wait_finished(consumer_producer_t* queue) {
    if (!queue) return -1;
    return monitor_wait(&queue->finished_monitor);
}