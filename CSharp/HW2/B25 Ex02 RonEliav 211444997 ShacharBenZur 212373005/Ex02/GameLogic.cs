using System;

namespace Ex02
{
    public class GameLogic<T>
    {
        public const int k_NumOfSymbolsToGuess = 4;

        // $G$ NTT-007 (-10) There's no need to re-instantiate the Random instance each time it is used.
        public static T[] GenerateSequenceTheUserNeedToGuess(T[] i_GameSymbols)
        {
            Random random = new Random();
            T[] uniqueGeneratedSymbols = new T[k_NumOfSymbolsToGuess];
            int numOfUniqueSymbolsGenerated = 0;

            while (numOfUniqueSymbolsGenerated < k_NumOfSymbolsToGuess)
            {
                T currentSymbolGenerated = i_GameSymbols[random.Next(i_GameSymbols.Length)];

                if (!(GameLogicUtils<T>.IsSymbolAlreadyGenerated(currentSymbolGenerated, uniqueGeneratedSymbols)))
                {
                    uniqueGeneratedSymbols[numOfUniqueSymbolsGenerated] = currentSymbolGenerated;
                    numOfUniqueSymbolsGenerated++;
                }
            }

            return uniqueGeneratedSymbols;
        }

        public static void GuessFeedback(GameData<T> io_GameData)
        {
            int countWrongPositionMatch = 0, countCorrectPositionMatch = 0;

            for (int i = 0; i < GameLogic<T>.k_NumOfSymbolsToGuess; i++)
            {
                for (int j = 0; j < GameLogic<T>.k_NumOfSymbolsToGuess; j++)
                {
                    if (io_GameData.SymbolsToGuess[i].Equals(io_GameData.UserGuesses[io_GameData.CurrentGuess][j]))
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

            io_GameData.Feedback[io_GameData.CurrentGuess] = GameLogicUtils<T>.CreateFeedback(countCorrectPositionMatch, countWrongPositionMatch);
            io_GameData.CurrentGuess += 1;
            updateGameState(io_GameData, countCorrectPositionMatch);
        }

        private static void updateGameState(GameData<T> io_GameData, int i_CountInPlace)
        {
            if (i_CountInPlace == 4) // check if the user won
            {
                io_GameData.GameState = eGameState.UserWon;
            }
            else if (io_GameData.CurrentGuess == io_GameData.MaxNumOfGuesses)
            {
                io_GameData.GameState = eGameState.UserLost;
            }
            else
            {
                io_GameData.GameState = eGameState.UserPlaying;
            }
        }
    }
}
