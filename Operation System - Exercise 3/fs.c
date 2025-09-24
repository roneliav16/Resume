#include "fs.h"
#include <stdlib.h>
#include <errno.h>

// Global variables
static int disk_fd = -1;
static superblock sb;
static unsigned char bitmap[MAX_BLOCKS/8];
static int is_mounted = 0;

// Helper function
static int find_inode(const char* filename);
static int find_free_inode(void);
static int find_free_block(void);
static void mark_block_used(int block_num);
static void mark_block_free(int block_num);
static int is_block_used(int block_num);
static void read_inode(int inode_num, inode* target);
static void write_inode(int inode_num, const inode* source);
static int read_superblock(void);
static int write_superblock(void);
static int read_bitmap(void);
static int write_bitmap(void);

int fs_format(const char* disk_path) {
    if (!disk_path) { // check if disk_path is NULL
        return -1; 
    }

    // Create/overwrite the disk image file
    disk_fd = open(disk_path, O_RDWR | O_CREAT | O_TRUNC, 0644);
    if (disk_fd < 0) { // check if file creation failed
        return -1;
    }
    
    // Initialize the superblock
    sb.total_blocks = MAX_BLOCKS;
    sb.block_size = BLOCK_SIZE;
    sb.free_blocks = MAX_BLOCKS - 10; // Subtract metadata blocks (0,1,2-9)
    sb.total_inodes = MAX_FILES;
    sb.free_inodes = MAX_FILES;
    
    // Write superblock to block 0
    if (lseek(disk_fd, 0, SEEK_SET) < 0 || write(disk_fd, &sb, sizeof(superblock)) != sizeof(superblock)) {  
        close(disk_fd);
        return -1;
    }
    
    // Initialize bitmap - mark metadata blocks as used
    memset(bitmap, 0, sizeof(bitmap));
    for (int i = 0; i < 10; i++) {
        mark_block_used(i);
    }
    
    // Write bitmap to block 1
    unsigned char bitmap_block[BLOCK_SIZE];

    memset(bitmap_block, 0, BLOCK_SIZE);
    memcpy(bitmap_block, bitmap, sizeof(bitmap));
    if (lseek(disk_fd, BLOCK_SIZE, SEEK_SET) < 0 || write(disk_fd, bitmap_block, BLOCK_SIZE) != BLOCK_SIZE) {
        close(disk_fd);
        return -1;
    }
    
    // Initialize inode table (blocks 2-9)
    inode empty_inode;
    memset(&empty_inode, 0, sizeof(inode)); // Sets all fields to zero
    empty_inode.used = 0;
    
    if (lseek(disk_fd, 2 * BLOCK_SIZE, SEEK_SET) < 0) {
        close(disk_fd);
        return -1;
    }
    
    for (int i = 0; i < MAX_FILES; i++) {
        if (write(disk_fd, &empty_inode, sizeof(inode)) != sizeof(inode)) {
            close(disk_fd);
            return -1;
        }
    }
    
    // Close the file
    close(disk_fd);
    disk_fd = -1;
    
    return 0;
}

int fs_mount(const char* disk_path) {
    if (!disk_path || is_mounted) return -1; // Check if disk_path is NULL or already mounted
    
    // Open the disk file
    disk_fd = open(disk_path, O_RDWR);
    if (disk_fd < 0) { // check if file opening failed
        return -1;
    }
    
    // Read and validate superblock
    if (read_superblock() != 0) {
        close(disk_fd);
        disk_fd = -1;
        return -1;
    }
    
    // Basic validation of superblock
    if (sb.total_blocks != MAX_BLOCKS || sb.block_size != BLOCK_SIZE || sb.total_inodes != MAX_FILES) {
        close(disk_fd);
        disk_fd = -1;
        return -1;
    }
    
    // Read bitmap
    if (read_bitmap() != 0) {
        close(disk_fd);
        disk_fd = -1;
        return -1;
    }
    
    is_mounted = 1;
    return 0;
}

void fs_unmount(void) {
    if (!is_mounted || disk_fd < 0) return;
    
    // Write any pending changes
    write_superblock();
    write_bitmap();
    
    // Close the disk file
    close(disk_fd);
    disk_fd = -1;
    is_mounted = 0;
}

int fs_create(const char* filename) {
    if (!filename || !is_mounted || strlen(filename) > MAX_FILENAME) { // check if filename is NULL or too long and if filesystem is mounted
        return -3;
    }
    
    // Check if file already exists
    if (find_inode(filename) >= 0) { 
        return -1;
    }
    
    // Find a free inode
    int inode_num = find_free_inode();
    if (inode_num < 0) { // check if no free inodes are available
        return -2;
    }
    
    // Initialize the new inode
    inode new_inode;
    memset(&new_inode, 0, sizeof(inode));
    new_inode.used = 1;
    strncpy(new_inode.name, filename, MAX_FILENAME);
    new_inode.name[MAX_FILENAME] = '\0'; // Ensure null termination
    new_inode.size = 0;
    for (int i = 0; i < MAX_DIRECT_BLOCKS; i++) {
        new_inode.blocks[i] = -1; // -1 indicates unused block pointer
    }
    
    // Write inode to disk
    write_inode(inode_num, &new_inode);
    
    // Update superblock
    sb.free_inodes--;
    write_superblock();
    
    return 0;
}

