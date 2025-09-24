using System;
// $G$ DSN-002 (-3) Input validation logic should be handled in the logic layer, not in the UI.

namespace Ex02
{
    internal class InputInterfaceValidator
    {
        public static int GetValidMaxRowsNumberFromUser()
        {
            Console.WriteLine("Type a number in range of 4 - 10");
            string inputNumber = Console.ReadLine();
            int validInputNumber;

            while (!isNumberOfRowsIsValid(inputNumber, out validInputNumber))
            {
                Console.WriteLine("The input you entered is invalid! Type a number in range of 4 - 10!");
                inputNumber = Console.ReadLine();
            }

            return validInputNumber;
        }

        // $G$ CSS-014 (-5) Bad parameter name (should be in the form of o_PascalCase).
        private static bool isNumberOfRowsIsValid(string i_InputNumber, out int io_Number)
        {
            bool isValidNumber = int.TryParse(i_InputNumber, out io_Number);

            return isValidNumber && 4 <= io_Number && io_Number <= 10;
        }

        // $G$ CSS-015 (-5) Bad parameter name. Only 'ref' parameter should be in io_PascalCase format.
        internal static char[] GetValidGuessFromUser(GameData<char> i_GameData, out bool io_IsExit)
        {
            Console.WriteLine("Please type your guess <A B C D> or 'Q' to quit");
            string guessFromUser = Console.ReadLine();


            while (!(isValidSyntacticallyGuess(guessFromUser, out io_IsExit)
                   && GameLogicUtils<char>.IsValidSemanticallyGuess<char>(i_GameData, guessFromUser.ToCharArray(), io_IsExit)))
            {
                Console.WriteLine("The input you entered is invalid! Please type your guess <A B C D> or 'Q' to quit!");
                guessFromUser = Console.ReadLine();
            }

            return guessFromUser.ToCharArray();
        }

        private static bool isValidSyntacticallyGuess(string i_InputGuess, out bool o_IsExit)
        {
            bool isValidGuessResult = i_InputGuess.Length == 4;

            if (!isValidGuessResult)
            {
                if (i_InputGuess.Equals("Q"))
                {
                    isValidGuessResult = true;
                    o_IsExit = true;
                }
                else
                {
                    o_IsExit = false;
                }
            }
            else
            {
                o_IsExit = false;

                foreach (char c in i_InputGuess)
                {
                    if (!(c >= 'A' && c <= 'Z'))
                    {
                        isValidGuessResult = false;
                        break;
                    }
                }
            }

            return isValidGuessResult;
        }

        public static bool CheckForAnotherGame()
        {
            string userAnswer = Console.ReadLine();
            while (!checkValidAnswerFromUserToAnotherGame(userAnswer))
            {
                Console.WriteLine("The input you entered is invalid! Would you like to start a new game? <Y/N>");
                userAnswer = Console.ReadLine();
            }

            return userAnswer.Equals("Y");
        }

        private static bool checkValidAnswerFromUserToAnotherGame(string i_UserAnswer)
        {
            return i_UserAnswer.Equals("Y") || i_UserAnswer.Equals("N");
        }
    }
}