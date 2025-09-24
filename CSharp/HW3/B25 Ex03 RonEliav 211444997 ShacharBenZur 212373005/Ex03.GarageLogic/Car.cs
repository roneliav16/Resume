using System.Text;

namespace Ex03.GarageLogic
{
    public abstract class Car : Vehicle
    {
        private eCarColor? m_CarColor = null;
        private eNumberOfDoors? m_NumberOfDoors = null;

        internal eCarColor? CarColor
        {
            get
            {
                return m_CarColor;
            }
            set
            {
                m_CarColor = (eCarColor)value; // Throw exception if value is null, or if the value is not in the enum.
            }
        }

        internal eNumberOfDoors? NumberOfDoors
        {
            get
            {
                return m_NumberOfDoors;
            }
            set
            {
                m_NumberOfDoors = (eNumberOfDoors)value; // Throw exception if value is null, or if the value is not in the enum.
            }
        }

        internal override void AddUniqueVehicleData()
        {
            base.VehicleUniqueData.Add("Car Color (Yellow/Black/White/Silver)");
            base.VehicleUniqueData.Add("Number of doors(2/3/4/5)");
        }

        public override string ToString()
        {
            StringBuilder stringBuilder = new StringBuilder(); 

            stringBuilder.Append(base.ToString());
            stringBuilder.AppendLine(string.Format("The color of the car is: {0}", CarColor));
            stringBuilder.AppendLine(string.Format("The car has {0} doors", NumberOfDoors));
            return stringBuilder.ToString();
        }
    }
}