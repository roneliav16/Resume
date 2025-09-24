using Ex04.Menus.Interfaces;
using System;

namespace Ex04.Menus.Test
{
    public class DateDisplayer : IMenuItemNotifier
    {
        public void InvokeItem()
        {
            Console.WriteLine(string.Format("Current Date is {0}", DateTime.Today.ToString("dd-MM-yyyy")));
        }

        public static void ShowDateEvents()
        {
            Console.WriteLine(string.Format("Current Date is {0}", DateTime.Today.ToString("dd-MM-yyyy")));
        }
    }
}
