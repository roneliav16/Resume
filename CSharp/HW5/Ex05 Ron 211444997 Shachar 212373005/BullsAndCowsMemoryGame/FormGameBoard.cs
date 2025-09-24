using System;
using System.Collections.Generic;
using System.Drawing;
using System.Windows.Forms;
namespace BullsAndCowsMemoryGame
{
    public partial class FormGameBoard : Form
    {
        private int m_NumberOfChances;
        private const int k_FirstSelectGuessButtonXPos = 10; // This pos repeat itself every new line// maybe there is another way to do it...
        private int m_CurrentGuessLineButtonYPos = 90; // this pos changed every new line
        private const int k_ArrowButtonXPos = 220; // This pos repeat itself every new line// maybe there is another way to do it...
        private const int k_LeftMirrorButtonXPos = 280;
        private const int k_RightMirrorButtonXPos = 300;
        private int m_CurrentGuessLine = 1;
        private int m_CurrentLineGuesses = 0;
        private eGuessColor[,] m_UserGuesses;
        private GameLogic<eGuessColor> m_GameLogic;

        public FormGameBoard(int i_NumberOfChances, GameLogic<eGuessColor> i_GameLogic)
        {
            m_NumberOfChances = i_NumberOfChances;
            m_GameLogic = i_GameLogic;
            m_UserGuesses = new eGuessColor[i_NumberOfChances, GameLogic<eGuessColor>.k_NumOfSymbolsToGuess];
            InitializeComponent();
            initializeGuessesButtons();
        }
        
        private void initializeGuessesButtons()
        {
            for(int i = 0; i < m_NumberOfChances; i++)
            {
                createButtonGuessLine(i + 1);
            }

            this.ClientSize = new Size(this.ClientSize.Width, this.ClientSize.Height + (m_NumberOfChances * 45));
        }

        private void createButtonGuessLine(int i_ButtonLineNumber)
        {
            createSelectButtonsGuesses(i_ButtonLineNumber);
            createArrowButton(i_ButtonLineNumber);
            createMirrorButtons(i_ButtonLineNumber); // The 4 buttons that are in the right side of the arrow
            m_CurrentGuessLineButtonYPos += 45;
        }

        private void createSelectButtonsGuesses(int i_ButtonLineNumber)
        {
            for (int i = 0; i < 4; i++) // 4 buttons in each line
            {
                Button buttonGuess = new Button();
                buttonGuess.Location = new Point(k_FirstSelectGuessButtonXPos + i * 50, m_CurrentGuessLineButtonYPos);
                buttonGuess.Name = string.Format("buttonSelect{0}-{1}", i_ButtonLineNumber, i + 1);
                buttonGuess.Size = new Size(41, 38);
                buttonGuess.TabIndex = 4; // ???
                buttonGuess.UseVisualStyleBackColor = false; // ???
                buttonGuess.Enabled = m_CurrentGuessLine == i_ButtonLineNumber;
                buttonGuess.Click += new EventHandler(this.buttonGuess_Click);
                this.Controls.Add(buttonGuess);
            }
        }

        private void buttonGuess_Click(object sender, EventArgs e)
        {
            Color prevColor = (sender as Button).BackColor;
            bool isButtonAlreadyColored = prevColor != SystemColors.Control;

            FormPickColor formPickColor = new FormPickColor();
            formPickColor.ShowDialog(); // Show the color picking dialog
            if (formPickColor.m_SelectedColor != SystemColors.Control)
            {
                eGuessColor selectedColor = (eGuessColor)Enum.Parse(typeof(eGuessColor), formPickColor.m_SelectedColor.Name);

                
                if (!isColorAlreadySelected(m_CurrentGuessLine - 1, selectedColor))
                {
                    (sender as Button).BackColor = formPickColor.m_SelectedColor; // Set the button's background color to the selected color
                    
                    string buttonName = (sender as Button).Name;
                    int buttonIndex = int.Parse(buttonName.Substring(buttonName.Length - 1));

                    m_UserGuesses[m_CurrentGuessLine - 1, buttonIndex - 1] = selectedColor; // Add the selected color to the current guess line
                    if (!isButtonAlreadyColored)
                    {
                        m_CurrentLineGuesses++;
                        if(m_CurrentLineGuesses == 4)
                        {
                            // i dont know if t is the right thing to do
                            Control[] currentButtonArrowArray = this.Controls.Find(string.Format("buttonArrow-{0}", m_CurrentGuessLine), false); // we need to find the button by his name because it not in our fields
                            currentButtonArrowArray[0].Enabled = true; // Enable the arrow button for this line
                        }
                    }
                }
            }
        }

        private bool isColorAlreadySelected(int i_RowIndex, eGuessColor i_Color)
        {
            bool isExist = false;

            for (int i = 0; i < GameLogic<eGuessColor>.k_NumOfSymbolsToGuess; i++)
            {
                if (m_UserGuesses[i_RowIndex, i] == i_Color)
                {
                    isExist = true;
                    break;
                }
            }

            return isExist;
        }

