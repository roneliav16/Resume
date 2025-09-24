import jdk.jfr.Timespan;

import java.io.BufferedWriter;
import java.io.IOException;

public class Code {
    static Integer lableCount = 0; // Initialize label count for unique labels in arithmetic commands
    static Integer numRet = 1;
    // Method to write a line of code to the BufferedWriter
    public static void writeLine(String line, BufferedWriter writer) throws IOException {
        writer.append(line);
        writer.newLine(); // Add a newline after the command (optional)
    }

    // Method for generating code for push and pop operations
    public static void writePushPop(Instruction i, String segment, String index, BufferedWriter bufferedWriter, String fileName) throws IOException {
        // Handle push command
        if(i == Instruction.C_PUSH){
            if (segment.equals("constant")){ // Special handling for constant segment
                writeLine("//D="+index, bufferedWriter);
                writeLine("@"+index, bufferedWriter);
                writeLine("D=A", bufferedWriter); // Set D register to the constant value
                writeLine("//RAM[SP]=D", bufferedWriter);
                writeLine("@SP", bufferedWriter);
                writeLine("A=M", bufferedWriter);
                writeLine("M=D", bufferedWriter); // Store D in the memory at SP
                writeLine("//SP++", bufferedWriter);
                writeLine("@SP", bufferedWriter);
                writeLine("M=M+1", bufferedWriter); // Increment SP

            } else {
                // Handle different segment types for push operations
                if (segment.equals("local")){
                    pushSegment("LCL", bufferedWriter, index);
                } else if(segment.equals("argument")){
                    pushSegment("ARG", bufferedWriter, index);
                } else if (segment.equals("this")) {
                    pushSegment("THIS", bufferedWriter, index);
                } else if (segment.equals("that")){
                    pushSegment("THAT", bufferedWriter, index);
                } else if (segment.equals("static")) {
                    pushStatic(bufferedWriter, index, fileName);
                } else if (segment.equals("temp")) {
                    pushImplicitSegment("5", bufferedWriter, index);
                } else {
                    pushImplicitSegment("3", bufferedWriter, index);
                }
            }
        }
        // Handle pop command
        if (i == Instruction.C_POP){
            // Handle different segment types for pop operations
            if (segment.equals("local")){
                popSegment("LCL", bufferedWriter, index);
            } else if(segment.equals("argument")){
                popSegment("ARG", bufferedWriter, index);
            } else if (segment.equals("this")) {
                popSegment("THIS", bufferedWriter, index);
            } else if (segment.equals("that")){
                popSegment("THAT", bufferedWriter, index);
            } else if (segment.equals("static")) {
                popStatic(bufferedWriter, index, fileName);
            } else if (segment.equals("temp")) {
                popImplicitSegment("5", bufferedWriter, index);
            } else { // pointer segment
                popImplicitSegment("3", bufferedWriter, index);
            }
        }

    }

    public static void pushToStackMemory(String memory, BufferedWriter bufferedWriter) throws IOException {
        writeLine("@" + memory, bufferedWriter);
        writeLine("D=A", bufferedWriter); // Set D register to the constant value
        writeLine("// RAM[SP]=D", bufferedWriter);
        writeLine("@SP", bufferedWriter);
        writeLine("A=M", bufferedWriter);
        writeLine("M=D", bufferedWriter); // Store D in the memory at SP
        writeLine("//SP++", bufferedWriter);
        writeLine("@SP", bufferedWriter);
        writeLine("M=M+1", bufferedWriter); // Increment SP
    }

    public static void pushToStackValue(String memory, BufferedWriter bufferedWriter) throws IOException {
        writeLine("@" + memory, bufferedWriter);
        writeLine("D=M", bufferedWriter); // Set D register to the constant value
        writeLine("// RAM[SP]=D", bufferedWriter);
        writeLine("@SP", bufferedWriter);
        writeLine("A=M", bufferedWriter);
        writeLine("M=D", bufferedWriter); // Store D in the memory at SP
        writeLine("//SP++", bufferedWriter);
        writeLine("@SP", bufferedWriter);
        writeLine("M=M+1", bufferedWriter); // Increment SP
    }

