// -------------------------------bulding the queue-------------------------------
#include "queue.h"
#include <stdlib.h>

void queue_init(queue* q) {
    q->head = NULL;
    q->tail = NULL;
    q->size = 0;
}

void queue_push(queue* q, int data) {
    node* new_node = (node*)malloc(sizeof(node));
    if (new_node == NULL) {
        // Handle malloc failure: do not push, or handle error as needed
        return;
    }
    new_node->data = data;
    new_node->next = NULL;
    if (q->tail) {
        q->tail->next = new_node;
    } else {
        q->head = new_node;
    }
    q->tail = new_node;
    q->size++;
}

int queue_pop(queue* q) {
    if (q->head == NULL) {
        return -1; // Queue is empty
    }
    node* temp = q->head;
    int data = temp->data;
    q->head = q->head->next;
    if (q->head == NULL) {
        q->tail = NULL;
    }
    free(temp);
    q->size--;
    return data;
}
int queue_size(queue* q) {
    return q->size;
}
void queue_destroy(queue* q) {
    while (q->head != NULL) {
        node* temp = q->head;
        q->head = q->head->next;
        free(temp);
    }
    q->tail = NULL;
    q->size = 0;
}

