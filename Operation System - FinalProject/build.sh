#!/bin/bash

# Exit on any error
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[BUILD]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Create output directory
print_status "Creating output directory..."
mkdir -p output

# Build main application
print_status "Building main application..."
gcc -o output/analyzer main.c -ldl -lpthread || {
    print_error "Failed to build main application"
    exit 1
}

# Build synchronization components
print_status "Building synchronization components..."
gcc -c plugins/sync/monitor.c -o plugins/sync/monitor.o -fPIC || {
    print_error "Failed to build monitor.o"
    exit 1
}

gcc -c plugins/sync/consumer_producer.c -o plugins/sync/consumer_producer.o -fPIC || {
    print_error "Failed to build consumer_producer.o"
    exit 1
}

# Build plugin common infrastructure
print_status "Building plugin common infrastructure..."
gcc -c plugins/plugin_common.c -o plugins/plugin_common.o -fPIC || {
    print_error "Failed to build plugin_common.o"
    exit 1
}

# Build all plugins
plugins=(logger typewriter uppercaser rotator flipper expander)

for plugin_name in "${plugins[@]}"; do
    print_status "Building plugin: $plugin_name"
    gcc -fPIC -shared -o output/${plugin_name}.so \
        plugins/${plugin_name}.c \
        plugins/plugin_common.o \
        plugins/sync/monitor.o \
        plugins/sync/consumer_producer.o \
        -ldl -lpthread || {
        print_error "Failed to build $plugin_name"
        exit 1
    }
done

# Build test utilities (optional)
print_status "Building test utilities..."
gcc -o output/monitor_test plugins/sync/monitor_test.c plugins/sync/monitor.o -lpthread || {
    print_warning "Failed to build monitor_test (this is optional)"
}

gcc -o output/consumer_producer_test plugins/sync/consumer_producer_test.c plugins/sync/consumer_producer.o plugins/sync/monitor.o -lpthread || {
    print_warning "Failed to build consumer_producer_test (this is optional)"
}

# Clean up object files
print_status "Cleaning up object files..."
rm -f plugins/sync/monitor.o
rm -f plugins/sync/consumer_producer.o  
rm -f plugins/plugin_common.o

print_status "Build completed successfully!"
print_status "Executable: output/analyzer"
print_status "Plugins: output/*.so"