    public static void writeCall(String funcName, String nVars, BufferedWriter writer) throws IOException {
        String returnAddress = funcName+"$ret."+numRet.toString();
        pushToStackMemory(returnAddress, writer);
        pushToStackValue("LCL", writer);
        pushToStackValue("ARG", writer);
        pushToStackValue("THIS", writer);
        pushToStackValue("THAT", writer);

        writeLine("@SP", writer);  // reposition ARG Pointer
        writeLine("D=M", writer);
        int i = Integer.parseInt(nVars) + 5;
        writeLine("@" + Integer.toString(i), writer);
        writeLine("D=D-A", writer);
        writeLine("@ARG", writer);
        writeLine("M=D", writer);

        writeLine("@SP", writer);  // reposition LCL Pointer
        writeLine("D=M", writer);
        writeLine("@LCL", writer);
        writeLine("M=D", writer);

        writeGoto(funcName, writer);
        writeLabel(returnAddress, writer);
        numRet++;
    }
    
    public static void writeFunction(String funcName, String nVars, BufferedWriter writer) throws IOException {
        writeLabel(funcName, writer);
        for (int i = 0; i < Integer.parseInt(nVars); i++) { // Push Zero's to the stack (init the local variables)
            pushToStackMemory("0", writer);
        }
    }

    public static void writeReturn(BufferedWriter writer) throws IOException {
        writeLine("// Return", writer);  // Gets the address at the frame's end
        writeLine("@LCL", writer);  
        writeLine("D=M", writer);
        writeLine("@R13", writer);
        writeLine("M=D", writer);

        writeLine("@5", writer);  // Gets the return address
        writeLine("A=D-A", writer);
        writeLine("D=M", writer);
        writeLine("@R14", writer);
        writeLine("M=D", writer);

        writeLine("// pop from stack", writer);  // Puts the return value for the caller
        writeLine("@SP", writer);
        writeLine("A=M-1", writer);
        writeLine("D=M", writer);
        writeLine("@ARG", writer);
        writeLine("A=M", writer);
        writeLine("M=D", writer);

        writeLine("@ARG", writer); // Reposition SP
        writeLine("D=M+1", writer);
        writeLine("@SP", writer);
        writeLine("M=D", writer);

        writeLine("@R13", writer);  //restores THAT
        writeLine("A=M-1", writer);
        writeLine("D=M", writer);
        writeLine("@THAT", writer);
        writeLine("M=D", writer);

        writeLine("@2", writer);  //restores THIS
        writeLine("D=A", writer);
        writeLine("@R13", writer);
        writeLine("A=M-D", writer);
        writeLine("D=M", writer);
        writeLine("@THIS", writer);
        writeLine("M=D", writer);

        writeLine("@3", writer);  //restores ARG
        writeLine("D=A", writer);
        writeLine("@R13", writer);
        writeLine("A=M-D", writer);
        writeLine("D=M", writer);
        writeLine("@ARG", writer);
        writeLine("M=D", writer);

        writeLine("@4", writer);  //restores LCL
        writeLine("D=A", writer);
        writeLine("@R13", writer);
        writeLine("A=M-D", writer);
        writeLine("D=M", writer);
        writeLine("@LCL", writer);
        writeLine("M=D", writer);

        writeLine("// goto command", writer);  // Jumps to the return address
        writeLine("@R14", writer);
        writeLine("A=M", writer);
        writeLine("0;JMP", writer);
    }

    public static void writeLabel(String labelName, BufferedWriter writer) throws IOException {
        String line = '(' + labelName + ')';
        writeLine(line, writer);
    }

