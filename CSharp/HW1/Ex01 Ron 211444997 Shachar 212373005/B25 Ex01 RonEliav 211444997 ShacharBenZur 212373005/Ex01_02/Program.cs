namespace Ex01_02
{
    public class Program
    {
        // calling a separate class so we can reuse it and call DrawTreeRecursion.DrawTree in task 3 
        public static void Main()
        {
            const int k_TotalLinesInTree = 7;
            DrawTreeRecursion.DrawTree(k_TotalLinesInTree);          
        }
        
    }
}
