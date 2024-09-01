;---------------------------------
;רון אליאב י'4
;---------------------------------
IDEAL
MODEL small
STACK 100h
DATASEG
x dw 10
y dw 10
;x2 dw 310
;y2 dw 190
var1 dw 0
color db 4
color2 db 7
colorSnake db 48
oreh dw 0
orehSnake db 0
message0 db '-------------------------------------------------------------------------------',13,10,'$'
message1 db '                         The Snake Game',13,10,'$'
message2 db '                 Use the UP = W , DOWN = S , LEFT = A and RIGHT = D  -Buttons',13,10,'$'
message3 db '                       press ENTER to start the game',13,10,'$'
message4 db 'Your Score is ','$'
randomNum db 0
foodx dw 0
lastX dw 0
lastY dw 0
firstX dw 159
firstY dw 99
Clock equ es:6Ch
turnUpX dw 0
turnUpY dw 0
turnDownX dw 0
turnDownY dw 0
turnLeftX dw 0
turnLeftY dw 0
turnRightX dw 0
turnRightY dw 0
yesOrNoForUp db 0 ;0 = yes , 1 = no
yesOrNoForLeft db 0 ;0 = yes , 1 = no
yesOrNoForRight db 0 ;0 = yes , 1 = no
yesOrNoForDown db 0 ;0 = yes , 1 = no
skipOnDelete db 0
skipOnDelete2 db 0
skipOnDelete3 db 0
skipOnDelete4 db 0
passOrNotForLeft db 0 ; 1=not pass , 0=pass or default
passOrNotForUp db 0 
passOrNotForRight db 0
passOrNotForDown db 0
allColors db 0 ;0= regular , 1=0 All Colors
score db 0


filename db 'Pic.bmp'
filehandle dw ?
filehandle2 dw ?
Header db 54 dup (0)
Palette db 256*4 dup (0)
ScrLine db 320 dup (0)
ErrorMsg db 'Error', 13, 10,'$'
filename2 db 'test.bmp'
CODESEG

proc moveToGraficMode
	; Graphic mode 
	mov ax, 13h
	int 10h
	ret
	endp moveToGraficMode
	
proc GraficBoard
	; Print red line
	pop dx
	pop [oreh]
	pop [y]
	pop [x]
	push dx
	
	mov cx,[oreh]
	mov [var1],cx
	mov si,0h
A:
	mov bh,0h
	mov cx,[x]
	mov dx,[y]
	mov al,[color]
	mov ah,0ch
	int 10h
	mov cx,[var1]
	dec [var1]
	inc [y]
	cmp si,cx
	jne A
	ret
endp GraficBoard

proc GraficBoard2
	; Print red line
	pop dx
	pop [oreh]
	pop [y]
	pop [x]
	push dx
	
	mov cx,[oreh]
	mov [var1],cx
	mov si,0h
B:
	mov bh,0h
	mov cx,[x]
	mov dx,[y]
	mov al,[color]
	mov ah,0ch
	int 10h
	mov cx,[var1]
	dec [var1]
	inc [x]
	cmp si,cx
	jne B
	ret
endp GraficBoard2

proc GraficSnake
	pop dx
	pop [oreh]
	pop [y]
	pop [x]
	push dx

	mov cx,[x]
	mov [orehSnake],cl
	mov cx,[oreh]
	mov [var1],cx
	mov si,0h
C:
	mov bh,0h
	mov cx,[x]
	mov dx,[y]
	mov al,[colorSnake]
	mov ah,0ch
	int 10h
	dec [var1]
	mov cx,[var1]
	inc [x]
	cmp si,cx
	jne C
	mov ax,[x]
	dec ax
	mov [lastX],ax
	mov ax,[y]
	mov [lastY],ax
	ret
endp GraficSnake

proc xyRandom
G:	mov ax, 40h
	mov es, ax
	mov ax, [es:6Ch]
	and al, 00000010b
	add al,1
	mov [randomNum],al
	mov ah, 2Ch
	int 21h 
	cmp dl,12
	jb G
	mov al,dl
	mul [randomNum]
	mov cx,0001H 
	and cx,ax
	cmp cx,1
	je G
	mov [x],ax

GG:
	mov ax, 40h
	mov es, ax
	mov ax, [es:6Ch]
	and al, 0000001b
	add al,1
	mov [randomNum],al
	mov ah, 2Ch
	int 21h
	cmp dl,12
	jb GG
	mov al,dl
	mul [randomNum]
	mov cx,0001H 
	and cx,ax
	cmp cx,1
	je GG
	cmp ax,180
	ja GG
	mov [y],ax
	
	mov bh,0h
	mov cx,[x]
	mov dx,[y]
	mov ah,0Dh
	int 10h
	cmp al,48
	je G

	mov ax,[x]
	cmp ax,56
	je MN
	cmp ax,256
	je MN
	mov bx,[y]
	cmp bx,50
	je MNM
	cmp bx,150
	je MNM
	jmp ASD
MN:
	mov bx,[y]
	cmp bx,50
	jb ASD
	cmp bx,150
	ja ASD
	jmp G
MNM:
	cmp ax,76
	jb ASD
	cmp ax,236
	ja ASD
	jmp G
ASD:
	ret
endp xyRandom

proc food
	pop dx
	pop [oreh]
	pop [y]
	pop [x]
	push dx
	
	mov cx,[x]
	mov [foodx],cx

	mov cx,[oreh]
	mov [var1],cx
	mov si,0h
F:
	mov bh,0h
	mov cx,[x]
	mov dx,[y]
	mov al,[color2]
	mov ah,0ch
	int 10h
	dec [var1]
	mov cx,[var1]
	inc [x]
	cmp si,cx
	jne F
	ret
endp food

proc deletePartOfTheSnakeForLeft
	mov cx,2
	mov [var1],cx
	mov si,0h
	