    public static void writeGoto(String labelName, BufferedWriter writer) throws IOException {
        writeLine("// goto command", writer);
        String line = '@'+labelName;
        writeLine(line, writer);
        writeLine("0;JMP", writer);
    }

    public static void writeIfGoto(String labelName, BufferedWriter bufferedWriter) throws IOException {
        writeLine("// if goto", bufferedWriter);
        writeLine("@SP", bufferedWriter);
        writeLine("M=M-1", bufferedWriter); // decrease the value of top of the stack
        writeLine("A=M", bufferedWriter); // go to the address in the memory
        writeLine("D=M", bufferedWriter); // get the value in the top of the stack
        //writeLine("@SP", bufferedWriter);
        writeLine("@"+labelName , bufferedWriter);
        writeLine("D;JNE", bufferedWriter); // Jump if not equal

    }

    // Method for popping values from a specific segment
    public static void popSegment(String segment, BufferedWriter bufferedWriter, String index) throws IOException {
        writeLine("// pop " + segment +" " + index, bufferedWriter);
        writeLine("@"+index, bufferedWriter);
        writeLine("D=A", bufferedWriter);
        writeLine("@"+segment, bufferedWriter);
        writeLine("D=D+M", bufferedWriter); // Compute address for pop
        writeLine("@R15", bufferedWriter);
        writeLine("M=D", bufferedWriter);
        writeLine("@SP", bufferedWriter);
        writeLine("M=M-1", bufferedWriter); // Decrement SP
        writeLine("A=M", bufferedWriter);
        writeLine("D=M", bufferedWriter);
        writeLine("@R15", bufferedWriter);
        writeLine("A=M", bufferedWriter); // Store the value at the computed address
        writeLine("M=D", bufferedWriter);
    }

    // Method for popping values from implicit segments (e.g., temp, pointer)
    public static void popImplicitSegment(String segment, BufferedWriter bufferedWriter, String index) throws IOException {
        writeLine("// pop " + segment + " " + index, bufferedWriter);
        writeLine("@" + index, bufferedWriter);
        writeLine("D=A", bufferedWriter);
        writeLine("@"+segment, bufferedWriter);
        writeLine("D=D+A", bufferedWriter); // Compute address for pop
        writeLine("@R15", bufferedWriter);
        writeLine("M=D", bufferedWriter);
        writeLine("@SP", bufferedWriter);
        writeLine("M=M-1", bufferedWriter); // Decrement SP
        writeLine("A=M", bufferedWriter);
        writeLine("D=M", bufferedWriter);
        writeLine("@R15", bufferedWriter);
        writeLine("A=M", bufferedWriter); // Store the value at the computed address
        writeLine("M=D", bufferedWriter);
    }

    // Method for popping values from static
    public static void popStatic(BufferedWriter bufferedWriter, String index, String fileName) throws IOException {
        writeLine("// pop static " + fileName + "." + index, bufferedWriter);
        writeLine("@" + fileName + "." + index, bufferedWriter);
        writeLine("D=A", bufferedWriter); // Compute address for pop
        writeLine("@R15", bufferedWriter);
        writeLine("M=D", bufferedWriter);
        writeLine("@SP", bufferedWriter);
        writeLine("M=M-1", bufferedWriter); // Decrement SP
        writeLine("A=M", bufferedWriter);
        writeLine("D=M", bufferedWriter);
        writeLine("@R15", bufferedWriter);
        writeLine("A=M", bufferedWriter); // Store the value at the computed address
        writeLine("M=D", bufferedWriter);
    }

    // Method for pushing values from Static
    public static void pushStatic(BufferedWriter bufferedWriter, String index, String fileName) throws IOException {
        writeLine("// push static " + fileName + "." + index, bufferedWriter);
        writeLine("@" + fileName + "." + index, bufferedWriter);
        writeLine("D=M", bufferedWriter); // Load the value at the address
        writeLine("@SP", bufferedWriter);
        writeLine("A=M", bufferedWriter);
        writeLine("M=D", bufferedWriter); // Store the value in memory at SP
        writeLine("@SP", bufferedWriter);
        writeLine("M=M+1", bufferedWriter); // Increment SP
    }

