using System;
using System.Collections.Generic;

namespace Ex03.ConsoleUI
{
    internal class InputValidator
    {
        internal static int GetValidInputNumberFromUser(int i_MinNum, int i_MaxNum)
        {
            string inputNumber = Console.ReadLine();
            int validInputNumber;

            while (!inputValidationCheck(inputNumber, out validInputNumber, i_MinNum, i_MaxNum))
            {
                Console.WriteLine(string.Format("The input you entered is invalid! Type a number in range of {0} - {1}!", i_MinNum, i_MaxNum));
                inputNumber = Console.ReadLine();
            }

            return validInputNumber;
        }

        // $G$ CSS-014 (-3) Bad variable name (should be in the form of: o_CamelCase).
        private static bool inputValidationCheck(string i_InputNumber, out int io_Number, int i_MinNum, int i_MaxNum)
        {
            bool isValidNumber = int.TryParse(i_InputNumber, out io_Number);
            return isValidNumber && i_MinNum <= io_Number && io_Number <= i_MaxNum;
        }

        internal static string GetValidInputStringFromUser(List<string> i_ValidStringsOption)
        {
            string inputString = Console.ReadLine();

            while (!i_ValidStringsOption.Contains(inputString))
            {
                Console.WriteLine("The input you entered is invalid! Type a valid option!");
                inputString = Console.ReadLine();
            }

            return inputString;
        }
    }
}