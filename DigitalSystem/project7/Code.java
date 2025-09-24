import jdk.jfr.Timespan;

import java.io.BufferedWriter;
import java.io.IOException;

public class Code {
    static Integer lableCount = 0;

    public static void writeLine(String line, BufferedWriter writer) throws IOException {

        writer.append(line);
        writer.newLine(); // Add a newline after the command (optional)
    }

    public static void writePushPop(Instruction i, String segment, String index, BufferedWriter bufferedWriter) throws IOException {
        if(i == Instruction.C_PUSH){
            if (segment.equals("constant")){

                writeLine("//D="+index, bufferedWriter);
                writeLine("@"+index, bufferedWriter);
                writeLine("D=A", bufferedWriter);
                writeLine("//RAM[SP]=D", bufferedWriter);
                writeLine("@SP", bufferedWriter);
                writeLine("A=M", bufferedWriter);
                writeLine("M=D", bufferedWriter);
                writeLine("//SP++", bufferedWriter);
                writeLine("@SP", bufferedWriter);
                writeLine("M=M+1", bufferedWriter);
            } else {
                if (segment.equals("local")){
                    pushSegment("LCL", bufferedWriter, index);
                } else if(segment.equals("argument")){
                    pushSegment("ARG", bufferedWriter, index);
                } else if (segment.equals("this")) {
                    pushSegment("THIS", bufferedWriter, index);
                } else if (segment.equals("that")){
                    pushSegment("THAT", bufferedWriter, index);
                } else if (segment.equals("static")) {
                    pushImplicitSegment("16", bufferedWriter, index);
                } else if (segment.equals("temp")) {
                    pushImplicitSegment("5", bufferedWriter, index);
                } else {
                    pushImplicitSegment("3", bufferedWriter, index);
                }

            }

        }
        if (i == Instruction.C_POP){
            if (segment.equals("local")){
                popSegment("LCL", bufferedWriter, index);
            } else if(segment.equals("argument")){
                popSegment("ARG", bufferedWriter, index);
            } else if (segment.equals("this")) {
                popSegment("THIS", bufferedWriter, index);
            } else if (segment.equals("that")){
                popSegment("THAT", bufferedWriter, index);
            } else if (segment.equals("static")) {
                popImplicitSegment("16", bufferedWriter, index);
            } else if (segment.equals("temp")) {
                popImplicitSegment("5", bufferedWriter, index);
            } else { // pointer
                popImplicitSegment("3", bufferedWriter, index);
            }


        }

    }

    public static void popSegment(String segment, BufferedWriter bufferedWriter, String index) throws IOException {

        writeLine("// pop segment i", bufferedWriter);
        writeLine("@"+index, bufferedWriter);
        writeLine("D=A", bufferedWriter);
        writeLine("@"+segment, bufferedWriter);
        writeLine("D=D+M", bufferedWriter);
        writeLine("@i", bufferedWriter);
        writeLine("M=D", bufferedWriter);
        writeLine("@SP", bufferedWriter);
        writeLine("M=M-1", bufferedWriter);
        writeLine("A=M", bufferedWriter);
        writeLine("D=M", bufferedWriter);
        writeLine("@i", bufferedWriter);
        writeLine("A=M", bufferedWriter);
        writeLine("M=D",bufferedWriter);
    }

    public static void popImplicitSegment(String segment, BufferedWriter bufferedWriter, String index) throws IOException {
        writeLine("// pop segment i", bufferedWriter);
        writeLine("@"+index, bufferedWriter);
        writeLine("D=A", bufferedWriter);
        writeLine("@"+segment, bufferedWriter);
        writeLine("D=D+A", bufferedWriter);
        writeLine("@i", bufferedWriter);
        writeLine("M=D", bufferedWriter);
        writeLine("@SP", bufferedWriter);
        writeLine("M=M-1", bufferedWriter);
        writeLine("A=M", bufferedWriter);
        writeLine("D=M", bufferedWriter);
        writeLine("@i", bufferedWriter);
        writeLine("A=M", bufferedWriter);
        writeLine("M=D",bufferedWriter);
    }

    public static void pushImplicitSegment(String segString, BufferedWriter bufferedWriter, String index) throws IOException {
        writeLine("// push from "+segString + " + "+ index, bufferedWriter);
        writeLine("@"+index, bufferedWriter);
        writeLine("D=A", bufferedWriter);
        writeLine("@"+segString, bufferedWriter);
        writeLine("A=D+A", bufferedWriter);
        writeLine("D=M", bufferedWriter);
        writeLine("@SP", bufferedWriter);
        writeLine("A=M", bufferedWriter);
        writeLine("M=D", bufferedWriter);
        writeLine("@SP", bufferedWriter);
        writeLine("M=M+1", bufferedWriter);
    }

    public static void pushSegment(String segString, BufferedWriter bufferedWriter, String index) throws IOException {
        writeLine("// push from "+segString + " + "+ index, bufferedWriter);
        writeLine("@"+index, bufferedWriter);
        writeLine("D=A", bufferedWriter);
        writeLine("@"+segString, bufferedWriter);
        writeLine("A=D+M", bufferedWriter);
        writeLine("D=M", bufferedWriter);
        writeLine("@SP", bufferedWriter);
        writeLine("A=M", bufferedWriter);
        writeLine("M=D", bufferedWriter);
        writeLine("@SP", bufferedWriter);
        writeLine("M=M+1", bufferedWriter);
    }

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
                    writeLine("M=D+M", writer);
                    writeLine("@SP", writer);
                    writeLine("M=M-1", writer);
                    break;
                case "sub":
                    writeLine("@SP", writer);
                    writeLine("D=M-1", writer);
                    writeLine("D=D-1", writer);
                    writeLine("A=D", writer);
                    writeLine("D=M", writer);
                    writeLine("A=A+1", writer);
                    writeLine("D=D-M", writer);
                    writeLine("A=A-1", writer);
                    writeLine("M=D", writer);
                    writeLine("@SP", writer);
                    writeLine("M=M-1", writer);
                    break;
                case "neg":
                    writeLine("@SP", writer);
                    writeLine("D=M-1", writer);
                    writeLine("A=D", writer);
                    writeLine("D=M", writer);
                    writeLine("M=M-D", writer);
                    writeLine("M=M-D", writer);
                    break;
                case "eq":
                    writeLine("@SP", writer);
                    writeLine("D=M-1", writer);
                    writeLine("D=D-1", writer);
                    writeLine("A=D", writer);
                    writeLine("D=M", writer);
                    writeLine("A=A+1", writer);
                    writeLine("D=D-M", writer);
                    writeLine("@ISNOTEQUAL_"+lableCount.toString(), writer);
                    writeLine("D;JNE", writer);
                    writeLine("D=-1", writer);
                    writeLine("@CONTEQ_"+lableCount.toString(), writer);
                    writeLine("0;JMP", writer);
                    writeLine("(ISNOTEQUAL_"+lableCount.toString()+")", writer);
                    writeLine("D=0", writer);
                    writeLine("(CONTEQ_"+lableCount.toString()+")", writer);
                    writeLine("@SP", writer);
                    writeLine("A=M-1", writer);
                    writeLine("A=A-1", writer);
                    writeLine("M=D", writer);
                    writeLine("@SP", writer);
                    writeLine("M=M-1", writer);
                    lableCount++;
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

                default: // NOT
                    writeLine("@SP", writer);
                    writeLine("D=M-1", writer);
                    writeLine("A=D", writer);
                    writeLine("M=!M", writer);
            }


        } catch (IOException e) {
            System.out.println("An error occurred while writing to the file: " + e.getMessage());
        }
    }





}