    // Method for pushing values from implicit segments (e.g., temp, pointer)
    public static void pushImplicitSegment(String segString, BufferedWriter bufferedWriter, String index) throws IOException {
        writeLine("// push from "+segString + " "+ index, bufferedWriter);
        writeLine("@"+index, bufferedWriter);
        writeLine("D=A", bufferedWriter);
        writeLine("@"+segString, bufferedWriter);
        writeLine("A=D+A", bufferedWriter); // Compute address for push
        writeLine("D=M", bufferedWriter); // Load the value at the address
        writeLine("@SP", bufferedWriter);
        writeLine("A=M", bufferedWriter);
        writeLine("M=D", bufferedWriter); // Store the value in memory at SP
        writeLine("@SP", bufferedWriter);
        writeLine("M=M+1", bufferedWriter); // Increment SP
    }

    // Method for pushing values from specific segments
    public static void pushSegment(String segString, BufferedWriter bufferedWriter, String index) throws IOException {
        writeLine("// push from "+ segString + " "+ index, bufferedWriter);
        writeLine("@" + index, bufferedWriter);
        writeLine("D=A", bufferedWriter);
        writeLine("@" + segString, bufferedWriter);
        writeLine("A=D+M", bufferedWriter); // Compute address for push
        writeLine("D=M", bufferedWriter); // Load the value at the address
        writeLine("@SP", bufferedWriter);
        writeLine("A=M", bufferedWriter);
        writeLine("M=D", bufferedWriter); // Store the value in memory at SP
        writeLine("@SP", bufferedWriter);
        writeLine("M=M+1", bufferedWriter); // Increment SP
    }

