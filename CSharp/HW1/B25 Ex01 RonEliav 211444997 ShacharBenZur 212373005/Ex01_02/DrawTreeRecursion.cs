using System;
// $G$ SFN-026 (+5) Bonus - Use of recursion. Note: This could have been implemented in a more readable way.

namespace Ex01_02
{
    public class DrawTreeRecursion
    {
        public static void DrawTree (int i_TotalLinesInTree)
        {
            drawTreeRecursive(i_TotalLinesInTree, 1, 'A', 1);
        }

        private static int drawTreeRecursive(int i_TotalLinesInTree, int i_CurrentLine, char i_CurrentLetter, int i_CurrentNumberToPrinted)
        {
            // end case, draw last two lines
            if ( i_CurrentLine == i_TotalLinesInTree - 1)
            {
                drawLastTwoLines(i_TotalLinesInTree, i_CurrentLetter, i_CurrentNumberToPrinted);
                return 0; 
            }

            Console.Write(i_CurrentLetter);

            int spacesUntillStartOfSequence = TreeNumberUtils.CalcSpacesUntilSequence(i_TotalLinesInTree, i_CurrentLine);
            int numberOfCharsToPrint = TreeNumberUtils.CalcCharsInLine(i_CurrentLine);

            Console.Write(new string(' ', spacesUntillStartOfSequence));

            int nextNumberToBePrinted = TreeNumberUtils.PrintNumberSequence(i_CurrentNumberToPrinted, numberOfCharsToPrint);

            Console.WriteLine();

            // recursively draw the next line
            return drawTreeRecursive(i_TotalLinesInTree, i_CurrentLine + 1, (char)(i_CurrentLetter + 1), nextNumberToBePrinted);
        }


        private static void drawLastTwoLines(int i_TotalLinesInTree, char i_CurrentLetter, int i_CurrentNumberToPrinted)
        {
            const int k_LastLines = 2;

            // ensure the number is in range of 1-9
            i_CurrentNumberToPrinted = TreeNumberUtils.ReturnCorrectNumber(i_CurrentNumberToPrinted);

            string msg = string.Format("|{0}|", i_CurrentNumberToPrinted);
                        
            int spacesUntilStart = TreeNumberUtils.CalcSpacesUntilSequence(i_TotalLinesInTree, 1) - 1;

            // draw the last two lines
            for (int i = 0; i < k_LastLines; i++)
            {
                Console.Write(i_CurrentLetter);
                Console.Write(new string(' ', spacesUntilStart));
                Console.WriteLine(msg);
                i_CurrentLetter++;
            }
        }
    }
}
