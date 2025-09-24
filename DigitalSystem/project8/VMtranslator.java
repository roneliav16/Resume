import java.io.*;

public class VMtranslator {
    
    // Processes a single .vm file and writes translated commands to the output file
    public static void processOneFile(File vmFile, BufferedWriter outFile) throws IOException {
        BufferedReader bufferedReader = new BufferedReader(new FileReader(vmFile));
        String line;
        
        // Read each line of the .vm file
        while ((line = bufferedReader.readLine()) != null) {
            // Remove comments from the line
            if (line.contains("//")) {
                String l = line.substring(0, line.indexOf("//"));
                if (l.equals("")) continue;
                line = l;
            }
            line = line.trim();
            if (line.equals("")) continue; // Skip empty lines

            Instruction instruction = Parser.commandType(line);

            // Write the corresponding assembly command based on instruction type
            if (instruction == Instruction.C_ARITHMETIC) {
                Code.writeArithmetic(line, outFile);
            }
            if (instruction == Instruction.C_POP || instruction == Instruction.C_PUSH){
                String arg1 = Parser.arg1(line);
                String arg2 = Parser.arg2(line);
                Code.writePushPop(instruction, arg1, arg2, outFile, vmFile.getName().replace(".vm", ""));
            }
            if (instruction == Instruction.C_LABEL){
                String labelName = Parser.arg1(line);
                Code.writeLabel(labelName, outFile);
            }
            if (instruction == Instruction.C_GOTO){
                String labelName = Parser.arg1(line);
                Code.writeGoto(labelName, outFile);
            }
            if (instruction == Instruction.C_IF){
                String labelName = Parser.arg1(line);
                Code.writeIfGoto(labelName, outFile);
            }

            if (instruction == Instruction.C_CALL){
                String funcName = Parser.arg1(line);
                String nVars = Parser.arg2(line);
                Code.writeCall(funcName, nVars, outFile);
            }
            if (instruction == Instruction.C_FUNCTION){
                String funcName = Parser.arg1(line);
                String nVars = Parser.arg2(line);
                Code.writeFunction(funcName, nVars, outFile);
            }
            if (instruction == Instruction.C_RETURN){
                Code.writeReturn(outFile);
            }

        }

        bufferedReader.close(); // Close the file after processing all lines
    }

    // Processes all .vm files in a directory and writes the combined output to a single .asm file
    public static void processMultiple(File f) throws IOException {
        File[] directoryListing = f.listFiles();
        
        // Create the output .asm file in the same directory
        String [] pathArray = f.getAbsolutePath().split("\\\\");
        String fileName = "";
        int index = pathArray.length - 1;
        
        while (index >= 0) {
            if (!pathArray[index].equals("..")) {
                break;
            }
            index--;
        }
        
        for(int i = 0; i <= index; i++) {
            fileName += pathArray[i] + "\\";
        }
        
        pathArray = fileName.split("\\\\");
        File out_asm = new File(fileName + pathArray[pathArray.length - 1] +  ".asm");
        
        BufferedWriter writer = new BufferedWriter(new FileWriter(out_asm));

        Code.writeLine("@256", writer);
        Code.writeLine("D=A", writer);
        Code.writeLine("@SP", writer);
        Code.writeLine("M=D", writer);
        Code.writeCall("Sys.init", "0", writer);

        if (directoryListing != null) {
            // Process each file in the directory
            for (File child : directoryListing) {
                if(child.isFile()){
                    String full_name = child.getName();
                    int dotIndex = full_name.lastIndexOf('.');
                    
                    // Check if the file is a .vm file before processing
                    if (dotIndex != -1){
                        String type = full_name.substring(dotIndex);
                        if (type.length() > 1 && type.equals(".vm")){
                            processOneFile(child, writer); // Process each .vm file
                            writer.append("/////////////////////////////////////////////////"); // Divider for readability
                            writer.newLine();
                        }
                    }
                }
            }
        }
        
        writer.close(); // Close the output file after processing all .vm files
    }

}
