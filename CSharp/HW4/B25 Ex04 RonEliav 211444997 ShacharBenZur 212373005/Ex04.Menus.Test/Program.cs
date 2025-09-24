namespace Ex04.Menus.Test
{
    // $G$ DSN-001 (-5) You should create a separate class for running the menu. The `Program` class should only contain the `Main` method and not hold any logic or responsibilities.

    public class Program
    {
        public static void Main()
        {
            displayInterfacesMenu();
            displayEventsMenu();
        }

        private static void displayInterfacesMenu()
        {
            Interfaces.MainMenu mainMenu = new Interfaces.MainMenu();
            initInterfaceMenu(mainMenu);
            mainMenu.Show();
        }

        private static void initInterfaceMenu(Interfaces.MainMenu i_MainMenu)
        {
            Interfaces.MenuItem lettersAndVersionItem = new Interfaces.MenuItem("Letters and Version"); // Create First item
            Interfaces.MenuItem showVersionItem = new Interfaces.MenuItem("Show Version");
            Interfaces.IMenuItemNotifier showVersionNotifier = new VersionDisplayer();
            showVersionItem.AddNotifier(showVersionNotifier);
            lettersAndVersionItem.AddSubMenuItem(showVersionItem);
            Interfaces.MenuItem countLowercaseLettersItem = new Interfaces.MenuItem("Count Lowercase Letters");
            Interfaces.IMenuItemNotifier countLowercaseLettersNotifier = new CountLowercaseLettersDisplayer();
            countLowercaseLettersItem.AddNotifier(countLowercaseLettersNotifier);
            lettersAndVersionItem.AddSubMenuItem(countLowercaseLettersItem);
            Interfaces.MenuItem showCurrentDateOrTimeItem = new Interfaces.MenuItem("show Current Date/Time"); // Create Second item
            Interfaces.MenuItem showCurrentDateItem = new Interfaces.MenuItem("Show Current Date");
            Interfaces.IMenuItemNotifier showDateNotifier = new DateDisplayer();
            showCurrentDateItem.AddNotifier(showDateNotifier);
            showCurrentDateOrTimeItem.AddSubMenuItem(showCurrentDateItem);
            Interfaces.MenuItem showCurrentTimeItem = new Interfaces.MenuItem("Show Current Time");
            Interfaces.IMenuItemNotifier showTimeNotifier = new TimeDisplayer();
            showCurrentTimeItem.AddNotifier(showTimeNotifier);
            showCurrentDateOrTimeItem.AddSubMenuItem(showCurrentTimeItem);
            i_MainMenu.AddMenuItem(lettersAndVersionItem); // Add the 2 items to the main menu
            i_MainMenu.AddMenuItem(showCurrentDateOrTimeItem);
        }

        private static void displayEventsMenu()
        {
            Events.MainMenu mainMenu = new Events.MainMenu();
            initEventsMenu(mainMenu);
            mainMenu.Show();
        }

        private static void initEventsMenu(Events.MainMenu i_MainMenu)
        {
            Events.MenuItem lettersAndVersionItem = new Events.MenuItem("Letters and Version"); // Create First item
            Events.MenuItem showVersionItem = new Events.MenuItem("Show Version");
            showVersionItem.Selected += showVersionItem_Selected;
            lettersAndVersionItem.AddSubMenuItem(showVersionItem);
            Events.MenuItem countLowercaseLettersItem = new Events.MenuItem("Count Lowercase Letters");
            countLowercaseLettersItem.Selected += countLowercaseLettersItem_Selected;
            lettersAndVersionItem.AddSubMenuItem(countLowercaseLettersItem);
            Events.MenuItem showCurrentDateOrTimeItem = new Events.MenuItem("Show Current Date/Time"); // Create Second item
            Events.MenuItem showCurrentDateItem = new Events.MenuItem("Show Current Date");
            showCurrentDateItem.Selected += showCurrentDateItem_Selected;
            showCurrentDateOrTimeItem.AddSubMenuItem(showCurrentDateItem);
            Events.MenuItem showCurrentTimeItem = new Events.MenuItem("Show Current Time");
            showCurrentTimeItem.Selected += showCurrentTimeItem_Selected;
            showCurrentDateOrTimeItem.AddSubMenuItem(showCurrentTimeItem);
            i_MainMenu.AddMenuItem(lettersAndVersionItem); // Add the 2 items to the main menu
            i_MainMenu.AddMenuItem(showCurrentDateOrTimeItem);
        }
        private static void showVersionItem_Selected()
        {
            VersionDisplayer.ShowVersionEvents();
        }

        private static void countLowercaseLettersItem_Selected()
        {
            CountLowercaseLettersDisplayer.CountLowercaseLettersEvents();
        }

        private static void showCurrentDateItem_Selected()
        {
            DateDisplayer.ShowDateEvents();
        }

        private static void showCurrentTimeItem_Selected()
        {
            TimeDisplayer.ShowTimeEvents();
        }
    }
}