Z:
	mov bh,0h
	mov cx,[lastX]
	mov dx,[lastY]
	mov al,0
	mov ah,0ch
	int 10h
	dec [var1]
	mov cx,[var1]
	dec [lastX]
	cmp si,cx
	jne Z
	
	add [lastX],2
	inc [lastY]
	mov cx,2
	mov [var1],cx
	mov si,0h
ZZ:
	mov bh,0h
	mov cx,[lastX]
	mov dx,[lastY]
	mov al,0
	mov ah,0ch
	int 10h
	dec [var1]
	mov cx,[var1]
	dec [lastX]
	cmp si,cx
	jne ZZ
	
	dec [lastY]
	mov cx,[lastX]
	cmp cx,[turnUpX]
	jne E 
	mov dx,[lastY]
	cmp dx,[turnUpY]
	jne E
	dec [lastY]
	add [lastX],2
	mov [yesOrNoForUp],1
	mov [passOrNotForLeft],0
E:
	mov cx,[lastX]
	cmp cx,[turnDownX]
	jne EM
	mov dx,[lastY]
	cmp dx,[turnDownY]
	jne EM
	add [lastY],2
	add [lastX],2
	mov [yesOrNoForDown],1
	mov [passOrNotForLeft],0
EM:
	ret
endp deletePartOfTheSnakeForLeft

proc addPartOfTheSnakeForLeft
	mov cx,2
	mov [var1],cx
	mov si,0h
AM:
	mov bh,0h
	mov cx,[firstX]
	mov dx,[firstY]
	mov ah,0Dh
	int 10h
	cmp al,0
	je M
	cmp al,7
	jne MM
	mov [skipOnDelete],1
	jmp M
MM:
	call endGame
M:
	mov bh,0h
	mov cx,[firstX]
	mov dx,[firstY]
	mov al,[colorSnake]
	mov ah,0ch
	int 10h
	dec [var1]
	mov cx,[var1]
	dec [firstX]
	cmp si,cx
	jne AM
	
	add [firstX],2
	inc [firstY]
	mov cx,2
	mov [var1],cx
	mov si,0h
AM2:
	mov bh,0h
	mov cx,[firstX]
	mov dx,[firstY]
	mov al,[colorSnake]
	mov ah,0ch
	int 10h
	dec [var1]
	mov cx,[var1]
	dec [firstX]
	cmp si,cx
	jne AM2
	
	dec [firstY]
	ret
endp addPartOfTheSnakeForLeft

proc deletePartOfTheSnakeForUp
	mov cx,2
	mov [var1],cx
	mov si,0h
K:
	mov bh,0h
	mov cx,[lastX]
	mov dx,[lastY]
	mov al,0
	mov ah,0ch
	int 10h
	dec [var1]
	mov cx,[var1]
	dec [lastY]
	cmp si,cx
	jne K
	
	add [lastY],2
	dec [lastX]
	mov cx,2
	mov [var1],cx
	mov si,0h
KK:
	mov bh,0h
	mov cx,[lastX]
	mov dx,[lastY]
	mov al,0
	mov ah,0ch
	int 10h
	dec [var1]
	mov cx,[var1]
	dec [lastY]
	cmp si,cx
	jne KK
	
	inc [lastX]
	mov cx,[lastX]
	cmp cx,[turnLeftX]
	jne E1
	mov dx,[lastY]
	cmp dx,[turnLeftY]
	jne E1
	inc [lastY]
	sub [lastX],2
	mov [yesOrNoForLeft],1
	mov [passOrNotForUp],0
	jmp EE
E1:	
	mov cx,[lastX]
	cmp cx,[turnRightX]
	jne EE
	mov dx,[lastY]
	cmp dx,[turnRightY]
	jne EE
	inc [lastY]
	inc [lastX]
	mov [yesOrNoForRight],1
	mov [passOrNotForUp],0
EE:
	ret
endp deletePartOfTheSnakeForUp	

proc addPartOfTheSnakeForUp
	mov cx,2
	mov [var1],cx
	mov si,0h
AU:
	mov bh,0h
	mov cx,[firstX]
	mov dx,[firstY]
	mov ah,0Dh
	int 10h
	cmp al,0
	je O
	cmp al,7
	jne OO
	mov [skipOnDelete2],1
	jmp O
OO:
	call endGame
O:
	mov bh,0h
	mov cx,[firstX]
	mov dx,[firstY]
	mov al,[colorSnake]
	mov ah,0ch
	int 10h
	dec [var1]
	mov cx,[var1]
	dec [firstY]
	cmp si,cx
	jne AU
	
	dec [firstX]
	add [firstY],2
	mov cx,2
	mov [var1],cx
	mov si,0h
AU2:
	mov bh,0h
	mov cx,[firstX]
	mov dx,[firstY]
	mov al,[colorSnake]
	mov ah,0ch
	int 10h
	dec [var1]
	mov cx,[var1]
	dec [firstY]
	cmp si,cx
	jne AU2
	
	inc [firstX]
	ret
endp addPartOfTheSnakeForUp

proc deletePartOfTheSnakeForRight
	mov cx,2
	mov [var1],cx
	mov si,0h
	
PP:
	mov bh,0h
	mov cx,[lastX]
	mov dx,[lastY]
	mov al,0
	mov ah,0ch
	int 10h
	dec [var1]
	mov cx,[var1]
	inc [lastX]
	cmp si,cx
	jne PP
	
	sub [lastX],2
	inc [lastY]
	mov cx,2
	mov [var1],cx
	mov si,0h
PPP:
	mov bh,0h
	mov cx,[lastX]
	mov dx,[lastY]
	mov al,0
	mov ah,0ch
	int 10h
	dec [var1]
	mov cx,[var1]
	inc [lastX]
	cmp si,cx
	jne PPP
	
	dec [lastY]
	mov cx,[lastX]
	cmp cx,[turnUpX]
	jne P 
	mov dx,[lastY]
	cmp dx,[turnUpY]
	jne P
	dec [lastY]
	dec [lastX]
	mov [yesOrNoForUp],1
	mov [passOrNotForRight],0
