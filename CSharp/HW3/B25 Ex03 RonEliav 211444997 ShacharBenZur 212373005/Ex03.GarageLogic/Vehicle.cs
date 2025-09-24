using System;
using System.Collections.Generic;
using System.Text;
// $G$ DSN-001 (-10) Polymorphism insufficient – Vehicle should hold an Engine base class; FuelEngine and ElectricEngine inherit from it.

namespace Ex03.GarageLogic
{
    public abstract class Vehicle
    {
        internal string CarModelName { get; set; }
        internal string LicensePlate { get; set; }
        private float? m_CurrentPercentageEnergyLevel = null;
        internal List<Tire> Tires { get; set; }
        private string m_OwnerName = null;
        private string m_OwnerPhone = null;
        private eVehicleGarageStatus? m_VehicleGarageStatus = eVehicleGarageStatus.UnderRepair;
        
        internal List<string> VehicleUniqueData { get; } = new List<string>()
        {
            "Energy percentage (float number)",
            "Tire Manufacturer name",
            "Owner name",
            "Owner phone number"
        };

        internal float? CurrentPercentageEnergyLevel
        {
            get
            {
                return m_CurrentPercentageEnergyLevel;
            }
            set
            {
                m_CurrentPercentageEnergyLevel = value;
            }
        }

        internal string OwnerName
        {
            get
            {
                return m_OwnerName;
            }
            set
            {
                foreach (char c in value)
                {
                    if (!char.IsLetter(c))
                    {
                        throw new ArgumentException("Owner name can only contain letters!");
                    }
                }

                m_OwnerName = value;
            }
        }

        internal string OwnerPhone
        {
            get
            {
                return m_OwnerPhone;
            }
            set
            {
                foreach (char c in value)
                {
                    if (!char.IsDigit(c) && c != '-')
                    {
                        throw new ArgumentException("Owner phone number can only contain digit or the symbol - !");
                    }
                }

                m_OwnerPhone = value;
            }
        }

        internal eVehicleGarageStatus? VehicleGarageStatus
        {
            get
            {
                return m_VehicleGarageStatus;
            }
            set
            {
                m_VehicleGarageStatus = (eVehicleGarageStatus)value; // Throw exception if value is null, or if the value is not in the enum.
            }
        }

        internal void FillGenericData(List<string> i_VehicleInput, List<string> i_ListOfTires, ref int io_Index)
        {
            this.CurrentPercentageEnergyLevel = parseAndCheckCurrentPercentageEnergyLevel(i_VehicleInput[io_Index++]);
            SetTireManufacturer(i_VehicleInput[io_Index++],  i_ListOfTires);
            this.OwnerName = i_VehicleInput[io_Index++];
            this.OwnerPhone = i_VehicleInput[io_Index++];
        }

        private static float parseAndCheckCurrentPercentageEnergyLevel(string i_StringValue)
        {
            float floatValue = float.Parse(i_StringValue); // Throw exception if value is null or it's not a valid float number.

            if (GarageLogicUtils.IsValueInRangeValidator(100f, 0f, floatValue)) 
            {
                throw new ValueRangeException(100f, 0f);
            }

            return floatValue;
        }

        internal void SetTireManufacturer(string i_Manufacturer, List<string> i_ListOfTires)
        {
            
            if (i_ListOfTires.Count == 1)
            {
                foreach (Tire tire in Tires)
                {
                    tire.Manufacturer = i_Manufacturer;
                    tire.CurrentTirePressure = Tire.ParseAndCheckCurrentTirePressure(tire.MaxTirePressure, i_ListOfTires[0]);
                }
            }
            else if (i_ListOfTires.Count != Tires.Count)
            {
                throw new ArgumentException(string.Format("The number of tires ({0}) does not match the number of tires in the vehicle ({1}).", i_ListOfTires.Count, Tires.Count));
            }
            else
            {
                int indexTires = 0;

                foreach(Tire tire in Tires)
                {
                    tire.Manufacturer = i_Manufacturer;
                    tire.CurrentTirePressure = Tire.ParseAndCheckCurrentTirePressure(tire.MaxTirePressure, i_ListOfTires[indexTires++]);
                }
            }
        }

        public override string ToString()
        {
            StringBuilder stringBuilder = new StringBuilder();

            stringBuilder.AppendLine(string.Format("License plate number: {0}", LicensePlate));
            stringBuilder.AppendLine(string.Format("Model name: {0}", CarModelName));
            stringBuilder.AppendLine(string.Format("Owner name: {0}", OwnerName));
            stringBuilder.AppendLine(string.Format("Vehicle garrage status: {0}", VehicleGarageStatus.ToString()));
            int tireNumber = 1;

            foreach (Tire tire in Tires)
            {
                stringBuilder.AppendLine(string.Format("Tire number {0} details: ", tireNumber));
                stringBuilder.Append(tire.ToString());
                tireNumber++;
            }

            return stringBuilder.ToString();
        }

        internal abstract void FillTheRelevantData(List<string> i_VehicleInput, List<string> i_ListOfWheels);

        internal abstract void AddUniqueVehicleData();

        internal abstract void AddEnergy(float i_EnergyToAdd, eFuelType? i_FuelType);
    }
}