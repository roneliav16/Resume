import client
import pygame
import time
import sys
import random
import _winreg

adressHome = r"C:\Users\Ron\Desktop\Projects\Final project - Ron Eliav Cyber- Fun Run\Images\\"  # Address of the files when i work at home

def clock_module():

    import pygame
    pygame.init()
    clock = pygame.time.Clock()
    screen = pygame.display.set_mode((1200, 600))
    loop = True
    counter, text = 5, '5'.rjust(3)
    pygame.time.set_timer(pygame.USEREVENT, 1000)
    font = pygame.font.SysFont('Consolas', 400)

    while loop:
        for e in pygame.event.get():
            if e.type == pygame.USEREVENT:
                counter -= 1
                text = str(counter).rjust(3)
            if counter > 0:
                pass
            else:
                loop = False
        else:
            screen.fill((255, 0, 0))
            screen.blit(font.render(text, True, (0, 0, 0)), (32, 48))
            pygame.display.flip()
            clock.tick(60)

def Game(my_socket, player_num, distanceLIST, groundLIST, x, y):
    import pygame
    import time

    pygame.init()

    display_width = x
    display_height = y
    FPS = 60
    q = True

    black = (0,0,0)
    white = (255,255,255)
    red = (255,0,0)
    blue = (0, 0, 255)

    jump_height = 10


    global addressClass, adressHome

    gameDisplay = pygame.display.set_mode((display_width, display_height))
    pygame.display.set_caption("FUN RUN")
    clock = pygame.time.Clock()
    adress = (adressHome + "p" + player_num + ".gif")
    playerIMG = pygame.image.load(adress).convert()
    playerIMG1 = None
    playerIMG2 = None
    playerIMG3 = None
    list_of_images = []
    for b in range(1,5,1):
        if not (b == int(player_num)):
            list_of_images.append(pygame.image.load(adressHome + "p" + str(b) + ".gif").convert())

    backgroundIMG = pygame.image.load(adressHome + "background.gif").convert()
    background_rect = backgroundIMG.get_rect()
    background_rect.centerx = display_width
    background_rect.bottom = display_height
    end_line = pygame.image.load(adressHome + "end_line.gif").convert()
    package = pygame.image.load(adressHome + "RetroBlockQuestion.png").convert()
    speedImage = pygame.image.load(adressHome + "speed.png").convert()
    icon = pygame.image.load(adressHome + "pic_background.png").convert()
    pygame.display.set_icon(icon)



    x = 0
    global distancePackage
    distancePackage = 0
    distance_from_zero = 0
    global ground
    ground = 765
    timer_bool = True
    global onSpeed
    onSpeed = False
    global speedOfPlayerForChange
    speedOfPlayerForChange = 0
    global onSpeed1
    onSpeed1 = False


    class Player(pygame.sprite.Sprite):
        def __init__(self):
            pygame.sprite.Sprite.__init__(self)
            #self.image = pygame.Surface((50, 40))
            self.image = playerIMG
            #self.image.fill(red)
            self.rect = self.image.get_rect()
            self.rect.centerx = display_width / 2
            self.rect.bottom = 765
