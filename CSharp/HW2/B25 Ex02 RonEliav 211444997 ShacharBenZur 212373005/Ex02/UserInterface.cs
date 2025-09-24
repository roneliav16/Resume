using System;

namespace Ex02
{
    public class UserInterface
    {
        private const string k_GameBoardTitle = "Current board status:";
        private const string k_ColumnHeaders = "|Pins:    |Result:|";
        private const string k_BoardColumnDivider = "|=========|=======|";
        private const string k_EmptyRow = "|         |       |";

        internal static void DrawTable(GameData<char> i_GameData)
        {
            Console.WriteLine(k_GameBoardTitle);
            Console.WriteLine();
            Console.WriteLine(k_ColumnHeaders);
            Console.WriteLine(k_BoardColumnDivider);
            if (i_GameData.GameState != eGameState.UserLost)
            {
                Console.WriteLine("| # # # # |       |");
            }
            else
            {
                string msg = string.Format("| {0} {1} {2} {3} |       |", i_GameData.SymbolsToGuess[0], i_GameData.SymbolsToGuess[1], i_GameData.SymbolsToGuess[2], i_GameData.SymbolsToGuess[3]);
                Console.WriteLine(msg);
            }

            Console.WriteLine(k_BoardColumnDivider);
            for (int i = 0; i < i_GameData.MaxNumOfGuesses; i++)
            {
                if (i < i_GameData.CurrentGuess)
                {
                    string guessMsg = string.Format("| {0} {1} {2} {3} |", i_GameData.UserGuesses[i][0], i_GameData.UserGuesses[i][1], i_GameData.UserGuesses[i][2], i_GameData.UserGuesses[i][3]);
                    Console.Write(guessMsg);
                    string feedbackMsg = string.Format("{0} {1} {2} {3}|", i_GameData.Feedback[i][0], i_GameData.Feedback[i][1], i_GameData.Feedback[i][2], i_GameData.Feedback[i][3]);
                    Console.WriteLine(feedbackMsg);
                }
                else
                {
                    Console.WriteLine(k_EmptyRow);
                }

                Console.WriteLine(k_BoardColumnDivider);
            }
        }

        internal static void MsgAfterGameEnded(GameData<char> i_GameData)
        {
            eGameState gameState = i_GameData.GameState;

            if (gameState == eGameState.UserWon)
            {
                string msg = string.Format("You guessed after {0} steps!", i_GameData.CurrentGuess);
                Console.WriteLine(msg);
            }
            else
            {
                Console.WriteLine("No more guesses allowed. You lost.");

            }

            Console.WriteLine("Would you like to start a new game? <Y/N>");
        }
    }
}
