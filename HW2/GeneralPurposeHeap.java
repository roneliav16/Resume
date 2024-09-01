public class GeneralPurposeHeap<T extends Comparable<T>> {
    private T[] heap; // Array to store heap elements
    private int size; // Number of elements in the heap

    private static final int HEAP_CAPACITY = 10;

    // Constructor to create an empty heap with default capacity
    public GeneralPurposeHeap() {
        this.heap = (T[]) new Comparable[HEAP_CAPACITY + 1];
        this.size = 0;
    }

    // Constructor to create an empty heap with specified initial capacity
    public GeneralPurposeHeap(int initialCapacity) {
        this.heap = (T[]) new Comparable[initialCapacity + 1];
        this.size = 0;
    }

    // Constructor to create a heap from an array of elements
    public GeneralPurposeHeap(T[] initialData) {
        this.heap = (T[]) new Comparable[initialData.length + 1];
        this.size = initialData.length;
        buildHeap(initialData, this.heap);
    }

    // Build the heap from an array of elements
    public void buildHeap(T[] initialData, T[] heap) {
        System.arraycopy(initialData, 0 , heap, 1, initialData.length);
        for (int i = (this.size / 2); i >= 1; i--) {
            percDown(i, this.heap[i], this.size);
        }
    }

    // Copy elements from an array to the heap


    // Percolate down operation to maintain heap property
    public void percDown(int i, T x, int n) {
        if (2 * i > n) {
            heap[i] = x;
        } else {
            if (2 * i == n) {
                if (heap[2 * i].compareTo(x) < 0) {
                    heap[i] = heap[2 * i];
                    heap[2 * i] = x;
                } else {
                    heap[i] = x;
                }
            } else {
                int j;
                if (heap[2 * i].compareTo(heap[2 * i + 1]) < 0) {
                    j = (2 * i);
                } else {
                    j = (2 * i) + 1;
                }
                if (heap[j].compareTo(x) < 0) {
                    heap[i] = heap[j];
                    percDown(j, x, n);
                } else {
                    heap[i] = x;
                }
            }
        }
    }

    // Percolate up operation to maintain heap property
    public void percUp(int i, T x) {
        int p = i / 2;

        if (i == 1) {
            heap[1] = x;
        } else if (heap[p].compareTo(x) <= 0 ){
            heap[i] = x;
        } else {
            heap[i] = heap[p];
            percUp(p, x);
        }
    }

    // Copy elements from the heap to a new array
    public T[] copyArrFromThisHeapToNewArr(int n) {
        T[] newArr = (T[]) new Comparable[n];
        System.arraycopy(heap, 1, newArr, 1, size);
        return newArr;
    }

    // Insert an element into the heap
    public void insert(T element) {
        if (element == null) {
            throw new IllegalArgumentException("The element is Null");
        }
        if (heap.length - 1 == size) {
            this.heap = copyArrFromThisHeapToNewArr(2 * heap.length);
        }
        size++;
        percUp(size, element);
    }

    // Find and return the minimum element in the heap
    public T findMin() {
        if (this.size == 0) {
            throw new IllegalArgumentException("The heap is empty!");
        }
        return this.heap[1];
    }

    // Get the number of elements in the heap
    public int getSize() {
        return this.size;
    }

    // Delete the minimum element from the heap and return it
    public T deleteMin() {
        if (this.size == 0) {
            throw new IllegalArgumentException("The heap is empty!");
        }
        T T1 = heap[1];
        heap[1] = heap[size];
        size--;
        percDown(1, heap[1], size);
        return T1;
    }

    // Merge another heap into this heap
    public void mergeHeap(GeneralPurposeHeap<T> otherHeap) {
        int n = size + otherHeap.size;
        T[] newArr = (T[]) new Comparable[n + 1];

        for (int i = 1; i <= size; i++) {
            newArr[i] = heap[i];
        }
        int index = 1;
        for (int j = size + 1; j <= n; j++) {
            newArr[j] = otherHeap.heap[index];
            index++;
        }

        this.size = n;
        this.heap = newArr;

        for (int i = (n / 2); i >= 1; i--) {
            percDown(i, this.heap[i], n);
        }
    }

    // Convert the heap to a string representation
    public String toString() {
        String str = "";
        for (int i = 1; i <= size; i++) {
            str += heap[i] + "\n";
        }
        return str;
    }
}