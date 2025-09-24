import java.io.*;

public class JackAnalyzer { 

    // Processes a single .xml file and writes translated commands to the output file
    public static void processOneFile(File jackFile, BufferedWriter outFile) throws IOException {
        CompilationEngine ce = new CompilationEngine(outFile, jackFile);
        ce.compileClass();
        ce.tokenizer.close(); // close the file

        // Those 2 functions check if there are some missing subroutiness/classes in the files.
        // ce.checkClasses(); 
        // ce.checkFunctions();
        
    //This part of code is relevant to the first version in the project. 
            // while (tokenizer.advance()) {
            //     String tokenType = tokenizer.tokenType().name().toLowerCase();
            //     if (tokenType.equals("stringconstant")) {
            //         tokenType = "stringConstant";
            //     }
            //     if (tokenType.equals("integerconstant")) {
            //         tokenType = "integerConstant";
            //     }
            //     outFile.write("<" + tokenType + "> ");
            //     outFile.write(tokenizer.currentToken);
            //     outFile.write(" </" + tokenType + ">");
            //     outFile.newLine();
            // }
    }

    // Processes all .jack files in a directory and writes to multiple xml files
    public static void processMultiple(File f) throws IOException {
        File[] directoryListing = f.listFiles();

        if (directoryListing != null) {
            // Process each file in the directory
            for (File child : directoryListing) {
                if(child.isFile()){
                    String full_name = child.getName();
                    int dotIndex = full_name.lastIndexOf('.');

                    // Check if the file is a .jack file before processing
                    if (dotIndex != -1){
                        String type = full_name.substring(dotIndex);
                        if (type.length() > 1 && type.equals(".jack")){

                            String absFile = child.getAbsolutePath();

                            // Extract the file name without the extension and append .xml
                            String fileMameWithoutExtending = child.getName().substring(0, dotIndex) + ".xml";

                            // Create a new File object for the .asm file in the same directory as the input file
                            File out_asm = new File(absFile.substring(0, absFile.lastIndexOf("\\")) + "\\" + fileMameWithoutExtending);

                            // Create a FileWriter to write to the .asm file (true indicates append mode)
                            FileWriter fileWriter = new FileWriter(out_asm, true);

                            // Wrap the FileWriter in a BufferedWriter to improve efficiency
                            BufferedWriter writer = new BufferedWriter(fileWriter);

                            processOneFile(child, writer); // Process each .vm file
                            
                            writer.close(); // Close the output file after processing the .jack file
                        }
                    }
                }
            }
        }
    }
}
