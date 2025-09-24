using System.Collections.Generic;
using System;
using System.IO;
// $G$ DSN-999 (-3) Why static? it's not object-oriented. You should have had an instance of this class created by the UI.

namespace Ex03.GarageLogic
{
    public class GarageSystemLogic
    {
        public static readonly Dictionary<string, Vehicle> sr_VehiclesByLicensePlate = new Dictionary<string, Vehicle>(); // readonly to prevent modification of the list itself, but we can still modify the objects inside it

        public static void LoadVehiclesFromFile(string i_FileName)
        {
            foreach (string line in File.ReadAllLines(i_FileName))
            {
                if (string.IsNullOrWhiteSpace(line) || line.StartsWith("*"))
                {
                    break; // Skip empty lines or comment lines
                }

                string[] vehicleInfoParts = line.Split(',');
                Vehicle newVehicle = VehicleCreator.CreateVehicle(vehicleInfoParts[0], vehicleInfoParts[1], vehicleInfoParts[2]);
                List<string> listOfTires = new List<string> { vehicleInfoParts[5] }; // Index 5 is the tire pressure, which is the same for all tires in this case
                List<string> specificVehicleParts = new List<string>(vehicleInfoParts.Length - 4); 
                
                for (int i = 3; i < vehicleInfoParts.Length; i++) // copy array without the 3 parameter for constructor, and without the tire pressure parameter (index 5)
                {
                    if(i != 5)
                    {
                        specificVehicleParts.Add(vehicleInfoParts[i]);
                    }
                }

                newVehicle.FillTheRelevantData(specificVehicleParts, listOfTires);
                sr_VehiclesByLicensePlate.Add(newVehicle.LicensePlate, newVehicle);
            }
        }

        public static void AddVehicle(Vehicle i_NewVehicle, List<string> i_DataFieldsFromUser, List<string> i_ListOfTires)
        {
            i_NewVehicle.FillTheRelevantData(i_DataFieldsFromUser, i_ListOfTires);
            sr_VehiclesByLicensePlate.Add(i_NewVehicle.LicensePlate ,i_NewVehicle);
        }

        public static List<string> GetUniqueVehicleData(Vehicle i_Vehicle)
        {
            i_Vehicle.AddUniqueVehicleData();

            return i_Vehicle.VehicleUniqueData;
        }

        public static bool IsVehicleAlreadyExitsInGarage(string i_LicensePlate)
        {
            bool alreadyExists = sr_VehiclesByLicensePlate.ContainsKey(i_LicensePlate);

            if (alreadyExists)
            {

                UpdateVehicleStatus(i_LicensePlate, eVehicleGarageStatus.UnderRepair);
            }

            return alreadyExists;
        }

        public static List<string> DisplayLicensePlatesByStatus(eVehicleGarageStatus? i_Status)
        {
            List<string> returnedLicensePlates = new List<string>();

            foreach(Vehicle vehicle in sr_VehiclesByLicensePlate.Values)
            {
                if (vehicle.VehicleGarageStatus == i_Status || i_Status == null)
                {
                    returnedLicensePlates.Add(vehicle.LicensePlate);
                }
            }

            return returnedLicensePlates;
        }

        public static void UpdateVehicleStatus(string i_License, eVehicleGarageStatus i_Status)
        { 
            getVehicleByLicensePlate(i_License).VehicleGarageStatus = i_Status; // If the vehicle is not found, an exception will be thrown.
        }

        public static void InflateTiresToMax(string i_LicensePlate)
        {
            foreach(Tire tire in getVehicleByLicensePlate(i_LicensePlate).Tires)
            {
                tire.InflateTire(tire.MaxTirePressure - (float)tire.CurrentTirePressure);
            }
        }

        // $G$ DSN-012 (0) Code duplication.
        public static void Refueling(string i_LicensePlate, eFuelType i_FuelType, float i_FuelToAdd)
        {
            Vehicle vehicle = getVehicleByLicensePlate(i_LicensePlate);

            vehicle.AddEnergy(i_FuelToAdd, i_FuelType);
        }

        public static void ChargeBattery(string i_LicensePlate, float i_EnergyToCharge)
        {
            Vehicle vehicle = getVehicleByLicensePlate(i_LicensePlate);

            vehicle.AddEnergy(i_EnergyToCharge, null);
        }

        public static string GetDetailsOnVehicleByLicensePlate(string i_LicensePlate)
        {
            return getVehicleByLicensePlate(i_LicensePlate).ToString();
        }

        private static Vehicle getVehicleByLicensePlate(string i_LicensePlate)
        {
            if (!sr_VehiclesByLicensePlate.TryGetValue(i_LicensePlate, out Vehicle vehicleByLicense))
            {
                throw new ArgumentException(string.Format("The license plate: '{0}' is not found in the system.", i_LicensePlate));

            }

            return vehicleByLicense;
        }

        public static int GetNumberOfVehicleTires(Vehicle i_Vehicle)
        {
            return i_Vehicle.Tires.Count;
        }
    }
}