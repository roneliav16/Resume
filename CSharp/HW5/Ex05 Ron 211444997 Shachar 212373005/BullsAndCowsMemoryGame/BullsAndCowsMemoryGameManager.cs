using System;

namespace BullsAndCowsMemoryGame
{
    public class BullsAndCowsMemoryGameManager
    {
        private FormNumberOfChances m_FormNumberOfChances;
        private FormGameBoard m_FormGameBoard;

        public BullsAndCowsMemoryGameManager()
        {
            m_FormNumberOfChances = new FormNumberOfChances();
            // Initialize the game manager..... Do we need this method ?
        }

        public void StartGame()
        {
            m_FormNumberOfChances.ShowDialog(); // Show the form to select number of chances

            if (m_FormNumberOfChances.m_ButtonStartClicked)
            {
                eGuessColor[] filteredFromArrayGuessColors = GameLogicUtils<eGuessColor>.FilterNoneFromArray((eGuessColor[])Enum.GetValues(typeof(eGuessColor)));
                GameLogic<eGuessColor> gameLogic = new GameLogic<eGuessColor>(filteredFromArrayGuessColors);
                m_FormGameBoard = new FormGameBoard(m_FormNumberOfChances.NumberOfChances, gameLogic);
                m_FormGameBoard.ShowDialog();
            }
        }
    }
}
