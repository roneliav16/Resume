using System.Drawing;
using System.Windows.Forms;

namespace BullsAndCowsMemoryGame
{
    public partial class FormPickColor : Form
    {
        public Color m_SelectedColor = SystemColors.Control;

        public FormPickColor()
        {
            InitializeComponent();
        }

        private void m_ButtonColor_Click(object sender, System.EventArgs e)
        {
            Button clickedButton = sender as Button;
            m_SelectedColor = clickedButton.BackColor;
            this.Close();
        }
    }
}
