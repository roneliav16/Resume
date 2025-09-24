import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.io.Writer;
import java.util.ArrayList;
import java.util.Currency;
import java.io.File;

public class CompilationEngine {
    BufferedWriter bufferedWriter;
    String currentToken;
    String tokenType;
    Tokenizer tokenizer;
    static int numberOfTabs = 0;

    // Constructor
    public CompilationEngine(BufferedWriter bufferedWriter,File jackFile) throws IOException{
        this.bufferedWriter = bufferedWriter;
        this.tokenizer = new Tokenizer(jackFile);
    }

    // Generic methods
    public void writeLines (String str, boolean newLine) throws IOException { // The second arugment is for newline or not
        for (int i = 0; i < numberOfTabs; i++) {
            bufferedWriter.write("  ");
        }
        bufferedWriter.write(str);
        if (newLine) bufferedWriter.newLine();
    }

    public void advance () throws IOException {
        tokenizer.advance();
        String tokenType = tokenizer.tokenType().name().toLowerCase();
        if (tokenType.equals("stringconstant")) {
            tokenType = "stringConstant";
        }
        if (tokenType.equals("integerconstant")) {
            tokenType = "integerConstant";
        }
        currentToken = tokenizer.currentToken;
        this.tokenType = tokenType;
    }

    public void checkClasses() throws IOException {
        for (String e : Tokenizer.SuspectClassNames) {
            if(!Tokenizer.ClassNames.contains(e)) {
                writeLines("Class syntex error !!!!!!!!!!!!!!", true);
            }
        }
    }

    public void checkFunctions() throws IOException {
        for (String e : Tokenizer.SuspectfunctionOrMethodsNames) {
            if(!Tokenizer.functionOrMethodsNames.contains(e)) {
                writeLines("Function Or method syntex error !!!!!!!", true);
            }
        }
    }



    // Proccesses methods
    public void process(String str) throws IOException {
        if (!currentToken.equals(str)) {
            writeLines("syntax error !!!!!!!", true);
        }
        advance();
    }

    public void processClass() throws IOException {
        if (!Tokenizer.ClassNames.contains(currentToken)) {
            Tokenizer.SuspectClassNames.add(currentToken);
        }
        advance();
    }

    public void processSub() throws IOException {
        if (!(currentToken.equals("function") || currentToken.equals("method") || currentToken.equals("constructor"))) {
            writeLines("syntax error !!!!!!!", true);
        }
        advance();
    }

    public void processType() throws IOException { // For classes
        if (currentToken.equals("int") || currentToken.equals("boolean") || currentToken.equals("char") || currentToken.equals("void")) {
            advance();
            return;
        }
        processClass();
    }


    
    public void processFunctionOrMethod () throws IOException {
        if (Tokenizer.functionOrMethodsNames.contains(tokenizer.ClassName + "." + currentToken)) {
            writeLines("syntax error !!!!!!!", true);
        } else {
            Tokenizer.functionOrMethodsNames.add(tokenizer.ClassName + "." + currentToken);
            tokenizer.subName = currentToken;
        }
        advance();
    }


    // Compilation methods
    public void compileClass() throws IOException {
        writeLines("<" + "class" + ">", true);
        numberOfTabs++;

        advance();
        writeLines("<" + tokenType + "> " + currentToken + " </" + tokenType + ">", true);
        process("class"); // class
        writeLines("<" + tokenType + "> " + currentToken + " </" + tokenType + ">", true);
        tokenizer.ClassName = currentToken;
        Tokenizer.ClassNames.add(currentToken);
        processClass(); // class name
        writeLines("<" + tokenType + "> " + currentToken + " </" + tokenType + ">", true);
        process("{"); // {
    
        while (currentToken.equals("static") || currentToken.equals("field")) {
            compileClassVarDec();
        }
        int b = 0;
        while(currentToken.equals("function") || currentToken.equals("method") || currentToken.equals("constructor")) {
            b++;
            compileSubroutine();
        }
        if (b == 0) {
            writeLines("<" + "subroutineDec" + ">", true);
            writeLines("</" + "subroutineDec" + ">",true);
        }
        writeLines("<" + tokenType + "> " + currentToken + " </" + tokenType + ">", true);
        process("}"); // }
        numberOfTabs--;
        writeLines("</" + "class" + ">",true);
    }

