import socket
from threading import Thread, Lock
import pygame

ip = '127.0.0.1'
port = 8000
global error_bool
error_bool = False


def get_error_bool():
    return error_bool


def connect():
    global error_bool
    """ the function connects to the server """
    my_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        # my_socket.connect(('172.16.0.186', 8000))
        my_socket.sendto("HELLO".encode("utf-8"), (ip, port))
        return my_socket
    except:
        error_message('server is not available right now.')
        error_bool = True
        my_socket.close()
        quit()


def error_message(msg):
    pygame.init()

    display_width = 800
    display_height = 600

    gameDisplay = pygame.display.set_mode((display_width, display_height))
    pygame.display.set_caption("ERROR NOTE")

    global gameExit
    gameExit = False
    font = pygame.font.SysFont(None, 40)
    screen_text = font.render(msg, True, (255, 255, 255))
    while not gameExit:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                gameExit = True

        gameDisplay.fill((0, 0, 0))
        gameDisplay.blit(screen_text, [50, display_height/2])
        pygame.display.update()
    pygame.display.quit()


def get_data(my_socket):
    global port
    global error_bool

    """ receiving data from the server """
    try:
        (data, remote_address) = my_socket.recvfrom(60)
    except:
        error_message("The connection to the server has disconnected")
        error_bool = True

    if str(data) == "There is No place in the game.":
        print "There is No place in the game."
        return 10  # 10 MEANS THERE IS NO PLACE IN GAME
    else:
        port += int(data)
        return int(data)


def end_game(my_socket):
    lock = Lock()
    lock.acquire()

    my_socket.sendto("END", (ip, port))


    (data, remote_address) = my_socket.recvfrom(60)

    return data
    lock.release()



def notend_game(my_socket):
    global error_bool
    lock = Lock()
    lock.acquire()
    try:
        my_socket.sendto("NOTEND", (ip, port))
        lock.release()
    except:
        error_bool = True
        lock.release()


def close(my_socket):
    """ closing the connection with the server """
    my_socket.close()

def send_to_server(my_socket, distance_from_zero, ground, playerNum, distanceLIST, groundLIST):
    global error_bool
    lock = Lock()
    global numberOfPlayers

    try:
        my_socket.sendto(str(distance_from_zero) + ' ' + str(ground), (ip, port))
    except:
        error_bool = True
        numberOfPlayers = -1

    if not error_bool:
        lock.acquire()
        try:
            (numberOfPlayers, remote_address) = my_socket.recvfrom(1024)
        except:
            error_bool = True
            numberOfPlayers = -1
        lock.release()


    if not error_bool:
        numberOfPlayers = numberOfPlayers[0]
        if not(int(numberOfPlayers) == 1):
            for i in range(0, int(numberOfPlayers) - 1):
                lock.acquire()

                try:
                    (data, remote_address) = my_socket.recvfrom(60)
                except:
                    error_bool = True
                    numberOfPlayers = -1
                lock.release()


                data = data.split(" ")
                distanceLIST[int(data[2])] = int(data[0])
                groundLIST[int(data[2])] = int(data[1])
    return numberOfPlayers
