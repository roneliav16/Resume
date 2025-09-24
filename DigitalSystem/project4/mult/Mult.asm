// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/4/Mult.asm

// Multiplies R0 and R1 and stores the result in R2.
// (R0, R1, R2 refer to RAM[0], RAM[1], and RAM[2], respectively.)
// The algorithm is based on repetitive addition.

            // initialize the variables
    @sum
    M=0   
    @R1   
    D=M
    @CONT
    D;JEQ
    @i
    M=D
(LOOP)
            // sum += R0
    @R0
    D=M
    @sum
    M=D+M
            // i -= 1
    @i
    M=M-1
            // if i > 0 jump to LOOP
    D=M
    @LOOP
    D;JGT
 (CONT)           // END LOOP and R2=sum
    @sum
    D=M
    @R2
    M=D
(END)
    @END
    0;JMP