public class Parser {
    
    // Determines the type of VM instruction (arithmetic, push, or pop) based on the command line
    public static Instruction commandType(String line){
        String [] arithmetics = {"add", "sub", "neg", "eq", "gt", "lt", "and", "or", "not"};
        line  = line.trim(); // handle tabs at the beginning
        for(String s : arithmetics){
            if(line.startsWith(s)){
                return Instruction.C_ARITHMETIC; // Return if the command is an arithmetic operation
            }
        }

        if (line.startsWith("pop")){
            return Instruction.C_POP; // Return if the command is a pop operation
        }

        if (line.startsWith("label")){
            return Instruction.C_LABEL;
        }

        if (line.startsWith("if-goto")){
            return Instruction.C_IF;
        }

        if (line.startsWith("goto")){
            return Instruction.C_GOTO;
        }

        if(line.startsWith("call")) {
            return Instruction.C_CALL;
        }
        if(line.startsWith("function")) {
            return Instruction.C_FUNCTION;
        }

        if(line.startsWith("return")) {
            return Instruction.C_RETURN;
        }

        return Instruction.C_PUSH; // Default to push if no other match is found
    }
    
    // Extracts the first argument from the command line (for push, pop, and arithmetic commands)
    public static String arg1(String line){
        Instruction instruction = commandType(line);
        if (instruction == Instruction.C_ARITHMETIC || instruction == Instruction.C_RETURN){
            return line; // For arithmetic or return  commands, the command itself is returned
        }
        String[] myArray = line.split(" ");
        
        return myArray[1]; // Return the first argument from the split command line
    }

    // Extracts the second argument from the command line (only for push and pop commands)
    public static String arg2(String line){
        Instruction instruction = commandType(line);
        if (commandType(line) == Instruction.C_ARITHMETIC || instruction == Instruction.C_RETURN){
            return line; // For arithmetic commands, the command itself is returned
        }
        String[] myArray = line.split(" ");
        
        return myArray[2]; // Return the second argument from the split command line
    }
}
