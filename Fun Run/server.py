import socket
import threading
from threading import Thread, Lock
import pygame
import sys

lock = Lock()
bind_ip = '127.0.0.1'
bind_port = 8000

adressHome = r"C:\Users\Ron\Desktop\Projects\Final project - Ron Eliav Cyber- Fun Run\Images\\" 


server = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
#server = socket.socket(socket.AF_INET, socket.SOCK_SREAM)
server.bind((bind_ip, bind_port))
#server.listen(5)  # max backlog of connections

#print 'Listening on {}:{}'.format(bind_ip, bind_port)


def handle_client_connection(playerNum, playerlist, distance_from_startLIST, groundLIST, lock, endList, my_client):
    """
    This function manages the communication with all the clients. the function gets the information of one of the
    players and sends it to all of them.
    The function work on THREAD and each player run this function for himself.
    The communication is UDP.
    The function get all the information and create some lists of this information.
    """
    client_sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    # client_sock.bind((my_client[0], 8001))
    client_sock.bind((bind_ip, 8000 + playerNum))
    lock.acquire()

    server.sendto(str(playerNum), (my_client))

    lock.release()
    while True:
        lock.acquire()

        (request, remote_address) = client_sock.recvfrom(60)


        lock.release()
        lock.acquire()
        a = str(len(playerlist))

        server.sendto(a, my_client)
        lock.release()
        request = request.split(" ")
        distance_from_startLIST[playerNum - 1] = request[0]
        groundLIST[playerNum - 1] = request[1]
        if len(playerlist) > 1:
            for i in range(0, len(playerlist), 1):
                if not (i == playerNum - 1):
                    #time.sleep(0.001)
                    lock.acquire()

                    server.sendto(str(distance_from_startLIST[i]) + " " + str(groundLIST[i]) + " " + str(i), playerlist[playerNum-1])

                    lock.release()
        (end, remote_address) = client_sock.recvfrom(60)
        if end == "END":
            endList[playerNum - 1] = 1
            l = 1
            for g in range(0, int(a), 1):
                if not (endList[g] == 1):
                    l = 0
            if l == 1:
                server.sendto("END", my_client)

            else:
                loop = True
                while loop:
                    l = 1
                    for g in range(0, int(a), 1):
                        if not (endList[g] == 1):
                            l = 0
                    if l == 1:
                        loop = False
                        server.sendto("END", my_client)


                    #playerlist[i].send(request[0] + " " + request[1])
            #print 'Received {}'.format("distance from the start:" + request[0] + "height/ground:" + request[1])



def tableText(x1, y1, screen, num):
    """
    This function create the table text on the first picture.
    The leader of this game its who that open the game(server) and he choose how much can join to the game from
     1 to 4 players.
     The function get x and y positions, number of how much players and the screen.
    """
    x = x1
    y = y1
    mouse = pygame.mouse.get_pos()
    if x+200 > mouse[0] > x and y+75 > mouse[1] > y:
        pygame.draw.rect(screen, (0, 0, 205), (x, y, 200, 75))
    else:
        pygame.draw.rect(screen, (0, 0, 128), (x, y, 200, 75))
    smallText = pygame.font.SysFont("BERNHC.ttf", 40)
    textSurf, textRect = text_objects(str(num) + " Players", smallText)
    textRect.center = ((x+(200/2)), (y+(75/2)))
    screen.blit(textSurf, textRect)


def check_if_on_table(x, y, mouse):
    """
    The function check if the leader of the game press on one of the tables text.
    """
    if x+200 > mouse[0] > x and y+75 > mouse[1] > y:
        return True
    else:
        return False

def startPic():
    """
    The function create the first picture and all the tables.
    the function return the number of the max players that can play, and the windows closed down.
    """
    global crashed
    crashed = False
    while not crashed:
        pygame.init()
        screen = pygame.display.set_mode((1024, 600))
        startImage = pygame.image.load(adressHome + "pic_background.png")
        screen.blit(startImage, (0, 0))

        tableText(50, 500, screen, 1)
        tableText(280, 500, screen, 2)
        tableText(510, 500, screen, 3)
        tableText(740, 500, screen, 4)

        pygame.display.flip()
        pygame.display.update()
        global x
        x = 0
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                crashed = True
                sys.exit()
            elif event.type == 5:  # 5 is mouse down
                mouse = pygame.mouse.get_pos()
                if check_if_on_table(50, 500, mouse):
                    crashed = True
                    x = 1
                elif check_if_on_table(280, 500, mouse):
                    crashed = True
                    x = 2
                elif check_if_on_table(510, 500, mouse):
                    crashed = True
                    x = 3
                elif check_if_on_table(740, 500, mouse):
                    crashed = True
                    x = 4
    pygame.display.quit()
    return x

def text_objects(text, font):
    """
    the function help to crate the table text effectively.
    """
    textSurface = font.render(text, True, (255, 255, 255))
    return textSurface, textSurface.get_rect()


def main():
    """
    The main function call set the variables.
    In the While function the main call to the main def in THREADS, and wait for everyone that want to join.
    if someone want to join, and there is not spacef for one more, the function sent to him that, and it shown on
     his screen.
    """
    numberOfPlayers = startPic()
    print (numberOfPlayers)
    playerNum = 0
    playerlist = []
    distance_from_startLIST = [0, 0, 0, 0]
    groundLIST = [0, 0, 0, 0]
    endList = [0, 0, 0, 0]
    loop = True


    while loop:
        #client_sock, address = server.accept()
        (data, my_client) = server.recvfrom(60)

        if data == "HELLO":
            #print 'Accepted connection from {}:{}'.format(address[0], address[1])
            playerNum += 1
            playerlist.append(my_client)
            client_handler = threading.Thread(
                target=handle_client_connection,
                args=(playerNum, playerlist, distance_from_startLIST, groundLIST, lock, endList, my_client)  # without comma you'd get a... TypeError: handle_client_connection() argument after * must be a sequence, not _socketobject
            )
            client_handler.start()

        if playerNum == numberOfPlayers:
            loop = False

    while True:
        (data, my_client) = server.recvfrom(60)
        server.sendto("There is No place in the game.", (my_client))
        playerNum += 1
        print ("NO PLACE FOR player number " + str(playerNum))


if __name__=='__main__':
    main()











