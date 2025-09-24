using System;
using System.Collections.Generic;
using System.Text;

namespace Ex03.GarageLogic
{
    public class FuelCar : Car
    {
        private const int k_MaxFuelL = 48;
        private const int k_NumberOfTires = 5;
        private const eFuelType k_FuelType = eFuelType.Octan95;
        private const float k_MaxTirePressure = 32f;
        internal FuelEngine Engine { get; set; } = new FuelEngine(k_FuelType, k_MaxFuelL);

        internal FuelCar(string i_LicensePlate, string i_ModelName)
        {
            base.LicensePlate = i_LicensePlate;
            base.CarModelName = i_ModelName;
            base.Tires = new List<Tire>(k_NumberOfTires);

            for (int i = 0; i < k_NumberOfTires; i++)
            {
                base.Tires.Add(new Tire(k_MaxTirePressure));
            }
        }

        internal override void AddEnergy(float i_FuelLitersToAdd, eFuelType? i_FuelType)
        {
            if(i_FuelType == null)
            {
                throw new ArgumentException("Fuel Car doesn't support Electric Engine");
            }
            if (i_FuelType != k_FuelType)
            {
                throw new ArgumentException(string.Format("Fuel type must be {0}", k_FuelType));
            }

            Engine.Refueling(i_FuelLitersToAdd);
            base.CurrentPercentageEnergyLevel = GarageLogicUtils.EnergyToPercentage(Engine.MaxFuelL, (float)Engine.CurrentFuelL); // Throw exception if RemainingBatteryInHours is null.
        }

        internal override void FillTheRelevantData(List<string> i_VehicleInput, List<string> i_ListOfTires)
        {
            int index = 0;

            base.FillGenericData(i_VehicleInput, i_ListOfTires, ref index);
            this.CarColor = (eCarColor)Enum.Parse(typeof(eCarColor), i_VehicleInput[index++]);
            this.NumberOfDoors = (eNumberOfDoors)Enum.Parse(typeof(eNumberOfDoors), i_VehicleInput[index++]);
            float energyToFill = GarageLogicUtils.PercentageToEnergy(Engine.MaxFuelL, (float)this.CurrentPercentageEnergyLevel); // Throw exception if CurrentPercentageEnergyLevel is null.
            this.Engine.CurrentFuelL = this.Engine.CheckCurrentFuelL(energyToFill); 
        }

        public override string ToString()
        {
            StringBuilder stringBuilder = new StringBuilder();

            stringBuilder.Append(base.ToString());
            stringBuilder.AppendLine(string.Format("This vehicle runs on {0} and has {1}% energy remaining", Engine.FuelType.ToString(), CurrentPercentageEnergyLevel));

            return stringBuilder.ToString();
        }
    }
}