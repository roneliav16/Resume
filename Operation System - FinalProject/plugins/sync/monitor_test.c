#include "monitor.h"
#include <stdio.h>
#include <pthread.h>
#include <unistd.h>
#include <assert.h>

static monitor_t test_monitor;
static int signal_received = 0;

void* waiter_thread(void* arg) {
    printf("Waiter: Starting to wait...\n");
    int result = monitor_wait(&test_monitor);
    if (result == 0) {
        signal_received = 1;
        printf("Waiter: Signal received!\n");
    } else {
        printf("Waiter: Error waiting for signal\n");
    }
    
    return NULL;
}

void* signaler_thread(void* arg) {
    sleep(1); // Wait 1 second
    printf("Signaler: Sending signal...\n");
    monitor_signal(&test_monitor);
    return NULL;
}

int main() {
    printf("Starting monitor tests...\n");
    
    // Test 1: Basic initialization and cleanup
    printf("\nTest 1: Monitor initialization and cleanup\n");
    assert(monitor_init(&test_monitor) == 0);
    assert(monitor_destroy(&test_monitor) == 0);
    printf("Test 1: PASSED\n");
    
    // Test 2: Signal before wait (stateful behavior)
    printf("\nTest 2: Signal before wait\n");
    assert(monitor_init(&test_monitor) == 0);
    monitor_signal(&test_monitor);
    assert(monitor_wait(&test_monitor) == 0); // Should return immediately
    assert(monitor_destroy(&test_monitor) == 0);
    printf("Test 2: PASSED\n");
    
    // Test 3: Reset functionality
    printf("\nTest 3: Reset functionality\n");
    assert(monitor_init(&test_monitor) == 0);
    monitor_signal(&test_monitor);
    monitor_reset(&test_monitor);

    // We create a waiter thread and check that it doesn't wake up on its own
    signal_received = 0;
    pthread_t t1_waiter;
    assert(pthread_create(&t1_waiter, NULL, waiter_thread, NULL) == 0);

    // Wait a short time to allow the waiter to enter wait (still without a new signal)
    usleep(3000 * 1000); // 3 seconds

    assert(signal_received == 0); 

    // Now we send a new signal, expecting the thread to wake up
    monitor_signal(&test_monitor); // Should wait for 3 seconds
    pthread_join(t1_waiter, NULL);

    assert(signal_received == 1); // Woke up only after the second signal
    assert(monitor_destroy(&test_monitor) == 0);
    printf("Test 3: PASSED\n");

    // Test 4: Multi-threaded signaling
    printf("\nTest 4: Multi-threaded signaling\n");
    assert(monitor_init(&test_monitor) == 0);
    signal_received = 0;
    
    pthread_t waiter, signaler;
    assert(pthread_create(&waiter, NULL, waiter_thread, NULL) == 0);
    assert(pthread_create(&signaler, NULL, signaler_thread, NULL) == 0);

    assert(pthread_join(waiter, NULL) == 0);
    assert(pthread_join(signaler, NULL) == 0);

    assert(signal_received == 1);
    assert(monitor_destroy(&test_monitor) == 0);
    printf("Test 4: PASSED\n");
    
    printf("\nAll monitor tests PASSED!\n");
    return 0;
}