P:
	mov cx,[lastX]
	cmp cx,[turnDownX]
	jne PH 
	mov dx,[lastY]
	cmp dx,[turnDownY]
	jne PH
	add [lastY],2
	dec [lastX]
	mov [yesOrNoForDown],1
	mov [passOrNotForRight],0
PH:
	ret
endp deletePartOfTheSnakeForRight

proc addPartOfTheSnakeForRight
	mov cx,2
	mov [var1],cx
	mov si,0h
AM5:
	mov bh,0h
	mov cx,[firstX]
	mov dx,[firstY]
	mov ah,0Dh
	int 10h
	cmp al,0
	je y1
	cmp al,7
	jne yy
	mov [skipOnDelete3],1
	jmp y1
yy:
	call endGame
y1:
	mov bh,0h
	mov cx,[firstX]
	mov dx,[firstY]
	mov al,[colorSnake]
	mov ah,0ch
	int 10h
	dec [var1]
	mov cx,[var1]
	inc [firstX]
	cmp si,cx
	jne AM5
	
	sub [firstX],2
	inc [firstY]
	mov cx,2
	mov [var1],cx
	mov si,0h
AM6:
	mov bh,0h
	mov cx,[firstX]
	mov dx,[firstY]
	mov al,[colorSnake]
	mov ah,0ch
	int 10h
	dec [var1]
	mov cx,[var1]
	inc [firstX]
	cmp si,cx
	jne AM6
	
	dec [firstY]
	ret
endp addPartOfTheSnakeForRight

proc deletePartOfTheSnakeForDown
	mov cx,2
	mov [var1],cx
	mov si,0h
KP:
	mov bh,0h
	mov cx,[lastX]
	mov dx,[lastY]
	mov al,0
	mov ah,0ch
	int 10h
	dec [var1]
	mov cx,[var1]
	inc [lastY]
	cmp si,cx
	jne KP
	
	sub [lastY],2
	dec [lastX]
	mov cx,2
	mov [var1],cx
	mov si,0h
KKP:
	mov bh,0h
	mov cx,[lastX]
	mov dx,[lastY]
	mov al,0
	mov ah,0ch
	int 10h
	dec [var1]
	mov cx,[var1]
	inc [lastY]
	cmp si,cx
	jne KKP
	
	inc [lastX]
	mov cx,[lastX]
	cmp cx,[turnLeftX]
	jne E7
	mov dx,[lastY]
	cmp dx,[turnLeftY]
	jne E7
	sub [lastY],2
	sub [lastX],2
	mov [yesOrNoForLeft],1
	mov [passOrNotForDown],0
	jmp EE7
E7:	
	mov cx,[lastX]
	cmp cx,[turnRightX]
	jne EE7
	mov dx,[lastY]
	cmp dx,[turnRightY]
	jne EE7
	inc [lastX]
	sub [lastY],2
	mov [yesOrNoForRight],1
	mov [passOrNotForDown],0
EE7:
	ret
endp deletePartOfTheSnakeForDown 

proc addPartOfTheSnakeForDown
	mov cx,2
	mov [var1],cx
	mov si,0h
BU:
	mov bh,0h
	mov cx,[firstX]
	mov dx,[firstY]
	mov ah,0Dh
	int 10h
	cmp al,0
	je OB
	cmp al,7
	jne OOB
	mov [skipOnDelete4],1
	jmp OB
OOB:
	call endGame
OB:
	mov bh,0h
	mov cx,[firstX]
	mov dx,[firstY]
	mov al,[colorSnake]
	mov ah,0ch
	int 10h
	dec [var1]
	mov cx,[var1]
	inc [firstY]
	cmp si,cx
	jne BU
	
	dec [firstX]
	sub [firstY],2
	mov cx,2
	mov [var1],cx
	mov si,0h
AY2:
	mov bh,0h
	mov cx,[firstX]
	mov dx,[firstY]
	mov al,[colorSnake]
	mov ah,0ch
	int 10h
	dec [var1]
	mov cx,[var1]
	inc [firstY]
	cmp si,cx
	jne AY2
	
	inc [firstX]
	ret
endp addPartOfTheSnakeForDown
	
proc waitSecond
	mov ax, 40h
	mov es, ax
	mov ax, [Clock]
FirstTick:
	cmp ax, [Clock]
	mov cx, 1 ; 182x0.055sec = ~10sec
DelayLoop:
	mov ax, [Clock]
	Tick:
	cmp ax, [Clock]
	je Tick
	loop DelayLoop
	
	cmp [allColors],1
	jne TY
AGAIN:
	mov ax, 40h
	mov es, ax
	mov ax, [es:6Ch]
	and al, 01111111b
	add al,1
	cmp al,48
	je AGAIN
	cmp al,7
	je AGAIN
	cmp al,4
	je AGAIN
	mov [colorSnake],al
TY:
	ret
endp waitSecond

proc InGame 
	jmp SA
D:
	call waitSecond
	call addPartOfTheSnakeForLeft
	cmp [skipOnDelete],1
	je H9
	call deletePartOfTheSnakeForDown
	jmp HHH9
H9:
	call xyRandom					;יצירת קו של אוכל
	push [x]
	push [y]
	mov [oreh],2
	push [oreh]
	call food
									;יצירת קו שני של אוכל
	push [foodx]
	sub [y],1
	push [y]
	mov [oreh],2
	push [oreh]
	call food	
	add [score],1
HHH9:	
	mov [skipOnDelete],0
	mov ah,1
	int 16h
	jz LEFT2E
	mov ah,00h
	int 16h

	cmp ah,11h
	je leftToReadyUP_turn
	cmp ah,1Fh
	je DOWN5
	jmp LEFT2E
