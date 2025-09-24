import java.io.*;

// The HackAssembler class processes Hack assembly files, converting them into binary machine code
public class HackAssembler {
    SymbolTable symbolTable; // Symbol table for storing variable and label addresses
    String inputPath; // Path to the input assembly file

    // Constructor: Initializes the symbol table and processes the input file
    public HackAssembler(String path) throws IOException {
        symbolTable = new SymbolTable();
        this.inputPath = path;
        processFile(); // Starts the file processing
    }

    // Processes the assembly file by reading and parsing the lines
    public void processFile() throws IOException {
        // Checks if the input file has the .asm extension
        if (!isAsmFile(inputPath)){
            return;
        }

        // Extracts the base location of the file (without the .asm extension)
        int end_path_index = inputPath.lastIndexOf(".asm");
        String location = inputPath.substring(0, end_path_index);

        // Initializes file reading
        File my_file = new File(inputPath);
        FileReader fr = new FileReader(my_file);
        BufferedReader bufferedReader = new BufferedReader(fr);
        String line1;
        int count = 0;

        // Reads the file line by line
        while ((line1 = bufferedReader.readLine()) != null) {
            // Strips comments (anything after "//")
            if(line1.contains("//")) {
                String l = line1.substring(0, line1.indexOf("//"));
                if (l.equals("")) {
                    continue;
                } else {
                    line1 = l;
                }
            }
            String line = "";
            // Removes spaces from the line
            for(char c: line1.toCharArray()) {
                if (c != ' ') {
                    line += c;
                }
            }
            if (line.equals("")) {
                continue;
            }

            // Handles label definitions (lines starting with "(")
            if (line.charAt(0) == '(') {
                symbolTable.put(line.substring(1, line.length() - 1), count);
                count--; // Label lines are not actual instructions
            }
            count++; // Increment instruction counter
        }
        bufferedReader.close(); // Close the reader after first pass
        secondPass(location); // Start the second pass for instruction translation
    }

    // The second pass translates the assembly instructions into machine code and writes them to a .hack file
    private void secondPass(String location) throws IOException {
        // Initializes file reading for second pass
        File my_file = new File(inputPath);
        FileReader fr = new FileReader(my_file);
        BufferedReader bufferedReader = new BufferedReader(fr);

        // Prepares output file for the binary machine code
        File outFile = new File(location + ".hack");
        FileWriter writer = new FileWriter(outFile, false);
        
        String line1;
        String binary_line = "";
        int varCounter = 16; // Variable address counter starts at 16

        // Processes the file line by line
        while ((line1 = bufferedReader.readLine()) != null) {
            // Strips comments
            if(line1.contains("//")) {
                String l = line1.substring(0, line1.indexOf("//"));
                if (l.equals("")) {
                    continue;
                } else {
                    line1 = l;
                }
            }
            String line = "";
            // Removes spaces from the line
            for(char c: line1.toCharArray()) {
                if (c != ' ') {
                    line += c;
                }
            }
            if (line.equals("")) {
                continue;
            }

            // Identifies and processes C-instructions
            Instruction instruction = Parser.instructionType(line);
            if (instruction == Instruction.C_INSTRUCTION){
                String dest = Parser.dest(line);
                String jump = Parser.jump(line);
                String comp = Parser.comp(line);
                // Generates binary code for C-instruction
                binary_line = "111" + Code.comp(comp) + Code.dest(dest) +  Code.jmp(jump);
                writer.write(binary_line); // Write the binary line to the output file
                writer.write(System.lineSeparator()); // Add newline

            } else {
                // Skips label instructions
                if (instruction == Instruction.L_INSTRUCTION) {
                    continue;
                }
                String symbol = Parser.symbol(line);
                Integer decimal_val;

                // Handles variable symbols
                if (!isNumeric(symbol)) {
                    Integer value = symbolTable.get(symbol);
                    if (value == null) {
                        symbolTable.put(symbol, varCounter);
                        varCounter++; // Increment variable address
                    }
                    decimal_val = symbolTable.get(symbol);
                } else {
                    decimal_val = Integer.parseInt(symbol); // Handle numeric constant
                }

                // Converts to 16-bit binary representation
                binary_line = String.format("%16s", Integer.toBinaryString(decimal_val)).replace(' ', '0');
                writer.write(binary_line); // Write binary to output
                writer.write(System.lineSeparator()); // Add newline
            }
        }
        bufferedReader.close(); // Close the reader after second pass
        writer.close(); // Close the writer after writing all instructions
    }

    // Checks if the input path corresponds to a valid .asm file
    public static boolean isAsmFile(String path) {
        File file = new File(path);
        if (!file.exists()){
            return false;
        }
        String fileName = file.getName().toLowerCase();
        return fileName.endsWith(".asm"); // Returns true if the file has a .asm extension
    }

    // Checks if a string is numeric
    public static boolean isNumeric(String str) {
        for (char c : str.toCharArray()) {
            if (!Character.isDigit(c)) return false; // Returns false if a non-digit is found
        }
        return true; // Returns true if the string contains only digits
    }
}