#            self.imageblit =  pygame.transform.scale(self.image, (786, 522))
            self.speedx = 0
            self.jumping = True
            self.jumping_down = False
            self.jump_offset = jump_height
            self.second_jump = False
            self.small_up = 0
            self.numbers_after_dot = 0
            self.one_time = True
            self.small = float(0)
            self.ground = 765       #ALWAYS WILL BE THE MIN HEIGHT OF THE MAP. WILL START ON 765
            self.distance_from_zero = 0
            self.speedOfPlayer = 4

        def update(self):
            self.speedOfPlayer = 4
            global distancePackage
            global ground
            global speedOfPlayerForChange
            global onSpeed1
            keystate = pygame.key.get_pressed()
            if keystate[pygame.K_SPACE] or self.jump_offset < jump_height:
                if self.jumping:
                    self.do_jumping_Up()
                elif self.small_up < jump_height and self.jumping == False:
                    self.do_jumping_Down(self.rect.y , self.ground, 3)

            if self.second_jump:
                # self.second_jump = False
                if keystate[pygame.K_SPACE]:
                    self.second_jump = False
                    #self.distance += jump_height - self.jump_offset
                    self.jump_offset = jump_height
                    self.jumping = True
                    self.one_time = True

            if (not keystate[pygame.K_SPACE]) and self.jump_offset < jump_height:
                self.second_jump = True

            ground = self.rect.bottom

            if ((self.distance_from_zero >= 2000 - self.distance_from_zero + 658) and self.distance_from_zero <= (3600 - self.distance_from_zero) + 658):
                self.return_ground(525)
                if (ground <= 525):
                    self.distance_from_zero += self.speedOfPlayer

            elif ((self.distance_from_zero >= 3600 - self.distance_from_zero + 658) and (self.distance_from_zero <= 5000 - self.distance_from_zero + 658)):
                if not ((self.jumping) or (self.jumping_down)):
                    self.return_ground2(self.ground, 1)
                    self.do_jumping_Down(self.rect.y , self.ground, self.speedOfPlayer)
                    self.speedOfPlayer = 5
                else:
                    self.return_ground2(self.ground, 2)

                if onSpeed1:
                    self.speedOfPlayer = speedOfPlayerForChange
                self.distance_from_zero += self.speedOfPlayer




            else:
                #print str(ground)+ " ground"
                #print str(self.ground)+ " self.ground"
                if onSpeed1:
                    self.speedOfPlayer = speedOfPlayerForChange
                self.distance_from_zero += self.speedOfPlayer

