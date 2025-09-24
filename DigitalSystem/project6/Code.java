import java.util.HashMap;

public class Code {
    // This class provides methods to translate Hack assembly mnemonics into binary code.
    private static HashMap<String, String> compTable = initComp();
    private static HashMap<String, String> jmpTable = initJmp();

    private static HashMap<String, String> initComp(){
        // Initializes the computation (comp) table with Hack assembly mnemonics and their binary equivalents.
        compTable = new HashMap<>();
        compTable.put("0", "0101010");
        compTable.put("1", "0111111");      
        compTable.put("-1", "0111010");
        compTable.put("D", "0001100");
        compTable.put("A", "0110000");
        compTable.put("M", "1110000");
        compTable.put("!D", "0001101");
        compTable.put("!A", "0110001");
        compTable.put("!M", "1110001");
        compTable.put("-D", "0001111");
        compTable.put("-A", "0110011");
        compTable.put("-M", "1110011");
        compTable.put("D+1", "0011111");
        compTable.put("A+1", "0110111");
        compTable.put("M+1", "1110111");
        compTable.put("D-1", "0001110");
        compTable.put("A-1", "0110010");
        compTable.put("M-1", "1110010");
        compTable.put("D+A", "0000010");
        compTable.put("D+M", "1000010");
        compTable.put("D-A", "0010011");
        compTable.put("D-M", "1010011");
        compTable.put("A-D", "0000111");
        compTable.put("M-D", "1000111");
        compTable.put("D&A", "0000000");
        compTable.put("D&M", "1000000");
        compTable.put("D|A", "0010101");
        compTable.put("D|M", "1010101");

        
        return compTable;
    }

    // Initializes the jump (jmp) table with Hack assembly jump mnemonics and their binary equivalents.
    private static HashMap<String,String> initJmp(){
        jmpTable = new HashMap<>();

        jmpTable.put("null", "000");
        jmpTable.put("JGT", "001");
        jmpTable.put("JEQ", "010");
        jmpTable.put("JGE", "011");
        jmpTable.put("JLT", "100");
        jmpTable.put("JNE", "101");
        jmpTable.put("JLE", "110");
        jmpTable.put("JMP", "111");

        return jmpTable;
    }

    // Converts destination mnemonics into a 3-bit binary string.
    public static String dest(String dest){
        if (dest == null) return "000";
        String binDest = "";
        if (dest.contains("A")){
            binDest += '1';
        }else{
            binDest += '0';
        }

        if (dest.contains("D")){
            binDest += '1';
        }else {
            binDest += '0';
        }

        if (dest.contains("M")){
            binDest += '1';
        }else {
            binDest += '0';
        }

        return binDest;

    }
    
    // Retrieves the 7-bit binary string for a given computation mnemonic.
    public static String comp(String comp){
        return compTable.get(comp);
    }

    // Retrieves the 3-bit binary string for a given jump mnemonic.
    public static String jmp(String jmp){
        if (jmp == null) return "000"; // Default value for null jumps
        return jmpTable.get(jmp);
    }


}
