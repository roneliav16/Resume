#include "uthreads.h"

static thread_t threads[MAX_THREAD_NUM]; // Array of thread control blocks (TCBs).
static char thread_stacks[MAX_THREAD_NUM][STACK_SIZE]; //Array of stacks for each thread.

static int ready_queue[MAX_THREAD_NUM]; // Queue for ready threads
static int ready_front = 0;
static int ready_rear = 0;
static int ready_counter = 0;

static int current_tid = -1;
static int total_quantums = 0; 
static int quantum_usecs = 0; // Quantum length in microseconds
// Timer configuration
static struct itimerval timer;
static struct sigaction sa;

// Signal mask for critical sections
static sigset_t timer_mask;

#define JB_SP 6
#define JB_PC 7

typedef unsigned long address_t;

// Helper Methods Section ---------------------------------------------------
static address_t translate_address(address_t addr) { 
    address_t ret;
    asm volatile("xor %%fs:0x30, %0\n"
                 "rol $0x11, %0\n"
                 : "=g" (ret)
                 : "0" (addr));
    return ret;
}

static int mask_timer_signal(void) { // Bloacks the timer signal to prevent preemption during critical sections
    if (sigprocmask(SIG_BLOCK, &timer_mask, NULL) == -1) {
        fprintf(stderr, "system error: masking failed\n");
        exit(1);
    }
    return 0;
}

static int unmask_timer_signal(void) { // Unblocks the timer signal after critical section
    if (sigprocmask(SIG_UNBLOCK, &timer_mask, NULL) == -1) {
        fprintf(stderr, "system error: masking failed\n");
        exit(1);
    }
    return 0;
}

static void add_to_ready_queue(int tid) { // Add thread ID to the ready queue (circular queue implementation with array)
    if (ready_counter < MAX_THREAD_NUM) {
        ready_queue[ready_rear] = tid;
        ready_rear = (ready_rear + 1) % MAX_THREAD_NUM;
        ready_counter++;
    }
}

// Remove a specific tid from the ready queue (if present)
static void remove_tid_from_ready_queue(int tid) 
{
    int count = ready_counter;
    int index = ready_front;

    for (int i = 0; i < count; i++) {
        int curr_tid = ready_queue[index];

        if (curr_tid == tid) {
            for (int j = i; j < count - 1; j++) { // Shift elements left to remove the tid
                ready_queue[(ready_front + j) % MAX_THREAD_NUM] = ready_queue[(ready_front + j + 1) % MAX_THREAD_NUM];
            }

            ready_rear = (ready_rear - 1 + MAX_THREAD_NUM) % MAX_THREAD_NUM;
            ready_counter--;
            break;
        }

        index = (index + 1) % MAX_THREAD_NUM;
    }
}

static int remove_from_ready_queue(void) {
    if (ready_counter == 0) {
        fprintf(stderr, "thread library error: no threads ready in ready queue\n");
        return -1; // No threads ready
    }
    
    int tid = ready_queue[ready_front];
    ready_front = (ready_front + 1) % MAX_THREAD_NUM;
    ready_counter--;
    return tid;
}

static int find_available_tid(void) {
    for (int i = 0; i < MAX_THREAD_NUM; i++) {
        if (threads[i].state == THREAD_UNUSED) {
            return i;
        }
    }

    fprintf(stderr, "thread library error: no available thread ID\n");
    return -1; // No available thread ID
}

static void reset_timer(void) {
    timer.it_value.tv_sec = quantum_usecs / 1000000;
    timer.it_value.tv_usec = quantum_usecs % 1000000;
    timer.it_interval.tv_sec = 0;
    timer.it_interval.tv_usec = 0;
    
    if (setitimer(ITIMER_VIRTUAL, &timer, NULL) == -1) {
        fprintf(stderr, "system error: setitimer failed\n");
        exit(1);
    }
}

