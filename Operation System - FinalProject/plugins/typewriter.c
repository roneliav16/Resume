#include "plugin_common.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>

static plugin_context_t* G = NULL;

static const char* plugin_transform(const char* input) {
    const char* prefix = "[typewriter] ";
    for (int i = 0; prefix[i]; i++) {
        printf("%c", prefix[i]);
        fflush(stdout);
        usleep(100000); // 100ms delay
    }
    for (int i = 0; input[i]; i++) {
        printf("%c", input[i]);
        fflush(stdout);
        usleep(100000); // 100ms delay
    }
    printf("\n");
    char* result = malloc(strlen(input) + 1);
    if (result) {
        strcpy(result, input);
    }
    return result;
}

__attribute__((visibility("default")))
const char* plugin_get_name(void) {
    return "typewriter";
}

__attribute__((visibility("default")))
const char* plugin_init(int queue_size) {
    if (G) return "Already initialized";
    G = common_plugin_init(plugin_transform, "typewriter", queue_size);
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