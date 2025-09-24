using System;
using System.Collections.Generic;
using System.Text;

namespace Ex03.GarageLogic
{
    public class FuelMotorcycle : Motorcycle
    {
        private const int K_NumberOfTires = 2;
        private const float k_MaxFuelL = 5.8f;
        private const eFuelType k_FuelType = eFuelType.Octan98;
        private const int k_MaxTirePressure = 30;
        internal FuelEngine Engine { get; set; } = new FuelEngine(k_FuelType, k_MaxFuelL);

        internal FuelMotorcycle(string i_LicensePlate, string i_ModelName)
        {
            base.LicensePlate = i_LicensePlate;
            base.CarModelName = i_ModelName;
            base.Tires = new List<Tire>(K_NumberOfTires);

            for (int i = 0; i < K_NumberOfTires; i++)
            {
                Tires.Add(new Tire(k_MaxTirePressure));
            }
        }

        // $G$ DSN-012 (0) Code duplication.
        internal override void AddEnergy(float i_FuelLitersToAdd, eFuelType? i_FuelType)
        {
            if (i_FuelType == null)
            {
                throw new ArgumentException("Fuel Car doesn't support Electric Engine");
            }
            if (i_FuelType != k_FuelType)
            {
                throw new ArgumentException(string.Format("Fuel type must be {0}", k_FuelType));
            }

            Engine.Refueling(i_FuelLitersToAdd);
            base.CurrentPercentageEnergyLevel = GarageLogicUtils.EnergyToPercentage(Engine.MaxFuelL, (float)Engine.CurrentFuelL);
        }

        internal override void FillTheRelevantData(List<string> i_VehicleInput, List<string> i_ListOfTires)  
        {
            int index = 0;

            base.FillGenericData(i_VehicleInput, i_ListOfTires, ref index);
            this.LicenseCategory = (eMotorcycleLicenseCategory)Enum.Parse(typeof(eMotorcycleLicenseCategory), i_VehicleInput[index++]);
            this.EngineVolumeCc = parseAndCheckEngineVolumeCc(i_VehicleInput[index++]);
            float energyToFill = GarageLogicUtils.PercentageToEnergy(Engine.MaxFuelL, (float)this.CurrentPercentageEnergyLevel); // Throw exception if CurrentPercentageEnergyLevel is null.
            this.Engine.CurrentFuelL = this.Engine.CheckCurrentFuelL(energyToFill);
        }
        public override string ToString()
        {
            StringBuilder stringBuilder = new StringBuilder();

            stringBuilder.Append(base.ToString());
            stringBuilder.AppendLine(string.Format("This vehicle runs on {0} and has {1}% fuel remaining", Engine.FuelType.ToString(), CurrentPercentageEnergyLevel));

            return stringBuilder.ToString();
        }
    }
}