        private void createArrowButton(int i_ButtonLineNumber)
        {
            Button arrowButton = new Button();
            arrowButton.Enabled = false;
            arrowButton.Location = new Point(k_ArrowButtonXPos, m_CurrentGuessLineButtonYPos + 10);
            arrowButton.Name = string.Format("buttonArrow-{0}", i_ButtonLineNumber);
            arrowButton.Size = new Size(41, 23);
            arrowButton.TabIndex = 14; // ???
            arrowButton.Text = "-->>";
            arrowButton.UseVisualStyleBackColor = false; // ???
            arrowButton.Click += new EventHandler(this.arrowButton_Click);
            this.Controls.Add(arrowButton);
        }

        private void arrowButton_Click(object sender, EventArgs e)
        {
            string feedbackGuess = m_GameLogic.GuessFeedback(m_UserGuesses, m_CurrentGuessLine - 1);
            (sender as Button).Enabled = false; // Disable the arrow button after clicking it

            displayFeedback(feedbackGuess);
            if (feedbackGuess.Equals("VVVV"))
            {
                revealResults();
            }
            else
            {
                disableCurrentLine();
                enableNextLine();
            }
        }

        private void enableNextLine()
        {
            m_CurrentGuessLine++;
            m_CurrentLineGuesses = 0;

            if (m_CurrentGuessLine <= m_NumberOfChances)
            {
                for (int i = 0; i < 4; i++)
                {
                    Control[] currentButtonSelectArray = this.Controls.Find(string.Format("buttonSelect{0}-{1}", m_CurrentGuessLine, i + 1), false); // we need to find the button by his name because it not in our fields
                    currentButtonSelectArray[0].Enabled = true; // Enable the buttons for the next line
                }
            }
            else
            {
                revealResults();
            }
        }

        private void disableCurrentLine()
        {
            for (int i = 0; i < 4; i++)
            {
                Control[] currentButtonSelectArray = this.Controls.Find(string.Format("buttonSelect{0}-{1}", m_CurrentGuessLine, i + 1), false); // we need to find the button by his name because it not in our fields
                currentButtonSelectArray[0].Enabled = false; // Enable the buttons for the next line
            }
        }

        private void displayFeedback(string i_FeedbackGuess)
        {
            for (int i = 0; i < i_FeedbackGuess.Length; i++)
            {
                Control[] currentButtonMirrorArray = this.Controls.Find(string.Format("buttonMirror{0}-{1}", m_CurrentGuessLine, i + 1), false); // we need to find the button by his name because it not in our fields

                if (i_FeedbackGuess[i] == 'V')
                {
                    currentButtonMirrorArray[0].BackColor = Color.Black;
                }
                else if (i_FeedbackGuess[i] == 'X')
                {
                    currentButtonMirrorArray[0].BackColor = Color.Yellow;
                }
            }
        }

        private void revealResults()
        {
            this.button1.BackColor = Color.FromName(m_GameLogic.GeneratedSequenceToGuess[0].ToString());
            this.button2.BackColor = Color.FromName(m_GameLogic.GeneratedSequenceToGuess[1].ToString());
            this.button3.BackColor = Color.FromName(m_GameLogic.GeneratedSequenceToGuess[2].ToString());
            this.button4.BackColor = Color.FromName(m_GameLogic.GeneratedSequenceToGuess[3].ToString());
        }

        private void createMirrorButtons(int i_ButtonLineNumber)
        {
            Button mirrorButton1 = new Button();
            mirrorButton1.Location = new Point(k_LeftMirrorButtonXPos, m_CurrentGuessLineButtonYPos);
            mirrorButton1.Name = string.Format("buttonMirror{0}-1", i_ButtonLineNumber);
            mirrorButton1.Size = new Size(16, 17);
            mirrorButton1.TabIndex = 4; // ???
            mirrorButton1.UseVisualStyleBackColor = false; // ???
            mirrorButton1.Enabled = false;
            this.Controls.Add(mirrorButton1);

            Button mirrorButton2 = new Button();
            mirrorButton2.Location = new Point(k_RightMirrorButtonXPos, m_CurrentGuessLineButtonYPos);
            mirrorButton2.Name = string.Format("buttonMirror{0}-2", i_ButtonLineNumber);
            mirrorButton2.Size = new Size(16, 17);
            mirrorButton2.TabIndex = 4; // ???
            mirrorButton2.UseVisualStyleBackColor = false; // ???
            mirrorButton2.Enabled = false;
            this.Controls.Add(mirrorButton2);

            Button mirrorButton3 = new Button();
            mirrorButton3.Location = new Point(k_LeftMirrorButtonXPos, m_CurrentGuessLineButtonYPos + 20);
            mirrorButton3.Name = string.Format("buttonMirror{0}-3", i_ButtonLineNumber);
            mirrorButton3.Size = new Size(16, 17);
            mirrorButton3.TabIndex = 4; // ???
            mirrorButton3.UseVisualStyleBackColor = false; // ???
            mirrorButton3.Enabled = false;
            this.Controls.Add(mirrorButton3);

            Button mirrorButton4 = new Button();
            mirrorButton4.Location = new Point(k_RightMirrorButtonXPos, m_CurrentGuessLineButtonYPos+ 20);
            mirrorButton4.Name = string.Format("buttonMirror{0}-4", i_ButtonLineNumber);
            mirrorButton4.Size = new Size(16, 17);
            mirrorButton4.TabIndex = 4; // ???
            mirrorButton4.UseVisualStyleBackColor = false; // ???
            mirrorButton4.Enabled = false;
            this.Controls.Add(mirrorButton4);
        }
    }
}
