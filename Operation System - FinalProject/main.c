// #define _GNU_SOURCE 1
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <dlfcn.h>
#include <limits.h>
#include "plugins/plugin_sdk.h"

// #include <link.h>

typedef struct {
    plugin_init_func_t init; // Initialize the plugin
    plugin_fini_func_t fini; // Finalize the plugin
    plugin_place_work_func_t place_work; // Place work into the plugin's queue
    plugin_attach_func_t attach; // Attach to the next plugin
    plugin_wait_finished_func_t wait_finished; // Wait for the plugin to finish
    plugin_get_name_func_t get_name; // Get the plugin's name
    char* name;
    void* handle;
} plugin_handle_t;

void print_usage() {
    printf("Usage: ./analyzer <queue_size> <plugin1> <plugin2> ... <pluginN>\n");
    printf("Arguments:\n");
    printf("  queue_size    Maximum number of items in each plugin's queue\n");
    printf("  plugin1..N    Names of plugins to load (without .so extension)\n");
    printf("\n");
    printf("Available plugins:\n");
    printf("  logger        - Logs all strings that pass through\n");
    printf("  typewriter    - Simulates typewriter effect with delays\n");
    printf("  uppercaser    - Converts strings to uppercase\n");
    printf("  rotator       - Move every character to the right. Last character moves to the beginning.\n");
    printf("  flipper       - Reverses the order of characters\n");
    printf("  expander      - Expands each character with spaces\n");
    printf("\n");
    printf("Example:\n");
    printf("  ./analyzer 20 uppercaser rotator logger\n");
    printf("  echo 'hello' | ./analyzer 20 uppercaser rotator logger\n");
    printf("  echo '<END>' | ./analyzer 20 uppercaser rotator logger\n");
}

int parse_queue_size(const char* str) {
    char* endptr;
    long val = strtol(str, &endptr, 10); // Converts string to long

    if (endptr == str || *endptr != '\0' || val <= 0 || val > INT_MAX) {
        return -1;
    }
    
    return (int)val;
}

int load_plugin(const char* plugin_name, plugin_handle_t* plugin) {
    char filename[256];  // Construct filename
    snprintf(filename, sizeof(filename), "./output/%s.so", plugin_name);
    
    // Load the shared object
    // plugin->handle = dlmopen(LM_ID_NEWLM, filename, RTLD_NOW | RTLD_LOCAL);
    plugin->handle = dlopen(filename, RTLD_NOW | RTLD_LOCAL);
    if (!plugin->handle) {
        fprintf(stderr, "Error loading plugin %s: %s\n", plugin_name, dlerror());
        return -1;
    }
    
    // Clear any existing error
    dlerror();
    

    // Load function pointers with dlerror clearing and checking
    dlerror();
    plugin->init = (plugin_init_func_t)dlsym(plugin->handle, "plugin_init");
    const char* err = dlerror();
    if (err) {
        fprintf(stderr, "Error loading plugin_init from %s: %s\n", plugin_name, err);
        dlclose(plugin->handle);
        return -1;
    }

    dlerror();
    plugin->fini = (plugin_fini_func_t)dlsym(plugin->handle, "plugin_fini");
    err = dlerror();
    if (err) {
        fprintf(stderr, "Error loading plugin_fini from %s: %s\n", plugin_name, err);
        dlclose(plugin->handle);
        return -1;
    }

    dlerror();
    plugin->place_work = (plugin_place_work_func_t)dlsym(plugin->handle, "plugin_place_work");
    err = dlerror();
    if (err) {
        fprintf(stderr, "Error loading plugin_place_work from %s: %s\n", plugin_name, err);
        dlclose(plugin->handle);
        return -1;
    }

    dlerror();
    plugin->attach = (plugin_attach_func_t)dlsym(plugin->handle, "plugin_attach");
    err = dlerror();
    if (err) {
        fprintf(stderr, "Error loading plugin_attach from %s: %s\n", plugin_name, err);
        dlclose(plugin->handle);
        return -1;
    }

    dlerror();
    plugin->wait_finished = (plugin_wait_finished_func_t)dlsym(plugin->handle, "plugin_wait_finished");
    err = dlerror();
    if (err) {
        fprintf(stderr, "Error loading plugin_wait_finished from %s: %s\n", plugin_name, err);
        dlclose(plugin->handle);
        return -1;
    }

    dlerror();
    plugin->get_name = (plugin_get_name_func_t)dlsym(plugin->handle, "plugin_get_name");
    err = dlerror();
    if (err) {
        fprintf(stderr, "Error loading plugin_get_name from %s: %s\n", plugin_name, err);
        dlclose(plugin->handle);
        return -1;
    }

    // Store plugin name
    plugin->name = malloc(strlen(plugin_name) + 1);
    if (!plugin->name) {
        fprintf(stderr, "Error allocating memory for plugin name\n");
        dlclose(plugin->handle);
        return -1;
    }

    strcpy(plugin->name, plugin_name);

    return 0;
}

