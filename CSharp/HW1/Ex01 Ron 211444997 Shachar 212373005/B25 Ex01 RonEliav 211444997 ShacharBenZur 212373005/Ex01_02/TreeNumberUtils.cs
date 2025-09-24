using System;

namespace Ex01_02
{
    public class TreeNumberUtils
    {
        public static int CalcSpacesUntilSequence(int i_NumberOfLinesInTree, int i_CurrentLine)
        {
            return ((i_NumberOfLinesInTree - i_CurrentLine) * 2 ) - 3;
        }

        public static int CalcCharsInLine(int i_CurrentLine)
        {
            return i_CurrentLine * 2 - 1;
        }


        public static int PrintNumberSequence(int i_StartSequenceNumber, int i_NumberOfCharsToPrint)
        {
            int currentNumberToBePrinted = i_StartSequenceNumber;
           
            for (int i = 0; i < i_NumberOfCharsToPrint; i++)
            {
                currentNumberToBePrinted = ReturnCorrectNumber(currentNumberToBePrinted);
                string msg = string.Format("{0} ", currentNumberToBePrinted);
                Console.Write(msg);
                currentNumberToBePrinted++;
            }

            return currentNumberToBePrinted;
        }


        public static int ReturnCorrectNumber (int i_CurrentNumber)
        {
            if (i_CurrentNumber > 9)
            {
                i_CurrentNumber = 1;
            }

            return i_CurrentNumber;
        }
    }
}
