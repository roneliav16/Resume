using System.Text;

namespace Ex02
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

        public static bool IsValidSemanticallyGuess<T>(GameData<T> i_GameData, T[] i_InputGuess, bool o_IsExit)
        {
            bool isValidGuessResult = true;
            T[] seenSymbols = new T[i_InputGuess.Length];

            if (!o_IsExit)
            {
                for (int i = 0; i < i_InputGuess.Length; i++)
                {
                    if (!(checkIfElementIsInTheSymbolsArray<T>(i_GameData.GameAvailableSymbols, i_InputGuess[i]))
                        || checkIfElementIsInTheSymbolsArray(seenSymbols, i_InputGuess[i]))
                    {
                        isValidGuessResult = false;
                        break;
                    }
                    else
                    {
                        seenSymbols[i] = i_InputGuess[i];
                    }
                }
            }

            return isValidGuessResult;
        }

        private static bool checkIfElementIsInTheSymbolsArray<T>(T[] i_GameAvailableSymbols, T symbol)
        {
            bool isExist = false;

            foreach (T element in i_GameAvailableSymbols)
            {
                if (element.Equals(symbol))
                {
                    isExist = true;
                    break;
                }
            }

            return isExist;
        }

        // $G$ DSN-999 (-5) Feedback should be represented as a collection of feedback options (enum) and not as a string or char.
        // The logic layer doesn't suppose know that the UI present the hits \ misses as 'V' or 'X
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
    }
}
