using System.Linq;

namespace Ex01_04
{
    class StringParser
    {
        public static void GetStringFromUserAndPrintStatistics()
        {
            System.Console.WriteLine("Please enter string with 12 characters");
            string inputString = System.Console.ReadLine();
            while (!checkValidityOfInputString(inputString))   // Validate string input
            {
                System.Console.WriteLine("Your string is not valid !!! Please enter string with 12 characters");
                inputString = System.Console.ReadLine();
            }

            System.Console.WriteLine(string.Format("Is it palindrome: {0}", isItPalindrome(inputString)));
            if (isItConsistOnlyDigits(inputString))
            {
                System.Console.WriteLine(string.Format("Is it divisible by 3: {0}", isItDivisibleBy3(inputString)));
            }

            if (isItConsistOnlyLetters(inputString))
            {
                System.Console.WriteLine(string.Format("The number of capital letters(upper case) is: {0}", countCapitalLetters(inputString)));
                System.Console.WriteLine(string.Format("Is it in alphabetic ascending  order: {0}", isItAlphabeticAscendingOrder(inputString)));
            }
        }

        private static bool checkValidityOfInputString(string i_InputString)
        {
            return i_InputString.Length == 12;
        }

        private static bool isItPalindrome(string i_InputString)
        {
            bool result = false;

            if(i_InputString.Length == 2) // Assuming that the number is always 12 characters long (already checked)
            { 
                return i_InputString[0] == i_InputString[1];
            }
            else
            {
                result = result || !(isItPalindrome(i_InputString.Substring(1, i_InputString.Length - 2)) 
                                     && i_InputString[0] == i_InputString[i_InputString.Length - 1]);
            }

            return !result;
        }

        private static bool isItConsistOnlyDigits(string i_InputString)
        {
            return i_InputString.All(char.IsDigit);
        }

        private static bool isItDivisibleBy3(string i_InputString)
        {
            int sumOfDigits = 0;

            foreach (char c in i_InputString)
            {
                if(int.TryParse(c.ToString(), out int digit))
                {
                    sumOfDigits += digit;
                }
            }
            
            return (sumOfDigits % 3) == 0; 
        }

        private static bool isItConsistOnlyLetters(string i_InputString)
        {
            return i_InputString.All(char.IsLetter);
        }

        private static int countCapitalLetters(string i_InputString)
        {
            return i_InputString.Count(char.IsUpper);
        }

        private static bool isItAlphabeticAscendingOrder(string i_InputString)
        {
            char prevChar = char.ToLower(i_InputString[0]);
            bool result = true;

            for (int i = 1; i < i_InputString.Length; i++)
            {
                if(prevChar > char.ToLower(i_InputString[i]))
                {
                    result = false;
                }

                prevChar = char.ToLower(i_InputString[i]);
            }

            return result;
        }
    }
}
