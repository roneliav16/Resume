using System;
using Ex02.ConsoleUtils;

namespace Ex02
{
    public class HitStampRunner
    {
        public static void PlayGame()
        {
            bool isExit = false;
            // $G$ DSN-999 (-5) Sequence of elements should be represented as sequence of enum values and not as a string or char.
            char[] letters = { 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H' };

            while (true)
            {
                int maxTableRows = InputInterfaceValidator.GetValidMaxRowsNumberFromUser();
                char[] generatedSequenceToGuess = GameLogic<char>.GenerateSequenceTheUserNeedToGuess(letters);
                GameData<char> gameData = new GameData<char>(maxTableRows, generatedSequenceToGuess, letters);

                Screen.Clear();
                UserInterface.DrawTable(gameData);
                while (gameData.GameState == eGameState.UserPlaying)
                {
                    char[] userGuess = InputInterfaceValidator.GetValidGuessFromUser(gameData, out isExit);

                    if (isExit)
                    {
                        Console.WriteLine("Exit the game.....  Goodbye");
                        break;
                    }

                    gameData.AddGuessToUserGuesses(userGuess);
                    GameLogic<char>.GuessFeedback(gameData);
                    Screen.Clear();
                    UserInterface.DrawTable(gameData);
                }

                if (isExit)
                {
                    break;
                }

                UserInterface.MsgAfterGameEnded(gameData);
                if (!InputInterfaceValidator.CheckForAnotherGame())
                {
                    break; // Exit the game
                }
                else 
                {
                    Screen.Clear();
                }
            }
        }
    }
}
