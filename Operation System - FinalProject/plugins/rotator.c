#include "plugin_common.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static plugin_context_t* G = NULL;

static const char* plugin_transform(const char* input) {
    int str_len = strlen(input);
    if (str_len == 0) {
        char* result = malloc(1);
        if (result) result[0] = '\0';
        return result;
    }
    char* result = malloc(str_len + 1);
    if (!result) return NULL;
    result[0] = input[str_len - 1];
    for (int i = 0; i < str_len - 1; i++) {
        result[i + 1] = input[i];
    }
    result[str_len] = '\0';
    return result;
}

__attribute__((visibility("default")))
const char* plugin_get_name(void) {
    return "rotator";
}

__attribute__((visibility("default")))
const char* plugin_init(int queue_size) {
    if (G) return "Already initialized";
    G = common_plugin_init(plugin_transform, "rotator", queue_size);
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