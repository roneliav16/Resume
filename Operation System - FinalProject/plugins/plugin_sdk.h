#ifndef PLUGIN_SDK_H
#define PLUGIN_SDK_H

/**
 * Get the plugin's name
 * @return The plugin's name (should not be modified or freed)
 */
const char* plugin_get_name(void);


/**
 * Initialize the plugin with the specified queue size
 * @param queue_size Maximum number of items that can be queued
 * @return NULL on success, error message on failure
 */
struct plugin_context_t;
typedef struct plugin_context_t plugin_context_t;
const char* plugin_init(int queue_size);

/**
 * Finalize the plugin - terminate thread gracefully
 * @param context Plugin context
 * @return NULL on success, error message on failure
 */
const char* plugin_fini(void);

/**
 * Place work (a string) into the plugin's queue
 * @param context Plugin context
 * @param str The string to process (plugin takes ownership if it allocates new memory)
 * @return NULL on success, error message on failure
 */
const char* plugin_place_work(const char* str);

/**
 * Attach this plugin to the next plugin in the chain
 * @param context Plugin context
 * @param next_place_work Function pointer to the next plugin's place_work function
 * @param next_context Context of the next plugin
 */
void plugin_attach(const char* (*next_place_work)(const char*));

/**
 * Wait until the plugin has finished processing all work and is ready to shutdown
 * @param context Plugin context
 * @return NULL on success, error message on failure
 */
const char* plugin_wait_finished(void);


// Function pointer types for convenience in dynamic loading
typedef const char* (*plugin_init_func_t)(int);
typedef const char* (*plugin_fini_func_t)(void);
typedef const char* (*plugin_place_work_func_t)(const char*);
typedef void (*plugin_attach_func_t)(const char* (*)(const char*));
typedef const char* (*plugin_wait_finished_func_t)(void);
typedef const char* (*plugin_get_name_func_t)(void);

#endif