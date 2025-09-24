#include "plugin_common.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static plugin_context_t* G = NULL;

static const char* plugin_transform(const char* input) {
    printf("[logger] %s\n", input);
    char* result = malloc(strlen(input) + 1);
    if (result) {
        strcpy(result, input);
    }

    return result;
}

__attribute__((visibility("default")))
const char* plugin_get_name(void) {
    return "logger";
}

__attribute__((visibility("default")))
const char* plugin_init(int queue_size) {
    if (G) return "Already initialized";
    G = common_plugin_init(plugin_transform, "logger", queue_size);
    return G ? NULL : "Init failed";
}

__attribute__((visibility("default")))
const char* plugin_fini(void) {
    if (!G) return "Not initialized";
    const char* err = common_plugin_fini(G);
    G = NULL;
    return err;
}

__attribute__((visibility("default")))
const char* plugin_place_work(const char* str) {
    if (!G) return "Not initialized";
    return common_plugin_place_work(G, str);
}

__attribute__((visibility("default")))
void plugin_attach(const char* (*next_place_work)(const char*)) {
    if (G) common_plugin_attach(G, next_place_work);
}

__attribute__((visibility("default")))
const char* plugin_wait_finished(void) {
    if (!G) return "Not initialized";
    return common_plugin_wait_finished(G);
}