    public void compileSubroutine() throws IOException{ 
        writeLines("<" + "subroutineDec" + ">", true);
        numberOfTabs++;
    
        writeLines("<" + tokenType + "> " + currentToken + " </" + tokenType + ">", true);
        processSub(); // Function | Method | Constructor
        writeLines("<" + tokenType + "> " + currentToken + " </" + tokenType + ">", true);
        processType();
        writeLines("<" + tokenType + "> " + currentToken + " </" + tokenType + ">", true);

        processFunctionOrMethod(); // name of Subroutine
        writeLines("<" + tokenType + "> " + currentToken + " </" + tokenType + ">", true);
        process("(");
        compileParameterList();
        writeLines("<" + tokenType + "> " + currentToken + " </" + tokenType + ">", true);
        process(")");
        compileSubroutineBody();
        
        numberOfTabs--;
        writeLines("</" + "subroutineDec" + ">",true);
    }

    public void compileParameterList() throws IOException { 
        writeLines("<" + "parameterList" + ">", true);
        numberOfTabs++;
        
        if (!currentToken.equals(")")) {
            writeLines("<" + tokenType + "> " + currentToken + " </" + tokenType + ">", true);
            processType(); // Type of paramrter

            writeLines("<" + tokenType + "> " + currentToken + " </" + tokenType + ">", true);
            if (!Tokenizer.parameters.contains(tokenizer.ClassName + "." + tokenizer.subName +"." + currentToken)) { 
                Tokenizer.parameters.add(tokenizer.ClassName + "." + tokenizer.subName + "." + currentToken);
            }
            advance();
            while (currentToken.equals(",")) {
                writeLines("<" + tokenType + "> " + currentToken + " </" + tokenType + ">", true);
                process(",");
                writeLines("<" + tokenType + "> " + currentToken + " </" + tokenType + ">", true);
                processType(); // Type of paramrter

                writeLines("<" + tokenType + "> " + currentToken + " </" + tokenType + ">", true);
                if (!Tokenizer.parameters.contains(tokenizer.ClassName + "." + tokenizer.subName +"." + currentToken)) { 
                    Tokenizer.parameters.add(tokenizer.ClassName + "." + tokenizer.subName + "." + currentToken);
                }
                advance();
            }
        }
        numberOfTabs--;
        writeLines("</" + "parameterList" + ">", true);
    }

    public void compileSubroutineBody() throws IOException {
        writeLines("<" + "subroutineBody" + ">", true);
        numberOfTabs++;
        
        writeLines("<" + tokenType + "> " + currentToken + " </" + tokenType + ">", true);
        process("{");
        while (currentToken.equals("var")) {
            compileVarDec();
        }
        compileStatements();
        writeLines("<" + tokenType + "> " + currentToken + " </" + tokenType + ">", true);
        process("}");
        
        numberOfTabs--;
        writeLines("</" + "subroutineBody" + ">", true);
    }

    public void compileVarDec() throws IOException {
        writeLines("<" + "varDec" + ">", true);
        numberOfTabs++;

        writeLines("<" + tokenType + "> " + currentToken + " </" + tokenType + ">", true);
        process("var");
        writeLines("<" + tokenType + "> " + currentToken + " </" + tokenType + ">", true);
        processType();
        while (!currentToken.equals(";")) {
            writeLines("<" + tokenType + "> " + currentToken + " </" + tokenType + ">", true);
            if(Tokenizer.parameters.contains(tokenizer.ClassName + "." + tokenizer.subName +"." + currentToken)) {
                writeLines("syntax error !!!!!!!", true);
            } else {
                Tokenizer.parameters.add(tokenizer.ClassName + "." + tokenizer.subName +"." + currentToken);
            }
            advance();
            if (currentToken.equals(",")) {
                writeLines("<" + tokenType + "> " + currentToken + " </" + tokenType + ">", true);
                process(",");
            }
        }
        writeLines("<" + tokenType + "> " + currentToken + " </" + tokenType + ">", true);
        process(";");
        
        numberOfTabs--;
        writeLines("</" + "varDec" + ">", true);
    }

