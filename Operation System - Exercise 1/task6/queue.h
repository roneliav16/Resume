typedef struct node {
    int data;
    struct node* next;
} node;

typedef struct queue {
    struct node* head;
    struct node* tail;
    int size;
} queue;

void queue_init(queue* q);


void queue_push(queue* q, int data);

int queue_pop(queue* q);


int queue_size(queue* q);

void queue_destroy(queue* q);