void cleanup_plugins(plugin_handle_t* plugins, int count) {
    for (int i = 0; i < count; i++) {
        if (plugins[i].fini) {
            plugins[i].fini();
        }
        if (plugins[i].name) {
            free(plugins[i].name);
        }
        if (plugins[i].handle) {
            dlclose(plugins[i].handle);
        }
    }
}

int main(int argc, char* argv[]) {
    // Parse command-line arguments
    if (argc < 3) {
        fprintf(stderr, "Error: Insufficient arguments\n");
        print_usage();
        return 1;
    }
    
    int queue_size = parse_queue_size(argv[1]);
    if (queue_size == -1) {
        fprintf(stderr, "Error: Invalid queue size\n");
        print_usage();
        return 1;
    }
    
    int plugin_count = argc - 2;
    plugin_handle_t* plugins = malloc(plugin_count * sizeof(plugin_handle_t));
    if (!plugins) {
        fprintf(stderr, "Error: Failed to allocate memory for plugins\n");
        return 1;
    }
    
    memset(plugins, 0, plugin_count * sizeof(plugin_handle_t));  // Initialize plugins array

    for (int i = 0; i < plugin_count; i++) {  // Load each plugin
        if (load_plugin(argv[i + 2], &plugins[i]) != 0) {
            cleanup_plugins(plugins, i);
            free(plugins);
            print_usage();
            return 1;
        }
    }
    
    for (int i = 0; i < plugin_count; i++) {
        const char* error = plugins[i].init(queue_size);
        if (error) {
            fprintf(stderr, "Error initializing plugin %s\n", plugins[i].name);
            cleanup_plugins(plugins, plugin_count);
            free(plugins);
            return 2;
        }
    }
    
    // Attach plugins together
    // Each plugin's attach function receives a function pointer to the next plugin's place_work (with correct signature)
    for (int i = 0; i < plugin_count - 1; i++) {
        plugins[i].attach((const char* (*)(const char*))plugins[i + 1].place_work);
    }
    // Last plugin is not attached to anything

    // Read input from STDIN
    char input_line[1025]; // 1024 + 1 for null terminator
    while (fgets(input_line, sizeof(input_line), stdin)) {
        // Remove trailing newline if present
        size_t len = strlen(input_line);
        if (len > 0 && input_line[len - 1] == '\n') {
            input_line[len - 1] = '\0';
        }
        // Duplicate the input line to ensure heap allocation
        char* input_copy = strdup(input_line);
        if (!input_copy) {
            fprintf(stderr, "Error: Failed to allocate memory for input string\n");
            break;
        }
        // Send to first plugin
        const char* error = plugins[0].place_work(input_copy);
        if (error) {
            free(input_copy);
            fprintf(stderr, "Error placing work in first plugin: %s\n", error);
            break;
        }
        // Check for end signal
        if (strcmp(input_line, "<END>") == 0) {
            break;
        }
    }
    
    // Wait for plugins to finish
    for (int i = 0; i < plugin_count; i++) {
        const char* error = plugins[i].wait_finished();
        if (error) {
            fprintf(stderr, "Error waiting for plugin %s to finish: %s\n", plugins[i].name, error);
        }
    }
    
    // Cleanup
    cleanup_plugins(plugins, plugin_count);
    free(plugins);
    
    // Finalize
    printf("Pipeline shutdown complete\n");
    return 0;
}