using System;
using System.Collections.Generic;

namespace Ex04.Menus.Interfaces
{
    public class MainMenu
    {
        private const string k_MenuSeparatorSticker = "------------------------";
        private const string k_MainMenuNameSticker = "** Interfaces Main Menu **";
        private readonly List<MenuItem> r_MenuItems;

        public MainMenu()
        {
            r_MenuItems = new List<MenuItem>();
        }

        public void AddMenuItem(MenuItem i_MenuItem)
        {
            r_MenuItems.Add(i_MenuItem);
        }

        public void RemoveMenuItem(MenuItem i_MenuItem)
        {
            r_MenuItems.Remove(i_MenuItem);
        }

        public void Show()
        {
            while (true)
            {
                Console.Clear();
                displayMainMenu();
                int userChoice = getValidUserChoice(r_MenuItems.Count);

                if (userChoice == 0)
                {
                    break; // Exit if exit choice Selected
                }

                onMenuItemSelected(r_MenuItems[userChoice - 1]);
            }
        }

        private void displayMainMenu()
        {
            Console.WriteLine(k_MainMenuNameSticker);
            Console.WriteLine(k_MenuSeparatorSticker);
            displayMenuItemList(r_MenuItems);
            Console.WriteLine("0. Exit");
            if (r_MenuItems.Count > 0)
            {
                Console.WriteLine(string.Format("Please enter your choice (1-{0} or 0 to Exit):", r_MenuItems.Count));
            }
            else
            {
                Console.WriteLine("Press 0 to Exit.");
            }
        }

        private void onMenuItemSelected(MenuItem i_MenuItem)
        {
            if (i_MenuItem.r_MenuItems.Count > 0)
            {
                showMenuByMenuItem(i_MenuItem);
            }
            else
            {
                Console.Clear();
                i_MenuItem.InvokeItem();
                Console.WriteLine();
                Console.WriteLine("Press any key to continue");
                Console.ReadKey();
            }
        }

        private void showMenuByMenuItem(MenuItem i_MenuItem)
        {
            while (true)
            {
                Console.Clear();
                displaySubMenu(i_MenuItem);
                int userChoice = getValidUserChoice(i_MenuItem.r_MenuItems.Count);

                if (userChoice == 0)
                {
                    break; // Exit if exit choice Selected
                }

                onMenuItemSelected(i_MenuItem.r_MenuItems[userChoice - 1]);
            }
        }

        private void displaySubMenu(MenuItem i_MenuItem)
        {
            Console.WriteLine(string.Format("** {0} **", i_MenuItem.ItemName));
            Console.WriteLine(k_MenuSeparatorSticker);
            displayMenuItemList(i_MenuItem.r_MenuItems);
            Console.WriteLine("0. Back");
            Console.WriteLine(string.Format("Please enter your choice (1-{0} or 0 to go back):", i_MenuItem.r_MenuItems.Count));
        }

        private void displayMenuItemList(List<MenuItem> i_MenuItemsList)
        {
            for (int i = 1; i <= i_MenuItemsList.Count; i++)
            {
                Console.WriteLine(string.Format("{0}. {1}", i, i_MenuItemsList[i - 1].ItemName));
            }
        }

        private int getValidUserChoice(int i_NumberOfChoices)
        {
            int userChoice = 0;
            bool isParseSuccessful = int.TryParse(Console.ReadLine(), out userChoice);

            while (!isParseSuccessful || userChoice > i_NumberOfChoices || userChoice < 0)
            {
                Console.WriteLine("Wrong input. Please try again!");
                isParseSuccessful = int.TryParse(Console.ReadLine(), out userChoice);
            }

            return userChoice;
        }
    }
}
