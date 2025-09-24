using System;
using System.Collections.Generic;

namespace Ex04.Menus.Events
{
    public class MenuItem
    {
        public string ItemName { get; set; }
        internal readonly List<MenuItem> r_MenuItems;
        public event Action Selected;

        public MenuItem(string i_ItemName)
        {
            ItemName = i_ItemName;
            r_MenuItems = new List<MenuItem>();
        }

        public void AddSubMenuItem(MenuItem i_SubMenuItem)
        {
            r_MenuItems.Add(i_SubMenuItem);
        }
        public void RemoveSubMenuItem(MenuItem i_SubMenuItem)
        {
            r_MenuItems.Remove(i_SubMenuItem);
        }

        public void MainItemSelected()
        {
            OnSelected();
        }

        protected virtual void OnSelected()
        {
            if (Selected != null)
            {
                Selected.Invoke();
            }
        }
    }
}
