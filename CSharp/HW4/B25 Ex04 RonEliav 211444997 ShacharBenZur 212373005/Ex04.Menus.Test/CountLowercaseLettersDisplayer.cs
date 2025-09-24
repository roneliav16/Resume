using System;
using Ex04.Menus.Interfaces;

namespace Ex04.Menus.Test
{
    public class CountLowercaseLettersDisplayer : IMenuItemNotifier
    {
        public void InvokeItem()
        {
            Console.WriteLine("Type sentence");
            string userInput = Console.ReadLine();
            int counter = 0;

            foreach (char c in userInput)
            {
                if (c >= 'a' && c <= 'z') // check if the character is not a lowercase letter
                {
                    counter++;
                }
            }

            Console.WriteLine(string.Format("There are {0} lowercase letters in your text!", counter));
        }

        public static void CountLowercaseLettersEvents()
        {
            Console.WriteLine("Type sentence");
            string userInput = Console.ReadLine();
            int counter = 0;

            foreach (char c in userInput)
            {
                if (c >= 'a' && c <= 'z')
                {
                    counter++;
                }
            }

            Console.WriteLine(string.Format("There are {0} lowercase letters in your text!", counter));
        }
    }
}