using Ex04.Menus.Interfaces;
using System;

namespace Ex04.Menus.Test
{
    public class TimeDisplayer : IMenuItemNotifier
    {
        public void InvokeItem()
        {
            Console.WriteLine(string.Format("Current Time is {0}", DateTime.Now.ToString("HH:mm:ss")));
        }

        public static void ShowTimeEvents()
        {
            Console.WriteLine(string.Format("Current Time is {0}", DateTime.Now.ToString("HH:mm:ss")));
        }
    }
}
