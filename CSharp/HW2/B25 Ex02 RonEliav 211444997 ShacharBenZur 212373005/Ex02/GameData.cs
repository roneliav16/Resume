namespace Ex02
{
    public class GameData<T>
    {
        public T[] GameAvailableSymbols { get; }
        public int MaxNumOfGuesses { get; }
        public T[] SymbolsToGuess { get; }
        public T[][] UserGuesses { get; set; }
        public string[] Feedback { get; set; } // Stores feedback for each guess using logic symbols: "V" = perfect match, "X" = correct symbol in wrong position, ' ' = no match. These are internal logic markers. UI symbols may differ across games.
        public eGameState GameState { get; set; } = eGameState.UserPlaying;
        public int CurrentGuess { get; set; } = 0;

        public GameData(int i_MaxNumOfGuesses, T[] i_SymbolsToGuess, T[] i_GameAvailableSymbols)
        {
            GameAvailableSymbols = i_GameAvailableSymbols;
            MaxNumOfGuesses = i_MaxNumOfGuesses;
            SymbolsToGuess = i_SymbolsToGuess;
            UserGuesses = new T[i_MaxNumOfGuesses][];
            Feedback = new string[i_MaxNumOfGuesses];
        }

        public void AddGuessToUserGuesses(T[] i_Guess)
        {
            UserGuesses[CurrentGuess] = i_Guess;
        }
    }
}