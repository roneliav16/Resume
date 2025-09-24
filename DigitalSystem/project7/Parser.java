public class Parser {
    public static Instruction commandType(String line){
        String [] arithmetics = {"add", "sub", "neg", "eq", "gt", "lt", "and", "or", "not"};

        for(String s : arithmetics){
            if(line.startsWith(s)){
                return Instruction.C_ARITHMETIC;
            }
        }

        if (line.startsWith("pop")){
            return Instruction.C_POP;
        }

        return Instruction.C_PUSH;
    }
    public static String arg1(String line){
        if (commandType(line) == Instruction.C_ARITHMETIC){
            return line;
        }
        String[] myArray = line.split(" ");

        return myArray[1];
    }

    public static String arg2(String line){
        if (commandType(line) == Instruction.C_ARITHMETIC){
            return line;
        }
        String[] myArray = line.split(" ");

        return myArray[2];
    }
}