#            if not (onSpeed):
            distancePackage = self.distance_from_zero
            #print str(self.distance_from_zero) + " vvvvvv"
            #print self.speedOfPlayer



     #IF I WANT TO MOVE WITH THE PLAYER RIGHT AND LEFT
            #if keystate[pygame.K_LEFT]:
            #    self.speedx = -7
            #    self.rect.x += self.speedx

            #if keystate[pygame.K_RIGHT]:
            #    self.rect.x += self.speedx
            #    self.speedx = 7

        def do_jumping_Up(self):
            global jump_height
            self.speedOfPlayer = 3

            self.rect.y -= self.jump_offset
            self.jump_offset -= 1
            if self.jump_offset == 0:
                self.small_up = 0
                self.jumping = False

        def do_jumping_Down(self, jump_start, jump_end, speedOfPlayer):
            self.jumping_down = True
            self.speedOfPlayer = speedOfPlayer

            if self.one_time == True:
                distance = jump_end - jump_start
                h = self.culculate(jump_height)
                self.small = float(distance / h)
                self.one_time = False

            self.small_up += 1
            #self.numbers_after_dot += (small - int(small))

            if (self.rect.bottom + int(self.small * self.small_up)) > jump_end:
                self.rect.bottom = jump_end
                self.small_up = jump_height
            else:
                self.rect.y += int(self.small * self.small_up)

            if self.small_up == jump_height:
                if self.rect.y != jump_end:
                    self.rect.bottom = jump_end
                    self.jumping_down = False
                else:
                    self.jumping = True
                    self.one_time = True
                    self.jump_offset = jump_height


        def culculate(self, jump_height):
            num = 0
            for a in range(1, jump_height + 1):
                num += a
            return num

        def return_ground(self, line_ground):
            if ((self.distance_from_zero >= 2000 - self.distance_from_zero + 658) and (self.distance_from_zero <= 3600 - self.distance_from_zero + 658)):

                if ground <= line_ground:
                    self.ground = line_ground
            else:
                self.ground = 765


        def return_ground2(self, line_ground, on_or_not):
            if ((self.distance_from_zero >= 3600 - self.distance_from_zero + 658) and (self.distance_from_zero <= 5000 - self.distance_from_zero + 658)):
                if on_or_not == 1:
                    self.ground = line_ground + 2
                elif on_or_not == 2:
                    self.ground = line_ground + 0.9
                if self.ground >= 763:
                    self.ground = 765


            else:
                self.ground = 765


        def sound_jump(self):
            pygame.init()
            sound_file = r"C:\Users\Ron\Desktop\Projects\Final project - Ron Eliav Cyber- Fun Run\Images\\music.mp3" #it was a.mp3
            pygame.mixer.init()
            pygame.mixer.music.load(sound_file)
            pygame.mixer.music.play(0)



    class packageClass(pygame.sprite.Sprite):
        global distancePackage
        #print distancePackage
        global onSpeed1
        def __init__(self):
            pygame.sprite.Sprite.__init__(self)
            self.image = package
            self.rect = self.image.get_rect()
            self.rect.centerx = 3200 - distancePackage  #1230 is the length of xsize og the screen  in get rect
            self.rect.bottom = 300

    all_sprites = pygame.sprite.Group()
    player = Player()
    all_sprites.add(player)

    global loop1, speedFunction, loop2, speedFunction2, box1
    loop1 = False
    loop2 = False
    speedFunction = False
    speedFunction2 = False
    box1 = False
    #Game Loop
    global crashed
    crashed = False

    while not crashed:
        try:
            clock.tick(FPS)

            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    crashed = True
                    sys.exit()

            speedOfPlayer1 = player.speedOfPlayer

            all_sprites.update()

            all_sprites2 = pygame.sprite.Group()
            PackageClass = packageClass()
            all_sprites2.add(PackageClass)

            all_sprites2.update()

            gameDisplay.fill(white)

            rel_x = x % 2000
            gameDisplay.blit(backgroundIMG, (rel_x - 2000, 0))
            if rel_x < display_width:
                gameDisplay.blit(backgroundIMG, (rel_x, 0))

            def eating(posX,posY,eatenX,eatenY):     #function to check if the player got the package
                if ((posX - eatenX) >= -40) and ((posX - eatenX) <= 40):
                    result1 = True
                else:
                    result1 = False
                if ((posY - eatenY) >= -40) and ((posY - eatenY) <= 40):
                    result2 = True
                else:
                    result2 = False

                if result1 and result2:
                    return True
                else:
                    return False

            if eating(distance_from_zero, ground, 2585, 520) == True: #1230 is the length of xsize og the screen in get rect plus 170
                box1 = True

            if box1:
                box()

            def box():
                global loop1
                global loop2
                global box1
                gameDisplay.blit(speedImage, (10, 500))
                keystate2 = pygame.key.get_pressed()
                if keystate2[pygame.K_RETURN]:
                    x = random.randint(1, 2)
                    if x == 1:
                        loop1 = True
                    if x == 2:
                        loop2 = True
                    box1 = False


            if loop1:
                speedFunction = True
                times = 5 * 60
                loop1 = False
                onSpeed1 = True

            if loop2:
                loop2 = False
                time.sleep(1)


            if speedFunction:
                onSpeed1 = True
                if not(times == 0):
                    if (ground  == 765):
                        speedOfPlayer1 = 8
                        speedOfPlayerForChange = 8
                    else:
                        speedOfPlayer1 = 7
                        speedOfPlayerForChange = 7
                    times -= 1
                else:
                    onSpeed1 = False
                    speedFunction = False


            numberOfPlayers = client.send_to_server(my_socket, distance_from_zero, ground, player_num, distanceLIST, groundLIST)
            if client.get_error_bool() or numberOfPlayers == -1:
                pygame.mixer.music.stop()
                crashed = True
                pygame.display.quit()
                client.error_message("The connection to the server has disconnected")


            d = 0

            if not int(player_num) == 1:
                if q == True:
                    distance_from_zero = speedOfPlayer1
                    q = False

            for c in range(1, int(numberOfPlayers) + 1, 1):
                if not (c == int(player_num)):

                    gameDisplay.blit(list_of_images[d], (((distanceLIST[c - 1]- distance_from_zero) + (display_width / 2)) - 398, groundLIST[c - 1] - 523))
                    #print str((distance_from_zero - distanceLIST[c - 1]) + (display_width / 2)- 395) + "          " + str(groundLIST[c - 1] - 522) + "         " + str(distance_from_zero)
                    d += 1

            #draw end line
            gameDisplay.blit(end_line, (12000 - distance_from_zero + display_width/2, 540))
            #draw lines
            pygame.draw.line(gameDisplay, red, [2000 - distance_from_zero, 540], [2000 - distance_from_zero, 300], 12)
            pygame.draw.line(gameDisplay, red, [1995 - distance_from_zero, 300], [2800 - distance_from_zero, 300], 12)
            pygame.draw.line(gameDisplay, red, [2800 - distance_from_zero, 300], [3400 - distance_from_zero, 540], 12)

            if not ((distance_from_zero >= 2000 - distance_from_zero + 658) and distance_from_zero <= 3600 - distance_from_zero + 658):
                x -= speedOfPlayer1
                distance_from_zero += player.speedOfPlayer
            else:
                if (ground <= 525):
                    x -= speedOfPlayer1
                    distance_from_zero += player.speedOfPlayer
            #print distance_from_zero


            all_sprites.draw(gameDisplay)
            all_sprites2.draw(gameDisplay)
            #print distance_from_zero

            pygame.display.flip()
            pygame.display.update()

            # Timer
            if timer_bool == True:
                start = time.time()
                timer_bool = False

            if distance_from_zero > 12000:
            #How much time pass - time play of the player
                end = time.time()
                elapsed = end - start
                #print elapsed

                time = elapsed

                finish(gameDisplay, time)
                end = client.end_game(my_socket)
                if end == "END":
                    crashed = True

                else:
                    print ("Error - the game is not done yet for this player")
            else:
                client.notend_game(my_socket)
                if client.get_error_bool():
                    pygame.mixer.music.stop()
                    crashed = True
                    pygame.display.quit()
                    client.error_message("The connection to the server has disconnected")

        except:
            sys.exit()


