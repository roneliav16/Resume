using System;
using System.Windows.Forms;

namespace BullsAndCowsMemoryGame
{
    public partial class FormNumberOfChances : Form // The names of th the buttons are relavent???
    // Do we need that the windows will be sizeable or fixed ?
    //Do we need that the top button in the game booad form will be buttons or flat ones? because they dont act like buttons
    {
        private int m_NumberOfChances = 4;
        public bool m_ButtonStartClicked = false;
        public int NumberOfChances // public ?
        {
            get
            {
                return m_NumberOfChances;
            }
            set
            {
                if(value >= 4 && value <= 10)
                {
                    m_NumberOfChances = value;
                }
                else
                {
                    m_NumberOfChances = 4; // Reset to default if out of range (allows cyclic choice)
                }

                m_ButtonNumberOfChances.Text = "Number of chances: " + NumberOfChances;
            }
        }

        public FormNumberOfChances()
        {
            InitializeComponent();
        }

        private void m_ButtonNumberOfChances_Click(object sender, EventArgs e) // The function has good name?
        {
            // We need to put this lines in seperate function ????????????
            NumberOfChances++; // Increment the number of chances
            m_ButtonNumberOfChances.Text = "Number of chances: " + NumberOfChances;

        }

        private void m_ButtonStart_Click(object sender, EventArgs e) // The function has good name?
        {
            m_ButtonStartClicked = true;
            this.Close();
        }
    }
}