void timer_handler(int signum) { // Signal handler for timer expiration
    if(SIGVTALRM == signum) {
        // Timer expired, increment total quantums
        // total_quantums++;
        schedule_next();
    } 
}

void setup_thread(int tid, char *stack, thread_entry_point entry_point) {
    address_t sp = (address_t)stack + STACK_SIZE - sizeof(address_t);
    address_t pc = (address_t)entry_point;
    
    sigsetjmp(threads[tid].env, 1);
    
    threads[tid].env->__jmpbuf[JB_SP] = translate_address(sp);
    threads[tid].env->__jmpbuf[JB_PC] = translate_address(pc);
    
    sigemptyset(&threads[tid].env->__saved_mask);
}

void context_switch(thread_t *current, thread_t *next) { // Perform context switch between current and next thread
    int ret = sigsetjmp(current->env, 1);
    
    if (ret == 0) {         
        siglongjmp(next->env, 1); // Jump to next thread
    }
}

void schedule_next(void) { // Scheduler function to select the next thread to run
    mask_timer_signal();
    
    if (current_tid != -1) { // If there is a current thread, check its state
        if (threads[current_tid].state == THREAD_RUNNING) {
            // Thread was preempted, move to ready queue
            threads[current_tid].state = THREAD_READY;
            add_to_ready_queue(current_tid);
        }
    }
    
    int next_tid = -1;
    int attempts = ready_counter;

    while (attempts-- > 0) { // Try to find a ready thread
        if(ready_counter == 1) { // Only the main thread is ready
            unmask_timer_signal();
            exit(0); // No threads to run, return to main thread
        }
        int tid = remove_from_ready_queue();
    
        if (threads[tid].sleep_until == 0 || threads[tid].sleep_until <= total_quantums) {
            next_tid = tid;
            break;
        } else {
            // Still sleeping — requeue to the end
            add_to_ready_queue(tid);
        }
    }
   
    // Update thread states
    threads[next_tid].state = THREAD_RUNNING;
    threads[next_tid].quantums++;
    total_quantums++; // Increment total quantums
    
    reset_timer(); // Reset timer for the next quantum
    // Perform context switch if needed
    if (current_tid != -1 && current_tid != next_tid) {
        int old_tid = current_tid;
        current_tid = next_tid;
        unmask_timer_signal();
        context_switch(&threads[old_tid], &threads[next_tid]);
    } else {
        current_tid = next_tid;
        unmask_timer_signal();
        siglongjmp(threads[next_tid].env, 1);
    }
}

//  API Methods Section ---------------------------------------------------

int uthread_init(int i_quantum_usecs) {
    if (i_quantum_usecs <= 0) {
        fprintf(stderr, "thread library error: invalid quantum usecs for init\n");
        return -1;
    }
    
    quantum_usecs = i_quantum_usecs;
    
    for (int i = 0; i < MAX_THREAD_NUM; i++) {     // Initialize all threads as unused

        threads[i].state = THREAD_UNUSED;
        threads[i].tid = -1;
        threads[i].quantums = 0;
        threads[i].sleep_until = 0;
        threads[i].entry = NULL;
    }
    
    // Initialize main thread
    threads[0].tid = 0;
    threads[0].state = THREAD_RUNNING;
    threads[0].quantums = 1;
    threads[0].sleep_until = 0;
    threads[0].entry = NULL;
    current_tid = 0;
    
    // Initialize global quantum counter
    total_quantums = 1;
    
    sigemptyset(&timer_mask);
    sigaddset(&timer_mask, SIGVTALRM);
    
    // Set up signal handler
    sa.sa_handler = timer_handler;
    sigemptyset(&sa.sa_mask);
    sa.sa_flags = 0;
    
    if (sigaction(SIGVTALRM, &sa, NULL) == -1) {
        fprintf(stderr, "system error: sigaction failed\n");
        exit(1);
    }
    
    // Start timer
    reset_timer();
    
    return 0;
}