def finish(gameDisplay, time):
    sky_font = pygame.font.SysFont("None", 60)
    rendered = sky_font.render("GAME OVER! - Time:" + str(time), 0, (80, 200, 80))
    gameDisplay.blit(rendered,(180, 100))
    pygame.display.update()


def noPlace():
    global crashed
    crashed = False
    while not crashed:
        pygame.init()
        screen = pygame.display.set_mode((1369, 648))
        startImage = pygame.image.load(adressHome + "noPlace.png").convert()
        screen.blit(startImage, (0, 0))
        pygame.display.flip()
        pygame.display.update()

        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                crashed = True
                sys.exit()


def music_sound(sound, loop):
    pygame.init()
    sound_file = adressHome + sound + ".mp3"
    pygame.mixer.init()
    pygame.mixer.music.load(sound_file)
    pygame.mixer.music.play(loop)


def get_reg(name):
    REG_PATH = r"System\CurrentControlSet\Control\VIDEO\{2D5BA881-99A8-4757-A06E-CB5493B97A39}\0000\Mon12345678"
    try:
        registry_key = _winreg.OpenKey(_winreg.HKEY_CURRENT_CONFIG, REG_PATH, 0,
                                       _winreg.KEY_READ)
        value, regtype = _winreg.QueryValueEx(registry_key, name)
        _winreg.CloseKey(registry_key)
        return value
    except WindowsError:
        return None


def setGameWin():
    xsize = get_reg("DefaultSettings.XResolution")
                                                       #I am using with registry to see what is the size of the screen(x and y = length and width)
    ysize = get_reg("DefaultSettings.YResolution")

    xysize = (str(xsize) + " " + str(ysize))
                                                        #connect 2 strings... it will be easier to send it to clients
    x1, y1 = xysize.split(" ")
    #print xysize
    if x1 == "None":
        x = 1200
    else:
        x = int((int(x1) * 1.171875)) #the size of the new windows (of the game) proportional to the screen size(using with registry data)

    if y1 == "None":
        y = 600
    else:
        y = int((int(y1) * 0.78125))
    return x, y

def main():
    my_socket = client.connect()
    playerNum = client.get_data(my_socket)
    if playerNum == 10:
        noPlace()
    print (playerNum)
    try:
        clock_module()
    except:
        client.error_message("The connection to the server has disconnected")
    distanceLIST = [0, 0, 0, 0]
    groundLIST = [0, 0, 0, 0]
    music_sound("music", 8)
    x, y = setGameWin()
    Game(my_socket, str(playerNum), distanceLIST, groundLIST, x, y)
    pygame.mixer.music.stop()
    music_sound("win", 0)
    # 10 second of game results
    time.sleep(10)
    client.close(my_socket)
    pygame.quit()
    quit()
if __name__ == '__main__':
    main()