int fs_delete(const char* filename) {
    if (!filename || !is_mounted) { // check if filename is NULL and if filesystem is not mounted
        return -2;
    }
    
    // Find the file's inode
    int inode_num = find_inode(filename);
    if (inode_num < 0) { // check if file does not exist
        return -1;
    }
    
    // Read the inode
    inode file_inode;
    read_inode(inode_num, &file_inode);
    
    // Free all allocated blocks
    for (int i = 0; i < MAX_DIRECT_BLOCKS && file_inode.blocks[i] != -1; i++) {
        mark_block_free(file_inode.blocks[i]);
        sb.free_blocks++;
    }
    
    // Mark inode as free
    memset(&file_inode, 0, sizeof(inode));
    file_inode.used = 0; // double check for changing the used flag to 0
    write_inode(inode_num, &file_inode);
    
    // Update superblock
    sb.free_inodes++;
    write_superblock();
    write_bitmap();
    
    return 0;
}

int fs_list(char filenames[][MAX_FILENAME], int max_files) {
    if (!filenames || max_files <= 0 || !is_mounted) { // check if filenames is NULL, max_files is non-positive, and if filesystem is not mounted
        return -1;
    }
    
    int count = 0;
    inode current_inode;
    
    for (int i = 0; i < MAX_FILES && count < max_files; i++) {
        read_inode(i, &current_inode);
        if (current_inode.used) {
            strncpy(filenames[count], current_inode.name, MAX_FILENAME);
            count++;
        }
    }
    
    return count;
}

int fs_write(const char* filename, const void* data, int size) {
    if (!filename || !data || size < 0 || !is_mounted) { // check if filename or data is NULL, size is negative, and if filesystem is not mounted
        return -3;
    }
    
    // Find the file's inode
    int inode_num = find_inode(filename);
    if (inode_num < 0) { // check if file does not exist
        return -1;
    }
    
    // Calculate blocks needed
    int blocks_needed = (size + BLOCK_SIZE - 1) / BLOCK_SIZE;
    if (blocks_needed > MAX_DIRECT_BLOCKS) {
        return -2; // File too large
    }
    
    // Check if we have enough free blocks
    if (blocks_needed > sb.free_blocks) {
        return -2;
    }
    
    // Read the current inode
    inode file_inode;
    read_inode(inode_num, &file_inode);
    
    // Free previously allocated blocks
    for (int i = 0; i < MAX_DIRECT_BLOCKS && file_inode.blocks[i] != -1; i++) {
        mark_block_free(file_inode.blocks[i]);
        sb.free_blocks++;
        file_inode.blocks[i] = -1;
    }
    
    // Allocate new blocks
    for (int i = 0; i < blocks_needed; i++) {
        int block_num = find_free_block();
        if (block_num < 0) { // check if no free blocks are available (Should not happen - recheck)
            return -2; 
        }

        file_inode.blocks[i] = block_num;
        mark_block_used(block_num);
        sb.free_blocks--;
    }
    
    // Write data to blocks
    const char* data_ptr = (const char*)data;
    int remaining = size;
    
    for (int i = 0; i < blocks_needed; i++) {
        int write_size = 0;

        if (remaining > BLOCK_SIZE) {
            write_size = BLOCK_SIZE;
        } else {
            write_size = remaining;
        }

        char block_buffer[BLOCK_SIZE];
        
        memset(block_buffer, 0, BLOCK_SIZE);
        memcpy(block_buffer, data_ptr, write_size);
        
        if (lseek(disk_fd, file_inode.blocks[i] * BLOCK_SIZE, SEEK_SET) < 0 || write(disk_fd, block_buffer, BLOCK_SIZE) != BLOCK_SIZE) { 
            return -3;
        }
        
        data_ptr += write_size;
        remaining -= write_size;
    }
    
    // Update inode
    file_inode.size = size;
    write_inode(inode_num, &file_inode);
    
    // Update filesystem metadata
    write_superblock();
    write_bitmap();
    
    return 0;
}