int uthread_spawn(thread_entry_point entry_point) {
    if (entry_point == NULL) {
        fprintf(stderr, "thread library error: entry point is NULL in spawn\n");
        return -1;
    }
    
    mask_timer_signal();
    int tid = find_available_tid();  // Find available thread ID
    if (tid == -1) {
        unmask_timer_signal();
        return -1;
    }
    
    threads[tid].tid = tid;
    threads[tid].state = THREAD_READY;
    threads[tid].quantums = 0;
    threads[tid].sleep_until = 0;
    threads[tid].entry = entry_point;

    setup_thread(tid, thread_stacks[tid], entry_point);
    add_to_ready_queue(tid);
    unmask_timer_signal();

    return tid;
}

int uthread_terminate(int tid) {
    if (tid < 0 || tid >= MAX_THREAD_NUM || threads[tid].state == THREAD_UNUSED) {
        fprintf(stderr, "thread library error: invalid tid in terminate\n");
        return -1;
    }

    mask_timer_signal(); // Lock the timer signal to prevent preemption during termination

    if (tid == 0) {     // special case: terminating main thread
        exit(0); // terminate the entire process
    }

    // Remove from ready queue if not current thread
    if (tid != current_tid) {
        remove_tid_from_ready_queue(tid);
    }

    // Mark thread as unused
    threads[tid].state = THREAD_UNUSED;
    threads[tid].tid = -1;
    threads[tid].quantums = 0;
    threads[tid].sleep_until = 0;
    threads[tid].entry = NULL;

    // If terminating current thread, schedule next
    if (tid == current_tid) {
        current_tid = -1;
        schedule_next();
    }
    unmask_timer_signal();
    return 0;
}

int uthread_block(int tid) {
    if (tid <= 0 || tid >= MAX_THREAD_NUM || threads[tid].state == THREAD_UNUSED) {
        fprintf(stderr, "thread library error: invalid tid in block\n");
        return -1;
    }

    mask_timer_signal();

    if (threads[tid].state == THREAD_BLOCKED){ // already blocked
        unmask_timer_signal();
        return 0;
    }

    // Remove from ready queue if not current thread
    if (tid != current_tid) {
        remove_tid_from_ready_queue(tid);
    }

    threads[tid].state = THREAD_BLOCKED;
    if (tid == current_tid) { 
        current_tid = -1;
        schedule_next();
    }

    unmask_timer_signal();
    return 0;
}

int uthread_resume(int tid) {
    if (tid < 0 || tid >= MAX_THREAD_NUM || threads[tid].state == THREAD_UNUSED) {
        fprintf(stderr, "thread library error: invalid tid in resume\n");
        return -1;
    }
    
    mask_timer_signal();
    
    if (threads[tid].state == THREAD_BLOCKED) { 
        threads[tid].state = THREAD_READY;
        add_to_ready_queue(tid);
    }
    
    unmask_timer_signal();
    return 0;
}

int uthread_sleep(int num_quantums) {
    if (num_quantums <= 0 || current_tid == 0) {
        fprintf(stderr, "thread library error: invalid sleep request (num_quantums <= 0 or main thread)\n");
        return -1;
    }
    
    mask_timer_signal();
    // Set sleep until time
    threads[current_tid].sleep_until = total_quantums + num_quantums;
    // threads[current_tid].quantums++; // Increment quantums for the current thread
    // total_quantums++; // Increment total quantums

    unmask_timer_signal();
    schedule_next();
    
    return 0;
}

int uthread_get_tid(void) {
    return current_tid;
}


int uthread_get_total_quantums(void) {
    return total_quantums;
}

int uthread_get_quantums(int tid) {
    if (tid < 0 || tid >= MAX_THREAD_NUM || threads[tid].state == THREAD_UNUSED) {
        fprintf(stderr, "thread library error: invalid tid in get_quantums\n");
        return -1;
    }
    
    return threads[tid].quantums;
}