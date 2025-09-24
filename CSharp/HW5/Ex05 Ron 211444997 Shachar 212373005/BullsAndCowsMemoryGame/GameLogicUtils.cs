using System.Text;

namespace BullsAndCowsMemoryGame
{
    public class GameLogicUtils<T>
    {
        internal static bool IsSymbolAlreadyGenerated(T i_Symbol, T[] i_ArrayOfGeneratedSymbols)
        {
            bool isExistAlready = false;

            foreach (T i in i_ArrayOfGeneratedSymbols)
            {
                if (i_Symbol.Equals(i))
                {
                    isExistAlready = true;
                    break;
                }
            }

            return isExistAlready;
        }

        // $G$ DSN-999 (-5) Feedback should be represented as a collection of feedback options (enum) and not as a string or char.
        // The logic layer doesn't suppose know that the UI present the hits \ misses as 'V' or 'X
        // What do you want to do with it ????
        internal static string CreateFeedback(int i_CountInPlace, int i_CountNotInPlace)
        {
            StringBuilder feedbackString = new StringBuilder();

            for (int i = 0; i < GameLogic<T>.k_NumOfSymbolsToGuess; i++)
            {
                if (i_CountInPlace > 0)
                {
                    feedbackString.Append('V');
                    i_CountInPlace--;
                }
                else if (i_CountNotInPlace > 0)
                {
                    feedbackString.Append('X');
                    i_CountNotInPlace--;
                }
                else
                {
                    feedbackString.Append(' ');
                }
            }

            return feedbackString.ToString();
        }

        public static eGuessColor[] FilterNoneFromArray(eGuessColor[] i_GuessColors) // I dont have another idea
        {
            eGuessColor[] newGuessColorArray = new eGuessColor[i_GuessColors.Length - 1];

            for (int i = 1; i < i_GuessColors.Length; i++)
            {
                newGuessColorArray[i - 1] = i_GuessColors[i];
            }

            return newGuessColorArray;
        }
    }
}
