using System.Collections.Generic;
// $G$ DSN-007 (-5) Wrong use of Interfaces - there is no need to inherit `IMenuItemNotifier` in `MenuItem`. 
// $G$ DSN-004 (0) Redundant code duplication (menu items list, title). You should have used polymorphism.

namespace Ex04.Menus.Interfaces
{
    public class MenuItem : IMenuItemNotifier
    {
        public string ItemName { get; set; }
        internal readonly List<MenuItem> r_MenuItems;
        internal readonly List<IMenuItemNotifier> r_Notifiers;

        public MenuItem(string i_ItemName)
        {
            ItemName = i_ItemName;
            r_MenuItems = new List<MenuItem>();
            r_Notifiers = new List<IMenuItemNotifier>();
        }

        public void AddSubMenuItem(MenuItem i_SubMenuItem)
        {
            r_MenuItems.Add(i_SubMenuItem);
        }

        public void RemoveSubMenuItem(MenuItem i_SubMenuItem)
        {
            r_MenuItems.Remove(i_SubMenuItem);
        }

        public void AddNotifier(IMenuItemNotifier i_Notifier)
        {
            r_Notifiers.Add(i_Notifier);
        }

        public void RemoveNotifier(IMenuItemNotifier i_Notifier)
        {
            r_Notifiers.Remove(i_Notifier);
        }

        public void InvokeItem()
        {
            foreach (IMenuItemNotifier notifier in r_Notifiers)
            {
                notifier.InvokeItem();
            }
        }
    }
}
