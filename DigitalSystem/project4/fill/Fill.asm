// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/4/Fill.asm

// Runs an infinite loop that listens to the keyboard input. 
// When a key is pressed (any key), the program blackens the screen,
// i.e. writes "black" in every pixel. When no key is pressed, 
// the screen should be cleared.

(WHITE_CHECK)
        // check KBD - if key (any key) is pressed jump to 
        // BLACK1 (fill the screen in black) if not jump again to WHITE_CHECK
        @KBD
        D=M
        @BLACK1
        D;JNE 
        @WHITE_CHECK
        0;JMP

(WHITE1)        // initialize the counter and screen size
        @i
        M=0
        @8192
        D=A
        @n
        M=D
(WHITE2)        // fill the screen in white
        @i
        D=M
        @n
        D=D-M
        @WHITE_CHECK
        D;JGT

        @i
        D=M
        @SCREEN
        A=D+A
        M=0

        @i
        M=M+1

        @WHITE2
        0;JMP

(BLACK1)         // initialize the counter and screen size
        @i
        M=0
        @8192
        D=A
        @n
        M=D
(BLACK2)        // fill the screen in black
        @i
        D=M
        @n
        D=D-M
        @BLACK_CHECK
        D;JGT

        @i
        D=M
        @SCREEN
        A=D+A
        M=-1

        @i
        M=M+1

        @BLACK2
        0;JMP
(BLACK_CHECK)
        // check KBD - if key (any key) is pressed jump to 
        // WHITE1 (fill the screen in white) if not jump again to BLACK_CHECK
        @KBD
        D=M
        @BLACK_CHECK
        D;JNE 
        @WHITE1
        0;JMP
(END)           // END loop
        @END
        0;JMP