leftToReadyUP_turn:
	mov ax,[firstX]
	mov [turnUpX],ax
	mov ax,[firstY]
	mov [turnUpY],ax
	add [firstX],2
	dec [firstY]
	mov [passOrNotForLeft],1
	jmp RR4
R34:
	mov [yesOrNoForLeft],0
	jmp UP
RR4:
	cmp [passOrNotForDown],0
	je R34
	call waitSecond
	call addPartOfTheSnakeForUp
	cmp [skipOnDelete2],1
	je H11S
	call deletePartOfTheSnakeForDown
	jmp HHH11S
LEFT2E:
	jmp LEFT2
DOWN5:
	jmp DOWN2
H11S:
	call xyRandom					;יצירת קו של אוכל
	push [x]
	push [y]
	mov [oreh],2
	push [oreh]
	call food
									;יצירת קו שני של אוכל
	push [foodx]
	sub [y],1
	push [y]
	mov [oreh],2
	push [oreh]
	call food	
	add [score],1
HHH11S:	
	mov [skipOnDelete2],0
	mov ah,1
	int 16h
	jz RR4
	mov ah,00h
	int 16h

	cmp ah,11h
;	je rightToReadyUP
	cmp ah,1Fh
;	je DOWNO
	jmp RR4
S:
	call waitSecond
	call addPartOfTheSnakeForLeft
	cmp [skipOnDelete],1
	je H
	call deletePartOfTheSnakeForUp
	jmp HHH
D2:
	jmp D
S2:
	jmp S
H:
	call xyRandom					;יצירת קו של אוכל
	push [x]
	push [y]
	mov [oreh],2
	push [oreh]
	call food
									;יצירת קו שני של אוכל
	push [foodx]
	sub [y],1
	push [y]
	mov [oreh],2
	push [oreh]
	call food	
	add [score],1
HHH:	
	mov [skipOnDelete],0
	mov ah,1
	int 16h
	jz LEFT
	mov ah,00h
	int 16h

	cmp ah,11h
	je leftToReadyUP4
	cmp ah,1Fh
	je DOWN2C
	jmp LEFT
DOWN2C:
	jmp DOWN2
leftToReadyUP4:
	jmp leftToReadyUP2
LEFT2:
	cmp [yesOrNoForLeft],0
	je D2
	mov [passOrNotForDown],0
	mov [yesOrNoForLeft],0
	jmp SA
LEFT:
	cmp [yesOrNoForLeft],0
	je S2
	mov [passOrNotForUp],0
	mov [yesOrNoForLeft],0
SA:
	call waitSecond
	call addPartOfTheSnakeForLeft
	cmp [skipOnDelete],1
	je HH
	call deletePartOfTheSnakeForLeft
	jmp HHHH
HH:
	call xyRandom					;יצירת קו של אוכל
	push [x]
	push [y]
	mov [oreh],2
	push [oreh]
	call food
									;יצירת קו שני של אוכל
	push [foodx]
	sub [y],1
	push [y]
	mov [oreh],2
	push [oreh]
	call food	
	add [score],1
HHHH:
	mov [skipOnDelete],0
	mov ah,1
	int 16h
	jz SA
	mov ah,00h
	int 16h

	cmp ah,11h
	je leftToReadyUP2
	cmp ah,1Fh
	je leftToReadyDOWN
	jmp SA
leftToReadyDOWN:
	mov ax,[firstX]
	mov [turnDownX],ax
	mov ax,[firstY]
	mov [turnDownY],ax
	add [firstX],2
	add [firstY],2
	mov [passOrNotForLeft],1
	jmp DOWN1
leftToReadyUP2:
	jmp leftToReadyUP1
DOWN1:
	jmp DOWN
WJ:
	call waitSecond
	call addPartOfTheSnakeForRight
	cmp [skipOnDelete3],1
	je H14
	call deletePartOfTheSnakeForDown
	jmp HHH14
H14:
	call xyRandom					;יצירת קו של אוכל
	push [x]
	push [y]
	mov [oreh],2
	push [oreh]
	call food
									;יצירת קו שני של אוכל
	push [foodx]
	sub [y],1
	push [y]
	mov [oreh],2
	push [oreh]
	call food	
	add [score],1
HHH14:	
	mov [skipOnDelete3],0
	mov ah,1
	int 16h
	jz RIGHT34
	mov ah,00h
	int 16h

	cmp ah,11h
	je rightToReadyUP1
	cmp ah,1Fh
	je DOWN228
	jmp RIGHT3
W:
	call waitSecond
	call addPartOfTheSnakeForRight
	cmp [skipOnDelete3],1
	je H1
	call deletePartOfTheSnakeForUp
	jmp HHH1
WJ2:
	jmp WJ
W2:
	jmp W
RIGHT34:
	jmp RIGHT3
H1:
	call xyRandom					;יצירת קו של אוכל
	push [x]
	push [y]
	mov [oreh],2
	push [oreh]
	call food
									;יצירת קו שני של אוכל
	push [foodx]
	sub [y],1
	push [y]
	mov [oreh],2
	push [oreh]
	call food	
	add [score],1
HHH1:	
	mov [skipOnDelete3],0
	mov ah,1
	int 16h
	jz RIGHT
	mov ah,00h
	int 16h

	cmp ah,11h
	je rightToReadyUP1
	cmp ah,1Fh
	je DOWN228
	jmp RIGHT
rightToReadyUP1:
	jmp rightToReadyUP
	DOWN228:
	jmp DOWN22
RIGHT3:
	cmp [yesOrNoForRight],0
	je WJ2
	mov [passOrNotForDown],0
	mov [yesOrNoForRight],0
	jmp WW
RIGHT:
	cmp [yesOrNoForRight],0
	je W2
	mov [passOrNotForUp],0
	mov [yesOrNoForRight],0
WW:
	call waitSecond
	call proc addPartOfTheSnakeForRight
	cmp [skipOnDelete3],1
	je HH1
	call proc deletePartOfTheSnakeForRight
	jmp HHHH1
