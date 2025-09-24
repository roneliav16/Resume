import java.io.*;

// The Parser class provides methods to parse Hack assembly language instructions.
public class Parser {

    // Determines the type of instruction: A-instruction, L-instruction, or C-instruction.
    public static Instruction instructionType(String line) {
        if (line.charAt(0) == '@') {
            return Instruction.A_INSTRUCTION; // A-instruction starts with '@'
        }
        if (line.charAt(0) == '(') {
            return Instruction.L_INSTRUCTION; // L-instruction (label) starts with '('
        }
        return Instruction.C_INSTRUCTION; // Otherwise, it's a C-instruction
    }

    // Extracts the symbol from the instruction.
    // For A-instructions and L-instructions, it returns the symbol.
    public static String symbol(String line) {
        Instruction instruction = instructionType(line);
        if (instruction == Instruction.L_INSTRUCTION) {
            return line.substring(1, line.length() - 1); // Removes parentheses for L-instructions
        }

        return line.substring(1); // For A-instructions, removes '@'
    }

    // Extracts the destination part of a C-instruction.
    // If no destination is present, returns null.
    public static String dest(String line) {
        int ind = line.indexOf('=');
        if (ind != -1) {
            return line.substring(0, ind); // Extracts the part before '=' as the destination
        }
        return null; // No destination
    }

    // Extracts the computation part of a C-instruction.
    // If there is no destination, it checks if there's a jump part and handles accordingly.
    public static String comp(String line) {

        if (dest(line) == null) { // If there's no destination
            if (line.contains(";")) {
                return line.substring(0, line.indexOf(';')); // Everything before the ';' is comp
            } else {
                return line; // If there's no jump, the whole line is comp
            }
        }
        if (line.contains(";")) {
            return line.substring(line.indexOf('=') + 1, line.indexOf(';')); // Extracts comp part before ';'
        } else {
            return line.substring(line.indexOf('=') + 1); // Extracts comp part after '='
        }

    }

    // Extracts the jump part of a C-instruction.
    // If there's no jump, returns null.
    public static String jump(String line) {
        if (!line.contains(";")) return null; // No jump if there's no ';'
        String index = line.substring(line.indexOf(';'));
        if (index.length() == 1) {
            return null; // No jump if only ';' is present
        }
        return index.substring(1); // Returns the jump part after the ';'
    }
}
