using System;

namespace Ex01_01
{
    public class BinaryNumbersToNumbers
    {
        public static void BinaryToNumber(int i_NumberOfInputs)
        {
            int[] arrayOfNumbers = new int[i_NumberOfInputs];
            string[] arrayOfBinaryNumbers = new string[i_NumberOfInputs];
            int sum = 0;

            for (int i = 0; i < i_NumberOfInputs; i++)
            {
                System.Console.WriteLine("Please enter binary number with 7 digits");
                string inputNumber = System.Console.ReadLine();
                while (!checkValidityOfNumber(inputNumber))   // Validate binary input
                {
                    System.Console.WriteLine("Your number is not valid !!! Please enter binary number with 7 digits");
                    inputNumber = System.Console.ReadLine();
                }

                int decimalNumber = convertBinaryNumberToDecimalNumber(inputNumber);   // Convert to decimal and store
                sum += decimalNumber;
                arrayOfNumbers[i] = decimalNumber;
                arrayOfBinaryNumbers[i] = inputNumber;
            }

            Array.Sort(arrayOfNumbers, arrayOfBinaryNumbers); // Sort arrays together
            printStatistic(arrayOfBinaryNumbers, arrayOfNumbers, (float)sum / i_NumberOfInputs); // Print stats
        }

        private static void printStatistic(string[] io_ArrayOfBinaryNumbers, int[] io_ArrayOfNumbers, float i_Average)
        {
            System.Console.Write("The decimal nubmers in decending order: ");
            for (int i = io_ArrayOfNumbers.Length - 1; i > 0; i--)
            {
                System.Console.Write(io_ArrayOfNumbers[i] + ", ");
            }

            System.Console.WriteLine(io_ArrayOfNumbers[0]);
            System.Console.WriteLine("The average is: " + i_Average);

            int numberOfOnes = 0;
            int maxNumberOfOnes = 0;
            int indexOfTheLongestStringOfOnes = 0;
            int maxLengthSequenceOfOnes = 0;
            int[] arrayOfNumberOfSubstitutions = new int[io_ArrayOfNumbers.Length];
            int indexMaxNumberOfOnes = 0;

            for (int i = 0; i < io_ArrayOfBinaryNumbers.Length; i++)
            {
                int currentLengthSequenceOfOnes = 0;
                int currentSubstitutions = 0;
                char prevChar = io_ArrayOfBinaryNumbers[i][0];
                int currentNumberOfOnes = 0;

                foreach (char c in io_ArrayOfBinaryNumbers[i]) // Analyze each binary number
                {
                    if (c == '1')
                    {
                        if (prevChar != '1')
                        {
                            currentSubstitutions++;
                        }

                        currentNumberOfOnes++;
                        currentLengthSequenceOfOnes += 1;
                        if (currentLengthSequenceOfOnes > maxLengthSequenceOfOnes) // Update longest streak of ones
                        {
                            maxLengthSequenceOfOnes = currentLengthSequenceOfOnes;
                            indexOfTheLongestStringOfOnes = i;
                        }
                    }
                    else
                    {
                        if (prevChar != '0')
                        {
                            currentSubstitutions++;
                        }

                        currentLengthSequenceOfOnes = 0;
                    }

                    prevChar = c; // Update previous character
                }

                numberOfOnes += currentNumberOfOnes;

                if (currentNumberOfOnes > maxNumberOfOnes)
                {
                    maxNumberOfOnes = currentNumberOfOnes;
                    indexMaxNumberOfOnes = i;
                }

                arrayOfNumberOfSubstitutions[i] = currentSubstitutions;
            }

            System.Console.WriteLine(string.Format("The longest string of ones is: {1} ({0})", io_ArrayOfBinaryNumbers[indexOfTheLongestStringOfOnes], maxLengthSequenceOfOnes));
            System.Console.Write("The number of subsitutation is: ");
            for (int i = 0; i < arrayOfNumberOfSubstitutions.Length - 1; i++)  // Print substitutions per number
            {
                System.Console.Write(string.Format("{0} ({1}),", arrayOfNumberOfSubstitutions[i], io_ArrayOfBinaryNumbers[i]));
            }

            System.Console.WriteLine(string.Format("{0} ({1})", arrayOfNumberOfSubstitutions[arrayOfNumberOfSubstitutions.Length - 1], io_ArrayOfBinaryNumbers[arrayOfNumberOfSubstitutions.Length - 1]));
            System.Console.WriteLine(string.Format("The number with the most ones is: {0} (Binary: {1})", io_ArrayOfNumbers[indexMaxNumberOfOnes], io_ArrayOfNumbers[indexMaxNumberOfOnes]));
            System.Console.WriteLine("The number of ones in alle numbers is: " + numberOfOnes);
        }

        private static int convertBinaryNumberToDecimalNumber(string i_InputNumber)
        {
            int number = 0;

            for (int i = 0; i < i_InputNumber.Length; i++)  // Binary to decimal conversion
            {
                if (int.TryParse(i_InputNumber[i].ToString(), out int digit))
                {
                    number += (int)(digit * Math.Pow(2, i_InputNumber.Length - 1 - i));
                }
            }

            return number;
        }

        private static bool checkValidityOfNumber(string i_InputNumber)
        {
            bool result = true;

            if (i_InputNumber.Length != 7)  // Check length
            {
                result = false;
            }
            else
            {
                foreach (char c in i_InputNumber)  // Ensure only '0' or '1' are present
                {
                    if (c != '0' && c != '1')
                    {
                        result = false;
                        break;
                    }
                }
            }

            return result;
        }
    }
}