leftToReadyUP1:	
	jmp leftToReadyUP
rightToReadyUP18:
	jmp rightToReadyUP1
HH1:
	call xyRandom					;יצירת קו של אוכל
	push [x]
	push [y]
	mov [oreh],2
	push [oreh]
	call food
									;יצירת קו שני של אוכל
	push [foodx]
	sub [y],1
	push [y]
	mov [oreh],2
	push [oreh]
	call food	
	add [score],1
HHHH1:
	mov [skipOnDelete3],0
	mov ah,1
	int 16h
	jz WW
	mov ah,00h
	int 16h

	cmp ah,11h
	je rightToReadyUP18
	cmp ah,1Fh
	je rightToReadyDOWN
	jmp WW
rightToReadyDOWN:
	mov ax,[firstX]
	mov [turnDownX],ax
	mov ax,[firstY]
	mov [turnDownY],ax
	dec [firstX]
	add [firstY],2
	mov [passOrNotForRight],1
	jmp DOWN22
Q2:
	call waitSecond
	call addPartOfTheSnakeForUp
	cmp [skipOnDelete2],1
	je U2
	call deletePartOfTheSnakeForRight
	jmp UUU2
U2:
	call xyRandom					;יצירת קו של אוכל
	push [x]
	push [y]
	mov [oreh],2
	push [oreh]
	call food
									;יצירת קו שני של אוכל
	push [foodx]
	sub [y],1
	push [y]
	mov [oreh],2
	push [oreh]
	call food	
	add [score],1
UUU2:
	mov [skipOnDelete2],0
	mov ah,1
	int 16h
	jz UP21
	mov ah,00h
	int 16h
	
	cmp ah, 1Eh
	je upToReadyLEFT1_turn
	cmp ah,20h
	je upToReadyRIGHT2
	jmp UP2
upToReadyLEFT1_turn:
	mov ax,[firstX]
	mov [turnLeftX],ax
	mov ax,[firstY]
	mov [turnLeftY],ax
	sub [firstX],2
	inc [firstY]
	mov [passOrNotForUp],1
	jmp RR12
upToReadyRIGHT2:
	jmp upToReadyRIGHT
UP21:
	jmp UP2
R312:
	mov [yesOrNoForUp],0
	jmp LEFT
RR12:
	cmp [passOrNotForRight],0
	je R312
	call waitSecond
	call addPartOfTheSnakeForLeft
	cmp [skipOnDelete],1
	je H11P
	call deletePartOfTheSnakeForRight
	jmp HHH11P
H11P:
	call xyRandom					;יצירת קו של אוכל
	push [x]
	push [y]
	mov [oreh],2
	push [oreh]
	call food
									;יצירת קו שני של אוכל
	push [foodx]
	sub [y],1
	push [y]
	mov [oreh],2
	push [oreh]
	call food	
	add [score],1
HHH11P:	
	mov [skipOnDelete],0
	mov ah,1
	int 16h
	jz RR12
	mov ah,00h
	int 16h

	cmp ah,11h
;	je rightToReadyUP
	cmp ah,1Fh
;	je DOWNO
	jmp RR12
RIGHT2:
	jmp RIGHT
Q:
	call waitSecond
	call addPartOfTheSnakeForUp
	cmp [skipOnDelete2],1
	je U
	call deletePartOfTheSnakeForLeft
	jmp UUU
DOWN2:
	jmp DOWN
upToReadyLEFT1:
	jmp upToReadyLEFT
U:
	call xyRandom					;יצירת קו של אוכל
	push [x]
	push [y]
	mov [oreh],2
	push [oreh]
	call food					;יצירת קו שני של אוכל
	push [foodx]
	sub [y],1
	push [y]
	mov [oreh],2
	push [oreh]
	call food	
	add [score],1
UUU:
	mov [skipOnDelete2],0
	mov ah,1
	int 16h
	jz UPi
	mov ah,00h
	int 16h
	
	cmp ah, 1Eh
	je upToReadyLEFT_turn
	cmp ah,20h
	je upToReadyRIGHT_turn1
	jmp UP
upToReadyLEFT_turn:
	mov ax,[firstX]
	mov [turnLeftX],ax
	mov ax,[firstY]
	mov [turnLeftY],ax
	sub [firstX],2
	inc [firstY]
	mov [passOrNotForUp],1
	jmp RR6
R36:
	mov [yesOrNoForUp],0
	jmp LEFT
UPi:
	jmp UP
RR6:
	cmp [passOrNotForLeft],0
	je R36
	call waitSecond
	call addPartOfTheSnakeForLeft
	cmp [skipOnDelete],1
	je H116
	call deletePartOfTheSnakeForLeft
	jmp HHH116
upToReadyLEFT_turn1:
	jmp upToReadyLEFT_turn
upToReadyRIGHT_turn1:	
	jmp upToReadyRIGHT_turn
Q10:
	jmp Q
Q3:
	jmp Q2
H116:
	call xyRandom					;יצירת קו של אוכל
	push [x]
	push [y]
	mov [oreh],2
	push [oreh]
	call food
									;יצירת קו שני של אוכל
	push [foodx]
	sub [y],1
	push [y]
	mov [oreh],2
	push [oreh]
	call food	
	add [score],1
HHH116:	
	mov [skipOnDelete],0
	mov ah,1
	int 16h
	jz RR6
	mov ah,00h
	int 16h

	cmp ah,11h
;	je upToReadyLEFT_turn1
	cmp ah,1Fh
;	je DOWNO
	jmp RR6
UP2:
	cmp [yesOrNoForUp],0
	je Q3
	mov [passOrNotForRight],0
	mov [yesOrNoForUp],0
	jmp QQ
UP:
	cmp [yesOrNoForUp],0
	je Q10
	mov [passOrNotForLeft],0
	mov [yesOrNoForUp],0
