#include "plugin_common.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>

void log_error(plugin_context_t* context, const char* message) {
    if (context && context->name) {
        fprintf(stderr, "[ERROR][%s] - %s\n", context->name, message);
    } else {
        fprintf(stderr, "[ERROR][Unknown Plugin] - %s\n", message);
    }
}

void log_info(plugin_context_t* context, const char* message) {
    if (context && context->name) {
        fprintf(stderr, "[INFO][%s] - %s\n", context->name, message);
    } else {
        fprintf(stderr, "[INFO][Unknown Plugin] - %s\n", message);
    }
}

void* plugin_consumer_thread(void* arg) {
    plugin_context_t* context = (plugin_context_t*)arg;
    if (!context) return NULL;
    
    while (!context->finished) {
        char* item = consumer_producer_get(context->queue);
        if (!item) continue;
        
        // Check for end signal
        if (strcmp(item, "<END>") == 0) {
            // Pass <END> to next plugin if exists
            if (context->next_place_work) {
                char* end_copy = strdup("<END>");
                if (end_copy) context->next_place_work(end_copy);
            }
            // Signal that we're finished and break
            consumer_producer_signal_finished(context->queue);
            context->finished = 1;
            free(item);
            break;
        }

        // Process the item
        const char* processed = context->process_function(item);
        
        // Pass to next plugin if exists
        if (context->next_place_work && processed) {
            const char* perr = context->next_place_work(processed);
            if (perr) { 
                log_error(context, perr);
                free((char*)processed);
            }
        }
        // If we're the last plugin, we need to free the processed string
        else if (processed && processed != item) {
            free((char*)processed);
        }
        
        // Free the original item
        free(item);
    }
    
    return NULL;
}

plugin_context_t* common_plugin_init(const char* (*process_function)(const char*), const char* name, int queue_size) {
    if (!process_function || !name || queue_size <= 0) {
        return NULL;
    }
    plugin_context_t* context = calloc(1, sizeof(plugin_context_t));
    if (!context) return NULL;
    context->name = name;
    context->process_function = process_function;
    context->next_place_work = NULL;
    context->finished = 0;
    context->queue = malloc(sizeof(consumer_producer_t));
    if (!context->queue) {
        free(context);
        return NULL;
    }
    const char* queue_error = consumer_producer_init(context->queue, queue_size);
    if (queue_error) {
        free(context->queue);
        free(context);

        return NULL;
    }
    if (pthread_create(&context->consumer_thread, NULL, plugin_consumer_thread, context) != 0) {
        consumer_producer_destroy(context->queue);
        free(context->queue);
        free(context);
        return NULL;
    }
    context->initialized = 1;

    return context;
}

const char* common_plugin_fini(plugin_context_t* context) {
    if (!context) {
        return "Plugin context is NULL";
    }
    // Only join thread if it was created
    if (context->initialized) {
        pthread_join(context->consumer_thread, NULL);
    }
    // Only destroy/free queue if it was allocated
    if (context->queue) {
        consumer_producer_destroy(context->queue);
        free(context->queue);
        context->queue = NULL;
    }
    context->initialized = 0;
    free(context);

    return NULL;
}

const char* common_plugin_place_work(plugin_context_t* context, const char* str) {
    if (!context || !context->initialized || !str) {
        return "Plugin not initialized or invalid string";
    }

    return consumer_producer_put(context->queue, str);
}

void common_plugin_attach(plugin_context_t* context, const char* (*next_place_work)(const char*)) {
    if (context) {
        context->next_place_work = next_place_work;
    }
}

const char* common_plugin_wait_finished(plugin_context_t* context) {
    if (!context || !context->initialized) {
        return "Plugin not initialized";
    }
    if (consumer_producer_wait_finished(context->queue) != 0) {
        return "Error waiting for plugin to finish";
    }

    return NULL;
}