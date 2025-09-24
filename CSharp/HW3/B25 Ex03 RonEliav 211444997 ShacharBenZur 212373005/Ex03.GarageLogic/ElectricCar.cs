using System;
using System.Collections.Generic;
using System.Text;

namespace Ex03.GarageLogic
{
    public class ElectricCar : Car
    {
        private const float k_MaxBatteryInHours = 4.8f;
        private const int k_NumberOfTires = 5;
        private const float k_MaxTirePressure = 32f;
        // $G$ DSN-012 (-10) Code duplication – Vehicle should hold Engine and decide type via polymorphism.
        internal ElectricEngine Engine { get; set; } = new ElectricEngine(k_MaxBatteryInHours);

        internal ElectricCar(string i_LicensePlate, string i_ModelName)
        {
            base.LicensePlate = i_LicensePlate;
            base.CarModelName = i_ModelName;
            base.Tires = new List<Tire>(k_NumberOfTires);

            for (int i = 0; i < k_NumberOfTires; i++)
            {
                base.Tires.Add(new Tire(k_MaxTirePressure));
            }
        }

        internal override void AddEnergy(float i_BatteryHoursToAdd, eFuelType? i_FuelType)
        {
            if (i_FuelType != null)
            {
                throw new ArgumentException("Electric car does not support fuel type.");
            }
            Engine.ChargeBattery(i_BatteryHoursToAdd);
            base.CurrentPercentageEnergyLevel = GarageLogicUtils.EnergyToPercentage(Engine.MaxBatteryInHours, (float)Engine.RemainingBatteryInHours);
        }

        internal override void FillTheRelevantData(List<string> i_VehicleInput, List<string> i_ListOfTires)
        {
            int index = 0;

            base.FillGenericData(i_VehicleInput, i_ListOfTires, ref index);
            this.CarColor = (eCarColor)Enum.Parse(typeof(eCarColor), i_VehicleInput[index++]);
            this.NumberOfDoors = (eNumberOfDoors)Enum.Parse(typeof(eNumberOfDoors), i_VehicleInput[index++]);
            float energyToFill = GarageLogicUtils.PercentageToEnergy(Engine.MaxBatteryInHours, (float)this.CurrentPercentageEnergyLevel); // Throw exception if CurrentPercentageEnergyLevel is null.
            this.Engine.RemainingBatteryInHours =  this.Engine.CheckRemainingBatteryInHours(energyToFill);
        }

        public override string ToString()
        {
            StringBuilder stringBuilder = new StringBuilder();

            stringBuilder.Append(base.ToString());
            stringBuilder.AppendLine(string.Format("This vehicle runs on electricity and has {0}% energy remaining", CurrentPercentageEnergyLevel));

            return stringBuilder.ToString();
        }
    }
}