    public void compileClassVarDec() throws IOException {
        writeLines("<" + "classVarDec" + ">", true);
        numberOfTabs++;
        writeLines("<" + tokenType + "> " + currentToken + " </" + tokenType + ">", true);
        advance();
        writeLines("<" + tokenType + "> " + currentToken + " </" + tokenType + ">", true);
        processType();
        while (!currentToken.equals(";")) {
            writeLines("<" + tokenType + "> " + currentToken + " </" + tokenType + ">", true);
            if(Tokenizer.fieldsNames.contains(tokenizer.ClassName + ".this." + currentToken)) {
                writeLines("syntax error !!!!!!!", true);
            } else {
                Tokenizer.fieldsNames.add(tokenizer.ClassName + ".this." + currentToken);
            }
            advance();
            if (currentToken.equals(",")) {
                writeLines("<" + tokenType + "> " + currentToken + " </" + tokenType + ">", true);
                process(",");
            }
        }
        writeLines("<" + tokenType + "> " + currentToken + " </" + tokenType + ">", true);
        process(";");
        numberOfTabs--;
        writeLines("</" + "classVarDec" + ">", true);
    }

    public void compileStatements() throws IOException {
        writeLines("<" + "statements" + ">", true);
        numberOfTabs++;

        while (!currentToken.equals("}")) {
            compileStatement();
        }
        numberOfTabs--;
        writeLines("</" + "statements" + ">", true);
    }

    public void compileStatement() throws IOException {
        switch (currentToken) {
            case "let":
                compileLet();
                break;
            case "if":
                compileIf();
                break;
            case "while":
                compileWhile();
                break;
            case "do":
                compileDo();
                break;
            default: // return
                compileReturn();
                break;
        }
    }

    public void compileLet() throws IOException {
        writeLines("<" + "letStatement" + ">", true);
        numberOfTabs++;

        writeLines("<" + tokenType + "> " + currentToken + " </" + tokenType + ">", true);
        process("let");
        if(currentToken.equals("this")) {
            writeLines("<" + tokenType + "> " + currentToken + " </" + tokenType + ">", true);
            process("this");
            writeLines("<" + tokenType + "> " + currentToken + " </" + tokenType + ">", true);
            process(".");
        }

        if (!Tokenizer.fieldsNames.contains(tokenizer.ClassName + ".this." + currentToken)) {
            if(!Tokenizer.parameters.contains(tokenizer.ClassName + "." + tokenizer.subName +"." + currentToken)) {
                writeLines("syntax error !!!!!!!", true);
            }
        }
        writeLines("<" + tokenType + "> " + currentToken + " </" + tokenType + ">", true);    
        advance();
        if (currentToken.equals("[")) {
            writeLines("<" + tokenType + "> " + currentToken + " </" + tokenType + ">", true);
            process("[");
            compileExpression();
            writeLines("<" + tokenType + "> " + currentToken + " </" + tokenType + ">", true);
            process("]");
        }
        if (currentToken.equals("=")) {
            writeLines("<" + tokenType + "> " + currentToken + " </" + tokenType + ">", true);
            process("=");
            compileExpression();
            writeLines("<" + tokenType + "> " + currentToken + " </" + tokenType + ">", true);
            process(";");
        }
        numberOfTabs--;
        writeLines("</" + "letStatement" + ">", true);
    }

