/*
MoltDriver (MoltDriver implements Comparable<MoltDriver>)
This class implements the interface Comparable<MoltDriver>.
This means it is required to have a function compareTo which takes another MoltDriver as a parameter.
The same instructions apply to MoltDriver’s compareTo as the corresponding section of MoltOrder above.
To compare two MoltDrivers, simply compare their nextAvailableTimeForDelivery values (this gets passed to the constructor).

MoltDriver.java represents a Molt Delivery driver. Each Object stores the driver’s name, a unique ID (i.e., an employee number),
how many orders they have delivered, and the time
at which they will be available to perform another delivery (if they are currently delivering an order, then this time will be in the future).
*/

public class MoltDriver implements Comparable<MoltDriver> {

    private int totalOrdersDelivered; // Number of orders delivered by the driver
    private int id; // Unique ID (employee number) of the driver
    private String name; // Name of the driver
    private int nextAvailableTimeForDelivery; // Time at which the driver will be available for the next delivery

    // Constructor to initialize a MoltDriver object
    public MoltDriver(int id, String name, int nextAvailableTimeForDelivery) {
        this.id = id;
        this.name = name;
        this.nextAvailableTimeForDelivery = nextAvailableTimeForDelivery;
        this.totalOrdersDelivered = 0;
    }

    // Method to increment the total number of orders delivered by the driver
    public void incrementTotalOrdersDelivered() {
        this.totalOrdersDelivered++;
    }

    // Method to get the time at which the driver will be available for the next delivery
    public int getNextAvailableTimeForDelivery() {
        return this.nextAvailableTimeForDelivery;
    }

    // Method to set the time at which the driver will be available for the next delivery
    public void setNextAvailableTimeForDelivery(int time) {
        this.nextAvailableTimeForDelivery = time;
    }

    // Method to get the name of the driver
    public String getName() {
        return this.name;
    }

    // Method to represent a MoltDriver object as a string
    public String toString() {
        return "id: " + this.id + "\n" + "name: " + this.name + "\n" + "nextAvailableTimeForDelivery: " + this.nextAvailableTimeForDelivery + "\n";
    }

    // Method to compare two MoltDriver objects based on their nextAvailableTimeForDelivery
    public int compareTo(MoltDriver otherDriver) {
        return Integer.compare(this.nextAvailableTimeForDelivery, otherDriver.nextAvailableTimeForDelivery);
    }
}