QQ:
	call waitSecond
	call addPartOfTheSnakeForUp
	cmp [skipOnDelete2],1
	je UU
	call deletePartOfTheSnakeForUp
	jmp UUUU
upToReadyRIGHT1:
	jmp upToReadyRIGHT2
UU:
	call xyRandom					;יצירת קו של אוכל
	push [x]
	push [y]
	mov [oreh],2
	push [oreh]
	call food					;יצירת קו שני של אוכל
	push [foodx]
	sub [y],1
	push [y]
	mov [oreh],2
	push [oreh]
	call food	
	add [score],1
UUUU:
	mov [skipOnDelete2],0
	mov ah,1
	int 16h
	jz QQ
	mov ah,00h
	int 16h
	
	cmp ah, 1Eh
	je upToReadyLEFT2
	cmp ah,20h
	je upToReadyRIGHT1
	jmp QQ	
LL1:														;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;     D  O  W  N
	call waitSecond
	call addPartOfTheSnakeForDown
	cmp [skipOnDelete4],1
	je U23
	call deletePartOfTheSnakeForRight
	jmp UUU23
U23:
	call xyRandom					;יצירת קו של אוכל
	push [x]
	push [y]
	mov [oreh],2
	push [oreh]
	call food
									;יצירת קו שני של אוכל
	push [foodx]
	sub [y],1
	push [y]
	mov [oreh],2
	push [oreh]
	call food	
	add [score],1
UUU23:
	mov [skipOnDelete4],0
	mov ah,1
	int 16h
	jz DOWN223
	mov ah,00h
	int 16h
	
	cmp ah, 1Eh
	je downToReadyLEFT2
	cmp ah,20h
	je downToReadyRIGHT3			;------------------
	jmp DOWN223
LL12:
	jmp LL1
upToReadyLEFT2:
	jmp upToReadyLEFT
VB:
	call waitSecond
	call addPartOfTheSnakeForDown
	cmp [skipOnDelete4],1
	je UO
	call deletePartOfTheSnakeForLeft
	jmp UUO
DOWN223:
	jmp DOWN22
UO:
	call xyRandom					;יצירת קו של אוכל
	push [x]
	push [y]
	mov [oreh],2
	push [oreh]
	call food					;יצירת קו שני של אוכל
	push [foodx]
	sub [y],1
	push [y]
	mov [oreh],2
	push [oreh]
	call food	
	add [score],1
UUO:
	mov [skipOnDelete4],0
	mov ah,1
	int 16h
	jz DOWN
	mov ah,00h
	int 16h
	
	cmp ah, 1Eh
	cmp ah,20h
	jmp DOWN
VB2:
	jmp VB	
downToReadyLEFT2:
	jmp downToReadyLEFT
downToReadyRIGHT3:
	jmp downToReadyRIGHT2
DOWN22:
	cmp [yesOrNoForDown],0
	je LL12
	mov [passOrNotForRight],0
	mov [yesOrNoForDown],0
	jmp LL
DOWN:						;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;; D  O  W  N
	cmp [yesOrNoForDown],0
	je VB2
	mov [passOrNotForLeft],0
	mov [yesOrNoForDown],0
LL:	
	call waitSecond
	call addPartOfTheSnakeForDown 
	cmp [skipOnDelete4],1
	je LL2						
	call deletePartOfTheSnakeForDown
	jmp LLLL
LL2:								
	call xyRandom					;יצירת קו של אוכל
	push [x]
	push [y]
	mov [oreh],2
	push [oreh]
	call food					;יצירת קו שני של אוכל
	push [foodx]
	sub [y],1
	push [y]
	mov [oreh],2
	push [oreh]
	call food	
	add [score],1
LLLL:
	mov [skipOnDelete4],0
	mov ah,1
	int 16h
	jz LL
	mov ah,00h
	int 16h
	
	cmp ah, 1Eh
	je downToReadyLEFT
	cmp ah,20h
	je downToReadyRIGHT2
	jmp LL			;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;   D   O   W   N
downToReadyLEFT:
	mov ax,[firstX]
	mov [turnLeftX],ax
	mov ax,[firstY]
	mov [turnLeftY],ax
	sub [firstX],2
	sub [firstY],2
	mov [passOrNotForDown],1
	jmp LEFT2
downToReadyRIGHT2:
	jmp downToReadyRIGHT
downToReadyLEFT_turn:

leftToReadyUP:
	mov ax,[firstX]
	mov [turnUpX],ax
	mov ax,[firstY]
	mov [turnUpY],ax
	add [firstX],2
	dec [firstY]
	mov [passOrNotForLeft],1
	jmp UP
upToReadyLEFT:
	mov ax,[firstX]
	mov [turnLeftX],ax
	mov ax,[firstY]
	mov [turnLeftY],ax
	sub [firstX],2
	inc [firstY]
	mov [passOrNotForUp],1
	jmp LEFT
UP4:
	jmp UP
RIGHT1:
	jmp RIGHT2
upToReadyRIGHT_turn:
	mov ax,[firstX]
	mov [turnRightX],ax
	mov ax,[firstY]
	mov [turnRightY],ax
	inc [firstX]
	inc [firstY]
	mov [passOrNotForUp],1
	jmp RR
R3:
	mov [yesOrNoForUp],0
	jmp RIGHT1
RR:
	cmp [passOrNotForLeft],0
	je R3
	call waitSecond
	call addPartOfTheSnakeForRight
	cmp [skipOnDelete3],1
	je H11
	call deletePartOfTheSnakeForLeft
	jmp HHH11
DOWNO:
	jmp DOWN
H11:
	call xyRandom					;יצירת קו של אוכל
	push [x]
	push [y]
	mov [oreh],2
	push [oreh]
	call food
									;יצירת קו שני של אוכל
	push [foodx]
	sub [y],1
	push [y]
	mov [oreh],2
	push [oreh]
	call food	
	add [score],1