    public void compileIf() throws IOException {
        writeLines("<" + "ifStatement" + ">", true);
        numberOfTabs++;

        writeLines("<" + tokenType + "> " + currentToken + " </" + tokenType + ">", true);
        process("if");
        writeLines("<" + tokenType + "> " + currentToken + " </" + tokenType + ">", true);
        process("(");
        compileExpression();
        writeLines("<" + tokenType + "> " + currentToken + " </" + tokenType + ">", true);
        process(")");
        writeLines("<" + tokenType + "> " + currentToken + " </" + tokenType + ">", true);
        process("{");
        compileStatements();
        writeLines("<" + tokenType + "> " + currentToken + " </" + tokenType + ">", true);
        process("}");
        if (currentToken.equals("else")) {
            writeLines("<" + tokenType + "> " + currentToken + " </" + tokenType + ">", true);
            advance();
            writeLines("<" + tokenType + "> " + currentToken + " </" + tokenType + ">", true);
            process("{");
            compileStatements();
            writeLines("<" + tokenType + "> " + currentToken + " </" + tokenType + ">", true);
            process("}");
        }
        numberOfTabs--;
        writeLines("</" + "ifStatement" + ">", true);
    }

    public void compileWhile() throws IOException {
        writeLines("<" + "whileStatement" + ">", true);
        numberOfTabs++;

        writeLines("<" + tokenType + "> " + currentToken + " </" + tokenType + ">", true);
        process("while");
        writeLines("<" + tokenType + "> " + currentToken + " </" + tokenType + ">", true);
        process("(");
        compileExpression();
        writeLines("<" + tokenType + "> " + currentToken + " </" + tokenType + ">", true);
        process(")");
        writeLines("<" + tokenType + "> " + currentToken + " </" + tokenType + ">", true);
        process("{");
        compileStatements();
        writeLines("<" + tokenType + "> " + currentToken + " </" + tokenType + ">", true);
        process("}");

        numberOfTabs--;
        writeLines("</" + "whileStatement" + ">", true);
    }

    public void compileDo() throws IOException {
        writeLines("<" + "doStatement" + ">", true);
        numberOfTabs++;

        writeLines("<" + tokenType + "> " + currentToken +  " </" + tokenType + ">", true);
        process("do");
        compileSubRoutineCall();
        writeLines("<" + tokenType + "> " + currentToken + " </" + tokenType + ">", true);
        process(";");
        numberOfTabs--;
        writeLines("</" + "doStatement" + ">", true);
    }

    public void compileReturn() throws IOException {
        writeLines("<" + "returnStatement" + ">", true);
        numberOfTabs++;

        writeLines("<" + tokenType + "> " + currentToken + " </" + tokenType + ">", true);
        process("return");
        if (!currentToken.equals(";"))
        compileExpression();
        writeLines("<" + tokenType + "> " + currentToken + " </" + tokenType + ">", true);
        process(";");

        numberOfTabs--;
        writeLines("</" + "returnStatement" + ">", true);
    }

    public void compileExpression() throws IOException {
        writeLines("<" + "expression" + ">", true);
        numberOfTabs++;

        compileTerm();
        String op = "+-*/&|<>=";
        while (op.contains(currentToken)) {
            if (currentToken.equals("<")) currentToken = "&lt;";
            if (currentToken.equals(">")) currentToken = "&gt;";
            if (currentToken.equals("\"")) currentToken = "&quot;";
            if (currentToken.equals("&")) currentToken = "&amp;";
            writeLines("<" + tokenType + "> " + currentToken + " </" + tokenType + ">", true);
            advance();
            compileTerm();
        }
        numberOfTabs--;
        writeLines("</" + "expression" + ">", true);
    }

