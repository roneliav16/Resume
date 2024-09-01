
import java.util.Random;

public class Sorter {

    public static <T extends Comparable<T>> void quickSort(T[] array) {
        quickSort(array, 0, array.length - 1); // Call the recursive quickSort helper method
    }

    private static <T extends Comparable<T>> void quickSort(T[] array, int low, int high) {
        if (low < high - 2) { // Base condition: if there are at least four elements
            int p = partition(array, low, high); // Get the partitioning index
            quickSort(array, low, p - 1); // Recursively sort elements before partition
            quickSort(array, p + 1, high); // Recursively sort elements after partition
        }
        else{
            bubbleSort(array, low, high);
        }
    }

    private static <T extends Comparable<T>> int partition(T[] array, int low, int high) {
        Random rand = new Random();
        int pivotIndex = low + rand.nextInt(high - low + 1); // Choose a random pivot
        T pivot = array[pivotIndex]; // Get the pivot element
        swap(array, pivotIndex, high); // Move pivot to the end
        int i = low - 1; // Index of smaller element
        for (int j = low; j < high; j++) {
            if (array[j].compareTo(pivot) <= 0) { // If current element is smaller than or equal to pivot
                i++;
                swap(array, i, j); // Swap elements
            }
        }
        swap(array, i + 1, high); // Move pivot to the correct position
        return i + 1; // Return the partitioning index
    }


    public static <T extends Comparable<T>> void bubbleSort(T[] array, int low, int high) {
        boolean swapped; // Flag to detect if any swapping occurred
        for (int i = low; i < high; i++) { // Iterate over each element in the subarray
            swapped = false; // Reset swapped flag
            for (int j = low; j < high - (i - low); j++) { // Iterate over the unsorted part of the subarray
                if (array[j].compareTo(array[j + 1]) > 0) { // Compare adjacent elements
                    swap(array, j, j + 1); // Swap if they are in the wrong order
                    swapped = true; // Set swapped flag
                }
            }
            if (!swapped) { // If no two elements were swapped, the subarray is sorted
                break; // Exit the loop early
            }
        }
    }

    private static <T> void swap(T[] array, int i, int j) {
        T temp = array[i]; // Temporarily store the element at index i
        array[i] = array[j]; // Assign the element at index j to index i
        array[j] = temp; // Assign the temporarily stored element to index j
    }

    public static <T extends Comparable<T>> void mergeSortNoRecursion(T[] array) {
        int n = array.length;
        T[] tempArray = (T[]) new Comparable[n]; // Create a temporary array for merging

        for (int currSize = 1; currSize <= n - 1; currSize = 2 * currSize) { // Iterate over subarray sizes
            for (int leftStart = 0; leftStart < n - 1; leftStart += 2 * currSize) { // Iterate over subarray starting points
                int mid = Math.min(leftStart + currSize - 1, n - 1); // Calculate the midpoint
                int rightEnd = Math.min(leftStart + 2 * currSize - 1, n - 1); // Calculate the endpoint
                merge(array, tempArray, leftStart, mid, rightEnd); // Merge the subarrays
            }
        }
    }

    private static <T extends Comparable<T>> void merge(T[] array, T[] tempArray, int left, int mid, int right) {
        int i = left, j = mid + 1, k = left; // Initialize indices for left, right, and merged subarrays
        while (i <= mid && j <= right) { // While both subarrays have elements
            if (array[i].compareTo(array[j]) <= 0) { // If element in left subarray is smaller
                tempArray[k++] = array[i++]; // Copy element to tempArray
            } else {
                tempArray[k++] = array[j++]; // Copy element to tempArray
            }
        }
        while (i <= mid) { // Copy remaining elements of left subarray
            tempArray[k++] = array[i++];
        }
        while (j <= right) { // Copy remaining elements of right subarray
            tempArray[k++] = array[j++];
        }
        for (i = left; i <= right; i++) { // Copy merged subarray back to original array
            array[i] = tempArray[i];
        }
    }

    /**
     * Public method to perform RadixSort on an array of Long integers.
     * @param array       The array to be sorted.
     * @param bitsPerDigit The number of bits per digit.
     */
    public static void radixSort(Long[] array, int bitsPerDigit) {
        if (array.length == 0) {
            return;
        }
        Long max = array[0];
        for (int i = 1; i < array.length; i++) {
            if (array[i] > max) {
                max = array[i];
            }
        }
            int base = 1 << bitsPerDigit; // Calculate the base as 2^bitsPerDigit
            int numberOfDigits = 0; // Initialize the number of digits to 0
            Long remainder; // Declare a variable to store the remainder

            // Loop until max becomes 0
            while (max != 0) {
                remainder = max % base; // Calculate the remainder of max divided by base

                if (remainder == 0) {
                    max = max / base; // If remainder is 0, divide max by base directly
                } else {
                    max = (max - remainder) / base; // Otherwise, subtract remainder from max and then divide by base
                }
                numberOfDigits++; // Increment the number of digits
            }


        Long[] output = new Long[array.length]; // Create an output array

        for (int digitIndex = 0; digitIndex < numberOfDigits; digitIndex++) { // Iterate over each digit
            countingSort(array, output, bitsPerDigit, digitIndex); // Perform counting sort on each digit
        }
    }


    private static void countingSort(Long[] arr, Long[] output, int bitsPerDigit, int digitIndex) {
        int base = 1 << bitsPerDigit; // Calculate the base (2^bitsPerDigit)
        int[] count = new int[base]; // Create a count array for counting sort

        for (Long num : arr) {
            int digit = extractDigit(num, bitsPerDigit, digitIndex); // Extract the digit
            count[digit]++; // Increment the count of the digit
        }

        for (int i = 1; i < base; i++) {
            count[i] += count[i - 1]; // Compute cumulative count
        }

        for (int i = arr.length - 1; i >= 0; i--) {
            int digit = extractDigit(arr[i], bitsPerDigit, digitIndex); // Extract the digit
            output[count[digit] - 1] = arr[i]; // Place the element in the output array
            count[digit]--; // Decrement the count
        }

        copyArrray(arr, output); // Copy the output array to the original array
    }
    public static void copyArrray (Long[] arr, Long[] output) {
        for (int i = 0; i < arr.length; i++) {
            arr[i] = output[i];
        }
    }

    private static int extractDigit(Long key, int bitsPerDigit, int digitIndex) {
        return (int) ((key >> (digitIndex * bitsPerDigit)) & ((1 << bitsPerDigit) - 1)); // Extract the digit using bitwise operations
    }

}

