using Ex04.Menus.Interfaces;
using System;

namespace Ex04.Menus.Test
{
    public class VersionDisplayer : IMenuItemNotifier
    {
        public void InvokeItem()
        {
            Console.WriteLine("App Version: 25.2.4.4480");
        }

        public static void ShowVersionEvents()
        {
            Console.WriteLine("App Version: 25.2.4.4480");
        }
    }
}
