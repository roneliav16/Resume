using System;
using System.Collections.Generic;
using System.Text;

namespace Ex03.GarageLogic
{
    public class Truck : Vehicle
    {
        private const int K_NumberOfTires = 12;
        private const int k_MaxFuelL = 135;
        private const eFuelType k_FuelType = eFuelType.Soler;
        private const int k_MaxTirePressure = 27;
        internal FuelEngine Engine { get; set; } = new FuelEngine(k_FuelType, k_MaxFuelL);
        private bool? m_IsCarringHazardousMaterials = null;
        private float? m_TrunkVolume = null;

        internal bool? IsCarringHazardousMaterials
        {
            get
            {
                return m_IsCarringHazardousMaterials;
            }
            set
            {
                m_IsCarringHazardousMaterials = (bool)value;  // Throw exception if value is null.
            }
        }

        internal float? TrunkVolume
        {
            get
            {
                return m_TrunkVolume;
            }
            set
            {
                m_TrunkVolume = value;
            }
        }

        internal Truck(string i_LicensePlate, string i_ModelName)
        {
            base.LicensePlate = i_LicensePlate;
            base.CarModelName = i_ModelName;
            base.Tires = new List<Tire>(K_NumberOfTires);

            for (int i = 0; i < K_NumberOfTires; i++)
            {
                Tires.Add(new Tire(k_MaxTirePressure));
            }
        }

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
            base.CurrentPercentageEnergyLevel = GarageLogicUtils.EnergyToPercentage(Engine.MaxFuelL,
                (float)Engine.CurrentFuelL); // Throw exception if RemainingBatteryInHours is null.
        }

        internal override void FillTheRelevantData(List<string> i_VehicleInput, List<string> i_ListOfTires)
        {
            int index = 0;

            base.FillGenericData(i_VehicleInput, i_ListOfTires, ref index);
            this.IsCarringHazardousMaterials = bool.Parse(i_VehicleInput[index++]);
            this.TrunkVolume = parseAndCheckTrunkVolume(i_VehicleInput[index++]);
            float energyToFill = GarageLogicUtils.PercentageToEnergy(Engine.MaxFuelL, (float)this.CurrentPercentageEnergyLevel); // Throw exception if CurrentPercentageEnergyLevel is null.
            this.Engine.CurrentFuelL = this.Engine.CheckCurrentFuelL(energyToFill);
        }

        private static float parseAndCheckTrunkVolume(string i_StringValue)
        {
            float floatValue = float.Parse(i_StringValue);

            if (floatValue < 0f) // Throw exception if value is null.
            {
                throw new ValueRangeException(100f, 0f);
            }

            return floatValue;
        }

        // $G$ DSN-003 (-5) Logic is not responsible for the way user interaction is handled. Questions are not Properties.
        internal override void AddUniqueVehicleData()
        {
            base.VehicleUniqueData.Add("Is carring hazaradous matirials? (True/ False)");
            base.VehicleUniqueData.Add("Trunk volume (float number)");
        }

        public override string ToString()
        {
            StringBuilder stringBuilder = new StringBuilder();

            stringBuilder.Append(base.ToString());
            stringBuilder.AppendLine(string.Format("Is carring hazaradous matirials: {0}", (bool)IsCarringHazardousMaterials ? "Yes" : "No"));
            stringBuilder.AppendLine(string.Format("Trunk volume is: {0}", TrunkVolume));
            stringBuilder.AppendLine(string.Format("This vehicle runs on {0} and has {1}% fuel remaining", Engine.FuelType.ToString(), CurrentPercentageEnergyLevel));

            return stringBuilder.ToString();
        }
    }
}