    public void compileTerm() throws IOException {
        writeLines("<" + "term" + ">", true);
        numberOfTabs++;

        if(tokenType.equals("integerConstant") || tokenType.equals("stringConstant") || currentToken.equals("true") || currentToken.equals("false") || currentToken.equals("null")) {
            writeLines("<" + tokenType + "> " + currentToken + " </" + tokenType + ">", true);
            advance();
        } else if (Tokenizer.parameters.contains(tokenizer.ClassName + "." + tokenizer.subName +"." + currentToken) || Tokenizer.fieldsNames.contains(tokenizer.ClassName + ".this." + currentToken) || currentToken.equals("this")) {
            if (currentToken.equals("this")) {
                writeLines("<" + tokenType + "> " + currentToken + " </" + tokenType + ">", true);
                process("this");
                if (currentToken.equals(".")) {
                    writeLines("<" + tokenType + "> " + currentToken + " </" + tokenType + ">", true);
                    process(".");
                    writeLines("<" + tokenType + "> " + currentToken + " </" + tokenType + ">", true);
                    advance();
                }
            } 
            else {
                writeLines("<" + tokenType + "> " + currentToken + " </" + tokenType + ">", true);
                advance();
            }
            if (currentToken.equals("[")) {
                writeLines("<" + tokenType + "> " + currentToken + " </" + tokenType + ">", true);
                process("[");
                compileExpression();
                writeLines("<" + tokenType + "> " + currentToken + " </" + tokenType + ">", true);
                process("]");
                
            }
        } else if (currentToken.equals("(")) {
            writeLines("<" + tokenType + "> " + currentToken + " </" + tokenType + ">", true);
            process("(");
            compileExpression();
            writeLines("<" + tokenType + "> " + currentToken + " </" + tokenType + ">", true);
            process(")");
        } else if (currentToken.equals("-") || currentToken.equals("~")) {
            writeLines("<" + tokenType + "> " + currentToken + " </" + tokenType + ">", true);
            advance();
            compileTerm();
        } else {
            String tempToken = currentToken;
            advance();
            while (true) {
                if (!currentToken.equals("(")) {
                writeLines("<identifier> " + tempToken + " </identifier>", true);
                writeLines("<" + tokenType + "> " + currentToken + " </" + tokenType + ">", true);
                process(".");
                if (!Tokenizer.functionOrMethodsNames.contains(tokenizer.ClassName + "." + tempToken)) {
                    Tokenizer.SuspectfunctionOrMethodsNames.add(tokenizer.ClassName + "." + tempToken);
                }
                } else {
                    break;
                }
                tempToken = currentToken;
                advance();
            }
    
            writeLines("<identifier> " + tempToken + " </identifier>", true);
            writeLines("<" + tokenType + "> " + currentToken + " </" + tokenType + ">", true);
            process("(");
            compileExpressionList();
            writeLines("<" + tokenType + "> " + currentToken + " </" + tokenType + ">", true);
            process(")");
        }
        numberOfTabs--;
        writeLines("</" + "term" + ">", true);
    }

    public void compileExpressionList() throws IOException {
        writeLines("<" + "expressionList" + ">", true);
        numberOfTabs++;

        if (!currentToken.equals(")")) {
            compileExpression();
            while (currentToken.equals(",")) {
                writeLines("<" + tokenType + "> " + currentToken + " </" + tokenType + ">", true);
                process(",");
                compileExpression();
            }
        }
        numberOfTabs--;
        writeLines("</" + "expressionList" + ">", true);
    }

    public void compileSubRoutineCall() throws IOException {
        String tempToken = currentToken;
        advance();
        while (true) {
            if (!currentToken.equals("(")) {
            writeLines("<identifier> " + tempToken + " </identifier>", true);
            writeLines("<" + tokenType + "> " + currentToken + " </" + tokenType + ">", true);
            process(".");
            if (!Tokenizer.functionOrMethodsNames.contains(tokenizer.ClassName + "." + tempToken)) {
                Tokenizer.SuspectfunctionOrMethodsNames.add(tokenizer.ClassName + "." + tempToken);
            }
            } else {
                break;
            }
            tempToken = currentToken;
            advance();
        }

        writeLines("<identifier> " + tempToken + " </identifier>", true);
        writeLines("<" + tokenType + "> " + currentToken + " </" + tokenType + ">", true);
        process("(");
        compileExpressionList();
        writeLines("<" + tokenType + "> " + currentToken + " </" + tokenType + ">", true);
        process(")");
        }
}
