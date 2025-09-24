import java.io.*;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class Tokenizer {
    BufferedReader bufferedReader;
    static final String symbols = "{}()[].,;+-*/&|<>=~";
    String currentToken;
    char ch;
    static final List<String> keywords = Arrays.asList("class", "constructor", "function", "method", "field", "static", "var", "int", "char", "boolean", "void", "true", "false", "null", "this", "let", "do", "if", "else", "while", "return");
    static List<String> ClassNames;
    static List<String> SuspectClassNames;
    static List<String> functionOrMethodsNames;
    static List<String> SuspectfunctionOrMethodsNames;
    String ClassName;
    String subName;
    static List<String> parameters;
    static List<String> fieldsNames;
    

    public Tokenizer(File jackFile) throws FileNotFoundException {
        this.bufferedReader = new BufferedReader(new FileReader(jackFile));
        this.currentToken = null;
        ClassNames = new ArrayList<>(); 
        SuspectClassNames = new ArrayList<>();
        functionOrMethodsNames = new ArrayList<>();
        SuspectfunctionOrMethodsNames = new ArrayList<>();
        parameters = new ArrayList<>();
        fieldsNames = new ArrayList<>();
    }

    public boolean advance() throws IOException {
        char c;
        if (ch != '\0') {
            c = ch;
        } else {
            c = (char) bufferedReader.read(); // Happen just once (on the first read)
        }

        while ((int) c != 65535) { // Checks if c is -1 (cast to char and back to int)
            if (Character.isWhitespace(c)) {
                while((c = (char) bufferedReader.read()) != -1){
                    if (!Character.isWhitespace(c)){
                        break;
                    }
                }
            }

            if (c == '/') {
                char c1 = (char) bufferedReader.read();
                if (c1 != '*' && c1 != '/') {
                    break;
                }
                if (c1 == '/') {
                    while((c1 = (char) bufferedReader.read()) != '\n') {
                        if ((int) c1 == 65535) {
                            return false;
                        }
                    }
                    c = (char) bufferedReader.read();
                    continue;
                }

                if (c1 == '*') { 
                    while (true) {
                        c1 = (char) bufferedReader.read();
                        if (c1 == '*') {
                            c1 = (char) bufferedReader.read();
                            if (c1 == '/') {
                                c1 = (char) bufferedReader.read();
                                break;
                            }
                            else {
                                while(true) {
                                    while((c1 = (char) bufferedReader.read()) != '*') {}
                                    if ((char) bufferedReader.read() == '/') break;
                                }
                                c1 = (char) bufferedReader.read(); // read and move to the next char
                                break;
                            }
                        }
                        else {
                            while((c1 = (char) bufferedReader.read()) != '*') {}
                            c1 = (char) bufferedReader.read();
                            c1 = (char) bufferedReader.read();
                            break;
                        }
                    }
                }
                c = c1;
            }
            else {
                break;
            }
        }

        if ((int) c == 65535) {
            return false;
        }
        currentToken = "" + c;
        return true;
    }


    public TokenType tokenType() throws IOException {
        // check if the first one is a symbol
        if (symbols.indexOf(currentToken) != -1) {
            ch = (char) bufferedReader.read();
            return TokenType.SYMBOL;
        }

        char tempChar;
        if (currentToken.charAt(0) >= '0' && currentToken.charAt(0) <= '9') {
            while((tempChar = (char) bufferedReader.read()) >= '0' && tempChar <= '9') {
                currentToken += tempChar;
            }
            ch = tempChar;
            return TokenType.INTEGERCONSTANT;
        }

        if (currentToken.charAt(0) == '"'){
            currentToken = "";
            while((tempChar = (char) bufferedReader.read()) != '"') {
                currentToken += tempChar;
            }
            ch = (char) bufferedReader.read();
            return TokenType.STRINGCONSTANT;
        }

        String tempStr = currentToken;
        while ((int) (tempChar = (char) bufferedReader.read()) != 65535 && (Character.isLetter(tempChar) || Character.isDigit(tempChar) || tempChar == '_')) {
            currentToken += tempChar;
        }
        
        if(keywords.contains(currentToken)) {
            ch = tempChar;
            return TokenType.KEYWORD;
        } else {
            ch = tempChar;
            return TokenType.IDENTIFIER;
        }
    }

    public void close() throws IOException{ 
        this.bufferedReader.close(); // Close the file after processing all lines
        return;
    }

    // public keywordType keyword() {
    //     if (this.currentToken.equals("class")){
    //         return TokenType.CLASS;
    //     }
    //     if (this.currentToken.equals("constructor")){
    //         return TokenType.CONSTRUCTOR;
    //     }
    //     if (this.currentToken.equals("function")){
    //         return TokenType.FUNCTION;
    //     }
    //     if (this.currentToken.equals("method")){
    //         return TokenType.METHOD;
    //     }
    //     if (this.currentToken.equals("field")){
    //         return TokenType.FIELD;
    //     }
    //     if (this.currentToken.equals("static")){
    //         return TokenType.STATIC;
    //     }

    //     if (this.currentToken.equals("var")){
    //         return TokenType.VAR;
    //     }

    //     if (this.currentToken.equals("true")) {
    //         return TokenType.TRUE;
    //     }
    //     if (this.currentToken.equals("false")) {
    //         return TokenType.FALSE;
    //     }
    //     if (this.currentToken.equals("null")) {
    //         return TokenType.NULL;
    //     }
    //     if (this.currentToken.equals("this")) {
    //         return TokenType.THIS;
    //     }
    //     if (this.currentToken.equals("let")) {
    //         return TokenType.LET;
    //     }
    //     if (this.currentToken.equals("do")) {
    //         return TokenType.DO;
    //     }
    //     if (this.currentToken.equals("if")) {
    //         return TokenType.IF;
    //     }
    //     if (this.currentToken.equals("else")) {
    //         return TokenType.ELSE;
    //     }
    //     if (this.currentToken.equals("while")) {
    //         return TokenType.WHILE;
    //     }
    //     return TokenType.RETURN;
    // }


}
