using System;
using Ex01_02;

namespace Ex01_03
{
    public class Program
    {
        public static void Main()
        {
            int validInputNumber = InputValidator.GetValidInputNumberFromUser();

            // reusing DrawTreeRecursion that was implemented in task 2 by ref to Ex01_02
            DrawTreeRecursion.DrawTree(validInputNumber);

        }
    }
}