HHH11:	
	mov [skipOnDelete3],0
	mov ah,1
	int 16h
	jz RR
	mov ah,00h
	int 16h

	cmp ah,11h
	je rightToReadyUP
	cmp ah,1Fh
	je DOWNO
	jmp RR
upToReadyRIGHT:
	mov ax,[firstX]
	mov [turnRightX],ax
	mov ax,[firstY]
	mov [turnRightY],ax
	inc [firstX]
	inc [firstY]
	mov [passOrNotForUp],1
	jmp RIGHT

rightToReadyUP:
	mov ax,[firstX]
	mov [turnUpX],ax
	mov ax,[firstY]
	mov [turnUpY],ax
	dec [firstX]
	dec [firstY]
	mov [passOrNotForRight],1
	jmp UP2
downToReadyRIGHT:
	mov ax,[firstX]
	mov [turnRightX],ax
	mov ax,[firstY]
	mov [turnRightY],ax
	inc [firstX]
	sub [firstY],2
	mov [passOrNotForDown],1
	jmp RIGHT3
	
	ret	
endp InGame

proc OpenFile	; Open file	
	mov ax,0
	mov ah, 3Dh
	xor al, al
	mov dx, offset filename2
	int 21h
	jc openerror
	mov [filehandle2], ax
	ret
openerror:
	mov dx, offset ErrorMsg
	mov ah, 9h
	int 21h
	ret
endp OpenFile
proc ReadHeader
	; Read BMP file header, 54 bytes
	mov ah,3fh
	mov bx, [filehandle2]
	mov cx,54
	mov dx,offset Header
	int 21h
	ret
	endp ReadHeader
proc ReadPalette
	; Read BMP file color palette, 256 colors * 4 bytes (400h)
	mov ah,3fh
	mov cx,400h
	mov dx,offset Palette
	int 21h
	ret
endp ReadPalette
proc CopyPal
	; Copy the colors palette to the video memory
	; The number of the first color should be sent to port 3C8h
	; The palette is sent to port 3C9h
	mov si,offset Palette
	mov cx,256
	mov dx,3C8h
	mov al,0
	; Copy starting color to port 3C8h
	out dx,al
	; Copy palette itself to port 3C9h
	inc dx
PalLoop:
	; Note: Colors in a BMP file are saved as BGR values rather than RGB.
	mov al,[si+2] ; Get red value.
	shr al,2 ; Max. is 255, but video palette maximal
	; value is 63. Therefore dividing by 4.
	out dx,al ; Send it.
	mov al,[si+1] ; Get green value.
	shr al,2
	out dx,al ; Send it.
	mov al,[si] ; Get blue value.
	shr al,2
	out dx,al ; Send it.
	add si,4 ; Point to next color.
	; (There is a null chr. after every color.)
	loop PalLoop
	ret
endp CopyPal
proc CopyBitmap
	; BMP graphics are saved upside-down.
	; Read the graphic line by line (200 lines in VGA format),
	; displaying the lines from bottom to top.
	mov ax, 0A000h
	mov es, ax
	mov cx,200
	PrintBMPLoop:
	push cx
	; di = cx*320, point to the correct screen line
	mov di,cx
	shl cx,6
	shl di,8
	add di,cx
	; Read one line
	mov ah,3fh
	mov cx,320
	mov dx,offset ScrLine
	int 21h
	; Copy one line into video memory
	cld ; Clear direction flag, for movsb
	mov cx,320
	mov si,offset ScrLine
	rep movsb ; Copy line to the screen
	 ;rep movsb is same as the following code:
	 ;mov es:di, ds:si
	 ;inc si
	 ;inc di
	 ;dec cx
	 ;loop until cx=0
	pop cx
	loop PrintBMPLoop
	ret
endp CopyBitmap
	; Process BMP file
	
	proc OpenFile2	; Open file
	mov ah, 3Dh
	xor al, al
	mov dx, offset filename
	int 21h
	mov bx,0 
	cmp bx,0
	je ZX
ZX:
	jc openerror2
	mov [filehandle], ax
	ret
openerror2:
	mov dx, offset ErrorMsg
	mov ah, 9h
	int 21h
	ret
endp OpenFile2
proc ReadHeader2
	; Read BMP file header, 54 bytes
	mov ah,3fh
	mov bx, [filehandle]
	mov cx,54
	mov dx,offset Header
	int 21h
	ret
	endp ReadHeader2
proc ReadPalette2
	; Read BMP file color palette, 256 colors * 4 bytes (400h)
	mov ah,3fh
	mov cx,400h
	mov dx,offset Palette
	int 21h
	ret
endp ReadPalette2
proc CopyPal2
	; Copy the colors palette to the video memory
	; The number of the first color should be sent to port 3C8h
	; The palette is sent to port 3C9h
	mov si,offset Palette
	mov cx,256
	mov dx,3C8h
	mov al,0
	; Copy starting color to port 3C8h
	out dx,al
	; Copy palette itself to port 3C9h
	inc dx
PalLoop2:
	; Note: Colors in a BMP file are saved as BGR values rather than RGB.
	mov al,[si+2] ; Get red value.
	shr al,2 ; Max. is 255, but video palette maximal
	; value is 63. Therefore dividing by 4.
	out dx,al ; Send it.
	mov al,[si+1] ; Get green value.
	shr al,2
	out dx,al ; Send it.
	mov al,[si] ; Get blue value.
	shr al,2
	out dx,al ; Send it.
	add si,4 ; Point to next color.
	; (There is a null chr. after every color.)
	loop PalLoop2
	ret
