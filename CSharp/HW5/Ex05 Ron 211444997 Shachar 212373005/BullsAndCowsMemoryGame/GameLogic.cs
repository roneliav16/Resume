using System;
using System.Collections.Generic;

namespace BullsAndCowsMemoryGame
{
    public class GameLogic<T>
    {
        public const int k_NumOfSymbolsToGuess = 4;
        private Random m_Random = new Random();
        private readonly T[] r_GeneratedSequenceToGuess;

        public T[] GeneratedSequenceToGuess
        {
            get
            {
                return r_GeneratedSequenceToGuess;
            }
        }

        public GameLogic(T[] i_GameSymbols)
        {
            r_GeneratedSequenceToGuess = generateSequenceTheUserNeedToGuess(i_GameSymbols);
        }

        private T[] generateSequenceTheUserNeedToGuess(T[] i_GameSymbols)
        {
            T[] uniqueGeneratedSymbols = new T[k_NumOfSymbolsToGuess];
            int numOfUniqueSymbolsGenerated = 0;

            while (numOfUniqueSymbolsGenerated < k_NumOfSymbolsToGuess)
            {
                T currentSymbolGenerated = i_GameSymbols[m_Random.Next(i_GameSymbols.Length)];

                if (!(GameLogicUtils<T>.IsSymbolAlreadyGenerated(currentSymbolGenerated, uniqueGeneratedSymbols)))
                {
                    uniqueGeneratedSymbols[numOfUniqueSymbolsGenerated] = currentSymbolGenerated;
                    numOfUniqueSymbolsGenerated++;
                }
            }

            return uniqueGeneratedSymbols;
        }

        public string GuessFeedback(T[,] i_CurrentGuessList, int i_RowIndex)
        {
            int countWrongPositionMatch = 0, countCorrectPositionMatch = 0;

            for (int i = 0; i < GameLogic<T>.k_NumOfSymbolsToGuess; i++)
            {
                for (int j = 0; j < GameLogic<T>.k_NumOfSymbolsToGuess; j++)
                {
                    if (i_CurrentGuessList[i_RowIndex, i].Equals(r_GeneratedSequenceToGuess[j]))
                    {
                        if (i == j)
                        {
                            countCorrectPositionMatch++;
                        }
                        else
                        {
                            countWrongPositionMatch++;
                        }

                        break; // each symbol appears only one time so when encounter you can break the search
                    }
                }
            }

            return GameLogicUtils<T>.CreateFeedback(countCorrectPositionMatch, countWrongPositionMatch);
        }
    }
}