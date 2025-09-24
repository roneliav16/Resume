using System.Collections.Generic;

namespace Ex03.GarageLogic
{
    public abstract class VehicleCreator
    {
        public static Vehicle CreateVehicle(string i_VehicleType, string i_LicenseID, string i_ModelName)
        {
            Vehicle newVehicle = null;

            switch (i_VehicleType)
            {
                case "FuelCar":
                    newVehicle = new FuelCar(i_LicenseID, i_ModelName);
                    break;
                case "ElectricCar":
                    newVehicle = new ElectricCar(i_LicenseID, i_ModelName);
                    break;
                case "FuelMotorcycle":
                    newVehicle = new FuelMotorcycle(i_LicenseID, i_ModelName);
                    break;
                case "ElectricMotorcycle":
                    newVehicle = new ElectricMotorcycle(i_LicenseID, i_ModelName);
                    break;
                case "Truck":
                    newVehicle = new Truck(i_LicenseID, i_ModelName);
                    break;
            }

            return newVehicle;
        }

        public static List<string> SupportedTypes
        {
            get { return new List<string> { "FuelCar", "ElectricCar", "FuelMotorcycle", "ElectricMotorcycle", "Truck" }; }
        }
    }

    public abstract class CopyOfVehicleCreator
    {
        public static Vehicle CreateVehicle(string i_VehicleType, string i_LicenseID, string i_ModelName)
        {
            Vehicle newVehicle = null;

            switch (i_VehicleType)
            {
                case "FuelCar":
                    newVehicle = new FuelCar(i_LicenseID, i_ModelName);
                    break;
                case "ElectricCar":
                    newVehicle = new ElectricCar(i_LicenseID, i_ModelName);
                    break;
                case "FuelMotorcycle":
                    newVehicle = new FuelMotorcycle(i_LicenseID, i_ModelName);
                    break;
                case "ElectricMotorcycle":
                    newVehicle = new ElectricMotorcycle(i_LicenseID, i_ModelName);
                    break;
                case "Truck":
                    newVehicle = new Truck(i_LicenseID, i_ModelName);
                    break;
            }

            return newVehicle;
        }

        public static List<string> SupportedTypes
        {
            get { return new List<string> { "FuelCar", "ElectricCar", "FuelMotorcycle", "ElectricMotorcycle", "Truck" }; }
        }
    }
}