endp CopyPal2
proc CopyBitmap2
	; BMP graphics are saved upside-down.
	; Read the graphic line by line (200 lines in VGA format),
	; displaying the lines from bottom to top.
	mov ax, 0A000h
	mov es, ax
	mov cx,200
	PrintBMPLoop2:
	push cx
	; di = cx*320, point to the correct screen line
	mov di,cx
	shl cx,6
	shl di,8
	add di,cx
	; Read one line
	mov ah,3fh
	mov cx,320
	mov dx,offset ScrLine
	int 21h
	; Copy one line into video memory
	cld ; Clear direction flag, for movsb
	mov cx,320
	mov si,offset ScrLine
	rep movsb ; Copy line to the screen
	 ;rep movsb is same as the following code:
	 ;mov es:di, ds:si
	 ;inc si
	 ;inc di
	 ;dec cx
	 ;loop until cx=0
	pop cx
	loop PrintBMPLoop2
	ret
endp CopyBitmap2
	; Process BMP file
	
proc endGame
	call moveToGraficMode
	call OpenFile2
	call ReadHeader2
	call ReadPalette2
	call CopyPal2
	call CopyBitmap2
	
;	; Wait for key press
;	mov ah,1
;	int 21h
;	; Back to text mode
;	mov ah, 0
;	mov al, 2
;	int 10h

	pop ax 		;מכייון שיצאתי מאמצע של שתי פרוצדורות, עשיתי 2 פופים בשביל לחזור למקום איי פי הנכון
	pop ax
	ret
endp endGame
	
proc printAll
	mov [x],10					;שמאלה)שולח לפרוצדורה ערכים כדי ליצור את המלבן האדום)
	push [x]
	mov [y],10
	push [y]
	mov [oreh],180
	push [oreh]
	call GraficBoard
	
	mov [x],300						;ימין)שולח לפרוצדורה ערכים כדי ליצור את המלבן האדום)
	push [x]
	mov [y],10
	push [y]
	mov [oreh],180
	push [oreh]
	call GraficBoard

	mov [x],10						;למעלה)שולח לפרוצדורה ערכים כדי ליצור את המלבן האדום)
	push [x]
	mov [y],10
	push [y]
	mov [oreh],290
	push [oreh]
	call GraficBoard2
	
	mov [x],10						;למטה)שולח לפרוצדורה ערכים כדי ליצור את המלבן האדום)
	push [x]
	mov [y],190
	push [y]
	mov [oreh],290
	push [oreh]
	call GraficBoard2
	
	mov [x],56
	push [x]
	mov [y],50
	push [y]
	mov [oreh],100
	push [oreh]
	call GraficBoard
	
	mov [x],256
	push [x]
	mov [y],50
	push [y]
	mov [oreh],100
	push [oreh]
	call GraficBoard

	mov [x],76
	push [x]
	mov [y],50
	push [y]
	mov [oreh],160
	push [oreh]
	call GraficBoard2	
	
	mov [x],76
	push [x]
	mov [y],150
	push [y]
	mov [oreh],160
	push [oreh]
	call GraficBoard2
	
	mov [x],160						;יוצר את הנחש
	push [x]
	mov [y],100
	push [y]
	mov [oreh],10
	push [oreh]
	call GraficSnake
	
	mov [x],160						;מעבה את גודל הנחש
	push [x]
	mov [y],99
	push [y]
	mov [oreh],10
	push [oreh]
	call GraficSnake
	
	call xyRandom					;יצירת קו של אוכל
	push [x]
	push [y]
	mov [oreh],2
	push [oreh]
	call food
									;יצירת קו שני של אוכל
	push [foodx]
	sub [y],1
	push [y]
	mov [oreh],2
	push [oreh]
	call food	
	ret
endp printAll

proc startPicture
	call moveToGraficMode
	call OpenFile
	call ReadHeader
	call ReadPalette
	call CopyPal
	call CopyBitmap
	ret
endp startPicture

proc checkWhatPressed
waitForData5:
	mov ah, 1
	int 16h
	jz WaitForData5			
	mov ah, 0 
	int 16h
	cmp ah, 2h
	jne j
	mov [colorSnake],48
	jmp XC
j:
	cmp ah, 3h
	jne jj
	mov [colorSnake],44
	jmp XC
jj:
	cmp ah, 4h
	jne jjj
	mov [colorSnake],52
	jmp XC
jjj:
	cmp ah,5h
	jne WaitForData5
	mov [allColors],1
XC:
	ret
endp checkWhatPressed

proc scoreResult
	mov dx,offset message4
	mov ah,9h
	int 21h
	mov al,[score]
	cmp al,9
	ja BIG
	mov dl, al
	add dl,48
	mov ah, 2
	int 21h
	jmp ZXC
BIG:
	mov dl, 1
	add dl,48
	mov ah, 2
	int 21h
	mov al,[score]
	mov dl, al
	sub dl,10
	add dl,48
	mov ah, 2
	int 21h
ZXC:
	ret
endp scoreResult

start:
	mov ax, @data
	mov ds, ax	
	
	mov dx,offset message0					;הדפסת המחרוזות
	mov ah,9h
	int 21h
	mov dx, offset message1
	int 21h
	mov dx, offset message2
	int 21h
	mov dx, offset message3
	int 21h
waitForData:				;בודק אם קיבלתי מהמקלדת מקש שנלחץ
	mov ah, 1
	int 16h
	jz WaitForData			
	mov ah, 0 
	int 16h							;בודק אם המקש שנלחץ הוא ENTER
	cmp ah, 1ch						;קורא את המקש ומוחק את הבאפר
jne WaitForData

	call startPicture
	call checkWhatPressed
	call moveToGraficMode		;משנה למצב גרפי
	call printAll
	call InGame
	call scoreResult
waitForData0:
	mov ah, 1
	int 16h
	jz WaitForData0			
	mov ah, 0 
	int 16h							;בודק אם המקש שנלחץ הוא ENTER
	cmp ah, 1ch						;קורא את המקש ומוחק את הבאפר
jne WaitForData0
; Return to text 
	int 16h
;Return to text mode
	mov ah, 0
	mov al, 2
	int 10h

exit:
	mov ax, 4c00h
	int 21h
END start