    // Method to handle arithmetic commands (add, sub, eq, etc.)
    public static void writeArithmetic(String command, BufferedWriter writer) {
        try {
            writeLine("// " + command, writer);  // Write the command to the file
            switch (command) {
                case "add":
                    writeLine("@SP", writer);
                    writeLine("D=M-1", writer);
                    writeLine("A=D", writer);
                    writeLine("D=M", writer);
                    writeLine("A=A-1", writer);
                    writeLine("M=D+M", writer); // Perform addition
                    writeLine("@SP", writer);
                    writeLine("M=M-1", writer); // Decrement SP
                    break;
                case "sub":
                    writeLine("@SP", writer);
                    writeLine("D=M-1", writer);
                    writeLine("D=D-1", writer);
                    writeLine("A=D", writer);
                    writeLine("D=M", writer);
                    writeLine("A=A+1", writer);
                    writeLine("D=D-M", writer); // Perform subtraction
                    writeLine("A=A-1", writer);
                    writeLine("M=D", writer); // Store result back to stack
                    writeLine("@SP", writer);
                    writeLine("M=M-1", writer); // Decrement SP
                    break;
                case "neg":
                    writeLine("@SP", writer);
                    writeLine("D=M-1", writer);
                    writeLine("A=D", writer);
                    writeLine("D=M", writer);
                    writeLine("M=M-D", writer); // Negate the value
                    writeLine("M=M-D", writer); // Double negation to set it to zero
                    break;
                case "eq":
                    // Handle equality check
                    writeLine("@SP", writer);
                    writeLine("D=M-1", writer);
                    writeLine("D=D-1", writer);
                    writeLine("A=D", writer);
                    writeLine("D=M", writer);
                    writeLine("A=A+1", writer);
                    writeLine("D=D-M", writer);
                    writeLine("@ISNOTEQUAL_"+lableCount.toString(), writer);
                    writeLine("D;JNE", writer); // Jump if not equal
                    writeLine("D=-1", writer); // Set D to true
                    writeLine("@CONTEQ_"+lableCount.toString(), writer);
                    writeLine("0;JMP", writer); // Jump to equality end
                    writeLine("(ISNOTEQUAL_"+lableCount.toString()+")", writer);
                    writeLine("D=0", writer); // Set D to false
                    writeLine("(CONTEQ_"+lableCount.toString()+")", writer);
                    writeLine("@SP", writer);
                    writeLine("A=M-1", writer);
                    writeLine("A=A-1", writer);
                    writeLine("M=D", writer); // Store the result back in the stack
                    writeLine("@SP", writer);
                    writeLine("M=M-1", writer); // Decrement SP
                    lableCount++; // Increment label count for uniqueness
                    break;
                    case "gt":
                    writeLine("@SP", writer);
                    writeLine("D=M-1", writer);
                    writeLine("D=D-1", writer);
                    writeLine("A=D", writer);
                    writeLine("D=M", writer);
                    writeLine("A=A+1", writer);
                    writeLine("D=D-M", writer);
                    writeLine("@ISNOTGT_"+lableCount.toString(), writer);
                    writeLine("D;JLE", writer);
                    writeLine("D=-1", writer);
                    writeLine("@CONTGT_"+lableCount.toString(), writer);
                    writeLine("0;JMP", writer);
                    writeLine("(ISNOTGT_"+lableCount.toString()+")", writer);
                    writeLine("D=0", writer);
                    writeLine("(CONTGT_"+lableCount.toString()+")", writer);
                    writeLine("@SP", writer);
                    writeLine("A=M-1", writer);
                    writeLine("A=A-1", writer);
                    writeLine("M=D", writer);
                    writeLine("@SP", writer);
                    writeLine("M=M-1", writer);
                    lableCount++;
                    break;
                case "lt":
                    writeLine("@SP", writer);
                    writeLine("D=M-1", writer);
                    writeLine("D=D-1", writer);
                    writeLine("A=D", writer);
                    writeLine("D=M", writer);
                    writeLine("A=A+1", writer);
                    writeLine("D=D-M", writer);
                    writeLine("@ISNOTLT_"+lableCount.toString(), writer);
                    writeLine("D;JGE", writer);
                    writeLine("D=-1", writer);
                    writeLine("@CONTLT_"+lableCount.toString(), writer);
                    writeLine("0;JMP", writer);
                    writeLine("(ISNOTLT_"+lableCount.toString()+")", writer);
                    writeLine("D=0", writer);
                    writeLine("(CONTLT_"+lableCount.toString()+")", writer);
                    writeLine("@SP", writer);
                    writeLine("A=M-1", writer);
                    writeLine("A=A-1", writer);
                    writeLine("M=D", writer);
                    writeLine("@SP", writer);
                    writeLine("M=M-1", writer);
                    lableCount++;
                    break;
                case "and":
                    writeLine("@SP", writer);
                    writeLine("D=M-1", writer);
                    writeLine("A=D", writer);
                    writeLine("D=M", writer);
                    writeLine("A=A-1", writer);
                    writeLine("M=D&M", writer);
                    writeLine("@SP", writer);
                    writeLine("M=M-1", writer);
                    break;
                case "or":
                    writeLine("@SP", writer);
                    writeLine("D=M-1", writer);
                    writeLine("A=D", writer);
                    writeLine("D=M", writer);
                    writeLine("A=A-1", writer);
                    writeLine("M=D|M", writer);
                    writeLine("@SP", writer);
                    writeLine("M=M-1", writer);
                    break;

                default: // NOT operation
                    writeLine("@SP", writer);
                    writeLine("D=M-1", writer);
                    writeLine("A=D", writer);
                    writeLine("M=!M", writer); // Invert the value
            }

        } catch (IOException e) {
            System.out.println("An error occurred while writing to the file: " + e.getMessage());
        }
    }
}
