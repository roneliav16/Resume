using System.Text;

namespace Ex03.GarageLogic
{
    public abstract class Motorcycle : Vehicle
    {
        private eMotorcycleLicenseCategory? m_LicenseCategory = null;
        private int? m_EngineVolumeCc = null;

        internal eMotorcycleLicenseCategory? LicenseCategory
        {
            get
            {
                return m_LicenseCategory;
            }
            set
            {
                m_LicenseCategory = (eMotorcycleLicenseCategory)value; // Throw exception if value is null.
            }
        }

        internal int? EngineVolumeCc
        {
            get
            {
                return m_EngineVolumeCc;
            }
            set
            {
                m_EngineVolumeCc = value;
            }
        }

        internal int parseAndCheckEngineVolumeCc(string i_StringValue)
        {
            int intValue = int.Parse(i_StringValue);
            if (intValue < 0) // Throw exception if value is negative.
            {
                throw new ValueRangeException(int.MaxValue, 0);
            }

            return intValue;
        } 

        internal override void AddUniqueVehicleData()
        {
            base.VehicleUniqueData.Add("License category(A, A2, AB, B2)");
            base.VehicleUniqueData.Add("Engine volume in cc (integer number)");
        }

        public override string ToString()
        {
            StringBuilder stringBuilder = new StringBuilder();

            stringBuilder.Append(base.ToString());
            stringBuilder.AppendLine(string.Format("The license category is: {0}", LicenseCategory));
            stringBuilder.AppendLine(string.Format("Engine volume in cc is: {0}", EngineVolumeCc));
            return stringBuilder.ToString();
        }
    }
}