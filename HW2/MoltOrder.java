/*
MoltOrder.java represents a single order made by a customer.
Each Object stores details about what is being ordered from Molt Delivery,
the customer’s name, how long it takes to drive to the customer, etc..

This class implements the interface Comparable<MoltOrder>.
This means it is required to have a function compareTo which takes another MoltOrder as a parameter,
and determines which of the two MoltOrders should be handled before the other.

The MoltOrder whose priority value is lower should be handled first,
and should thus be considered the smaller one by the compareTo function.
If you are not familiar with how the return value of compareTo represents which object is smaller,
you should read into the topic before implementing that part of the code.
*/
public class MoltOrder implements Comparable<MoltOrder> {

    private String name; // Customer's name
    private String orderDescription; // Description of the order
    private int orderReadyTime; // Time at which the order is ready
    private int timeNeededToDeliver; // Time needed to deliver the order
    private int priority; // Priority of the order

    // Main method for testing purposes

    // Constructor to initialize a MoltOrder object
    public MoltOrder(String name, String orderDescription, int orderReadyTime, int timeNeededToDeliver, int priority) {
        this.name = name;
        this.orderDescription = orderDescription;
        this.orderReadyTime = orderReadyTime;
        this.timeNeededToDeliver = timeNeededToDeliver;
        this.priority = priority;
    }

    // Method to represent a MoltOrder object as a string
    public String toString() {
        return "name: " + name + "\n" + "orderDescription: " + orderDescription + "\n" + "orderReadyTime: " + orderReadyTime
                + "\n" + "timeNeededToBeDeliver: " + timeNeededToDeliver + "\n" + "priority: " + priority + "\n";
    }

    // Method to get the time at which the order is ready
    public int getOrderReadyTime() {
        return this.orderReadyTime;
    }

    // Method to get the time needed to deliver the order
    public int getTimeNeededToDeliver() {
        return this.timeNeededToDeliver;
    }

    // Method to get the customer's name
    public String getName() {
        return this.name;
    }

    // Method to get the description of the order
    public String getOrderDescription() {
        return this.orderDescription;
    }

    // Method to compare two MoltOrder objects based on their priority
    public int compareTo(MoltOrder otherOrder) {
        return Integer.compare(this.priority, otherOrder.priority);
    }
}
