using System;

namespace Ex01_03
{
    public class InputValidator
    {
        public static int GetValidInputNumberFromUser()
        {
            Console.WriteLine("Type a number in range of 4 - 15");
            string inputNumber = Console.ReadLine();
            int validInputNumber;

            while (!inputValidationCheck(inputNumber, out validInputNumber))
            {
                Console.WriteLine("The input you entered is invalid! Type a number in range of 4 - 15!");
                inputNumber = Console.ReadLine();
            }

            return validInputNumber;
        }
        private static bool inputValidationCheck (string i_InputNumber, out int io_Number)
        {
            bool isValidNumber = int.TryParse(i_InputNumber, out io_Number);
            return isValidNumber && 4 <= io_Number && io_Number <= 15;
        }            
    }
}