int fs_read(const char* filename, void* buffer, int size) {
    if (!filename || !buffer || size <= 0 || !is_mounted) { // check if filename or buffer is NULL, size is non-positive, and if filesystem is not mounted
        return -3;
    }
    
    // Find the file's inode
    int inode_num = find_inode(filename);
    if (inode_num < 0) { // check if file does not exist
        return -1;
    }
    
    // Read the inode
    inode file_inode;
    read_inode(inode_num, &file_inode);
    
    // Determine how much to read
    int bytes_to_read;

    if (size < file_inode.size) {
        bytes_to_read = size;
    } else {
        bytes_to_read = file_inode.size;
    }

    if (bytes_to_read == 0) { // If the file is empty, return 0
        return 0;
    }
    
    // Read data from blocks
    char* buffer_ptr = (char*)buffer;
    int remaining = bytes_to_read;
    int blocks_to_read = (bytes_to_read + BLOCK_SIZE - 1) / BLOCK_SIZE; // Calculate how many blocks we need to read
    
    for (int i = 0; i < blocks_to_read && i < MAX_DIRECT_BLOCKS; i++) {
        if (file_inode.blocks[i] == -1) { // If the block is not allocated, we can't read from it
            break;
        }

        char block_buffer[BLOCK_SIZE];

        if (lseek(disk_fd, file_inode.blocks[i] * BLOCK_SIZE, SEEK_SET) < 0 || read(disk_fd, block_buffer, BLOCK_SIZE) != BLOCK_SIZE) {
            return -3;
        }
        
        int copy_size = 0;
        
        if (remaining > BLOCK_SIZE) {
            copy_size = BLOCK_SIZE;
        } else {
            copy_size = remaining;
        }

        memcpy(buffer_ptr, block_buffer, copy_size);
        
        buffer_ptr += copy_size;
        remaining -= copy_size;
    }
    
    return bytes_to_read;
}

// Helper function implementations ------------------------------------

static int find_inode(const char* filename) { // Finds the inode number for a given filename)
    inode current_inode;
    
    for (int i = 0; i < MAX_FILES; i++) {
        read_inode(i, &current_inode);
        if (current_inode.used && strcmp(current_inode.name, filename) == 0) {
            return i;
        }
    }

    return -1;
}

static int find_free_inode(void) {
    inode current_inode;
    
    for (int i = 0; i < MAX_FILES; i++) {
        read_inode(i, &current_inode);
        if (!current_inode.used) {
            return i;
        }
    }

    return -1;
}

static int find_free_block(void) {
    for (int i = 10; i < MAX_BLOCKS; i++) { // Start from block 10(after metadata)
        if (!is_block_used(i)) {
            return i;
        }
    }

    return -1; // No free blocks available
}

static void mark_block_used(int block_num) {
    if (block_num >= 0 && block_num < MAX_BLOCKS) {
        bitmap[block_num / 8] |= (1 << (block_num % 8));
    }
}

static void mark_block_free(int block_num) {
    if (block_num >= 0 && block_num < MAX_BLOCKS) {
        bitmap[block_num / 8] &= ~(1 << (block_num % 8));
    }
}

static int is_block_used(int block_num) {
    if (block_num < 0 || block_num >= MAX_BLOCKS) { // check if block_num is out of bounds
        return 1; 
    }

    return (bitmap[block_num / 8] & (1 << (block_num % 8))) != 0; // Check if the bit is set
}

static void read_inode(int inode_num, inode* target) {
    off_t offset = 2 * BLOCK_SIZE + inode_num * sizeof(inode); 
    lseek(disk_fd, offset, SEEK_SET);
    read(disk_fd, target, sizeof(inode));
}

static void write_inode(int inode_num, const inode* source) {
    off_t offset = 2 * BLOCK_SIZE + inode_num * sizeof(inode);
    lseek(disk_fd, offset, SEEK_SET);
    write(disk_fd, source, sizeof(inode));
}

static int read_superblock(void) {
    if (lseek(disk_fd, 0, SEEK_SET) < 0 || read(disk_fd, &sb, sizeof(superblock)) != sizeof(superblock)) {
        return -1;
    }

    return 0;
}

static int write_superblock(void) {
    if (lseek(disk_fd, 0, SEEK_SET) < 0 || write(disk_fd, &sb, sizeof(superblock)) != sizeof(superblock)) {
        return -1;
    }

    return 0;
}

static int read_bitmap(void) {
    unsigned char bitmap_block[BLOCK_SIZE];

    if (lseek(disk_fd, BLOCK_SIZE, SEEK_SET) < 0 || read(disk_fd, bitmap_block, BLOCK_SIZE) != BLOCK_SIZE) {
        return -1;
    }

    memcpy(bitmap, bitmap_block, sizeof(bitmap));
    return 0;
}

static int write_bitmap(void) {
    unsigned char bitmap_block[BLOCK_SIZE];
    
    memset(bitmap_block, 0, BLOCK_SIZE);
    memcpy(bitmap_block, bitmap, sizeof(bitmap));
    if (lseek(disk_fd, BLOCK_SIZE, SEEK_SET) < 0 || write(disk_fd, bitmap_block, BLOCK_SIZE) != BLOCK_SIZE) {
        return -1;
    }

    return 0;
}