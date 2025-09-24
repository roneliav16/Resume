import java.io.BufferedWriter; // Import for efficient writing of text files
import java.io.File; // Import to create and manage file system objects
import java.io.FileWriter; // Import to write characters to files
import java.io.IOException; // Import to handle input/output exceptions
import java.util.ArrayList; // Import for ArrayList, though it is not used in this part of the code

// Main class to process files and directories
public class Main {
    public static void main(String[] args) throws IOException {
        // Define the relative path for the directory or file to be processed
        String path  = args[0];
        
        // Create a File object for the specified path
        File f = new File(path);
        
        // Call the method to process the file or directory
        processFiles(f);
    }

    public static void processFiles(File f) throws IOException {
        // Get the absolute path of the file or directory
        String abs = f.getAbsolutePath();
        
        // Check if the File object is a directory
        if (f.isDirectory()) {
            // Process all files in the directory using the VMtranslator class
            VMtranslator.processMultiple(f);
        }
        
        // Check if the File object is a file
        if (f.isFile()) {
            // Generate a corresponding .asm file from the input file
            String absFile = f.getAbsolutePath();
            
            // Extract the file name without the extension and append .asm
            String fileMameWithoutExtending = f.getName().substring(0, f.getName().lastIndexOf('.')) + ".asm";
            
            // Create a new File object for the .asm file in the same directory as the input file
            File out_asm = new File(absFile.substring(0, absFile.lastIndexOf("\\")) + "\\" + fileMameWithoutExtending);
            
            // Create a FileWriter to write to the .asm file (true indicates append mode)
            FileWriter fileWriter = new FileWriter(out_asm, true);
            
            // Wrap the FileWriter in a BufferedWriter to improve efficiency
            BufferedWriter writer = new BufferedWriter(fileWriter);
            
            // Process the input file and write its content to the .asm file
            VMtranslator.processOneFile(f, writer);
            
            // Close the BufferedWriter to ensure all data is written and resources are released
            writer.close();
        }
    }
}
