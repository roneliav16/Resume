using System.Linq;
using System.Text;

namespace Ex01_05
{
    public class NumberStatistics
    {
        public static void GetStringFromUserAndPrintStatistics()
        {
            System.Console.WriteLine("Please enter integer number with 8 digits");
            string inputString = System.Console.ReadLine();
            while (!CheckValidityOfInputString(inputString))   // Validate number input
            {
                System.Console.WriteLine("Your number is not valid !!! Please enter integer number with 8 digits");
                inputString = System.Console.ReadLine();
            }

            string digitsSmallerThanTheFirst = DigitsSmallerThanTheFirstDigit(inputString);
            System.Console.Write(string.Format("The leftmost digit is: {0}. The digits that are smaller than her: ", inputString[0]));
            if (digitsSmallerThanTheFirst.Length > 0)
            {
                for (int i = 0; i < digitsSmallerThanTheFirst.Length - 1; i++)
                {
                    System.Console.Write(digitsSmallerThanTheFirst[i] + ", ");
                }

                System.Console.Write(digitsSmallerThanTheFirst[digitsSmallerThanTheFirst.Length - 1] + ". ");
            }
            else
            {
                System.Console.Write("None.");
            }

            System.Console.WriteLine(string.Format("Total: {0}.", digitsSmallerThanTheFirst.Length));
            string digitsDivisibleBy3 = DigitsDivisibleBy3(inputString);
            System.Console.Write("The digits that are divisivle by 3: ");
            if (digitsDivisibleBy3.Length > 0)
            {
                for (int i = 0; i < digitsDivisibleBy3.Length - 1; i++)
                {
                    System.Console.Write(digitsDivisibleBy3[i] + ", ");
                }

                System.Console.Write(digitsDivisibleBy3[digitsDivisibleBy3.Length - 1] + ". ");
            }
            else
            {
                System.Console.Write("None.");
            }

            System.Console.WriteLine(string.Format("Total: {0}.", digitsDivisibleBy3.Length));
            System.Console.WriteLine(string.Format("The difference between the biggest to the lower digit is: {0}.", DifferenceFromBiggestToLowerDigit(inputString).ToString()));
            int counterOfMostCommonDigit = 0;

            System.Console.WriteLine(string.Format("The most common digit is: {0} (appears {1} times).", MostCommonDigit(inputString, ref counterOfMostCommonDigit).ToString(),
                counterOfMostCommonDigit.ToString()));
        }

        public static bool CheckValidityOfInputString(string i_InputString)
        {
            return i_InputString.Length == 8 && i_InputString.All(char.IsDigit);
        }

        public static string DigitsSmallerThanTheFirstDigit(string i_InputString)
        {
            StringBuilder smallerDigits = new StringBuilder();
            char firstDigit = i_InputString[0];

            foreach(char c in i_InputString.Substring(1))
            {
                if(c < firstDigit)
                {
                    smallerDigits.Append(c);
                }
            }

            return smallerDigits.ToString();
        }

        public static string DigitsDivisibleBy3(string i_InputString)
        {
            StringBuilder divisibleBy3 = new StringBuilder();

            foreach(char c in i_InputString)
            {
                if((c - '0') % 3 == 0) // Another way to convert digit (char) to int
                {
                    divisibleBy3.Append(c);
                }
            }

            return divisibleBy3.ToString();
        }

        public static int DifferenceFromBiggestToLowerDigit(string i_InputString)
        {
            int maxDigit = i_InputString.Max(c => c - '0'); // Convert char to int
            int minDigit = i_InputString.Min(c => c - '0'); // Convert char to int
            return maxDigit - minDigit;
        }

        public static char MostCommonDigit(string i_InputString, ref int io_CounterOfMostCommonDigit)
        {
            int maxCount = 0;
            char mostCommonDigit = i_InputString[0]; // Initialize with the first digit

            foreach (char digit in i_InputString)
            {
                int currentCount = 0;

                foreach (char compareDigit in i_InputString)
                {
                    if(digit == compareDigit)
                    {
                        currentCount++;
                    }
                }

                if (currentCount > maxCount)
                {
                    maxCount = currentCount;
                    mostCommonDigit = digit;
                }
            }

            io_CounterOfMostCommonDigit = maxCount;
            
            return mostCommonDigit;
        }
    }
}
