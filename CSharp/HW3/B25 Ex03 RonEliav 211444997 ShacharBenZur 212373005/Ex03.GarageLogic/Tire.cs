using System.Text;

namespace Ex03.GarageLogic
{
    internal class Tire
    {
        // $G$ DSN-999 (-4) The "maximum air pressure" field should be readonly member of class wheel.
        // $G$ DSN-004 (-5) You were supposed to use class data members here, not properties.
        internal string Manufacturer { get; set; } = null;
        internal float MaxTirePressure { get; }
        private float? m_CurrentTirePressure = null;

        internal float? CurrentTirePressure
        {
            get
            {
                return m_CurrentTirePressure;
            }
            set
            {
                m_CurrentTirePressure = value;
            }
        }

        internal Tire(float i_MaxTirePressure)
        {
            MaxTirePressure = i_MaxTirePressure;
        }

        internal void InflateTire(float i_AirPressureToAdd)
        {
            if (GarageLogicUtils.IsValueInRangeValidator(MaxTirePressure, 0, i_AirPressureToAdd + (float)m_CurrentTirePressure) // Throw exception if CurrentTirePressure is null.
                                                            || i_AirPressureToAdd < 0f)
            {
                throw new ValueRangeException(MaxTirePressure - (float)m_CurrentTirePressure, 0f);
            }
            else
            {
                m_CurrentTirePressure += i_AirPressureToAdd;
            }
        }

        internal static float ParseAndCheckCurrentTirePressure(float i_MaxTirePressure, string i_StringValue)
        {
            float floatValue = float.Parse(i_StringValue); // Throw exception if value is null or it's not a valid float number.

            if (GarageLogicUtils.IsValueInRangeValidator(i_MaxTirePressure, 0, floatValue)) // Throw exception if value is null.
            {
                throw new ValueRangeException(i_MaxTirePressure, 0f);
            }

            return floatValue;
        }

        public override string ToString()
        {
            StringBuilder stringBuilder = new StringBuilder();

            stringBuilder.AppendLine(string.Format("Manufacturer: {0}. Tire pressure: {1}", Manufacturer, CurrentTirePressure));
            
            return stringBuilder.ToString();
        }
    }

    // $G$ DSN-001 (-5) Redundant class.
    internal class CopyOfTire
    {
        internal string Manufacturer { get; set; } = null;
        internal float MaxTirePressure { get; }
        private float? m_CurrentTirePressure = null;

        internal float? CurrentTirePressure
        {
            get
            {
                return m_CurrentTirePressure;
            }
            set
            {
                m_CurrentTirePressure = value;
            }
        }

        internal CopyOfTire(float i_MaxTirePressure)
        {
            MaxTirePressure = i_MaxTirePressure;
        }

        internal void InflateTire(float i_AirPressureToAdd)
        {
            if (GarageLogicUtils.IsValueInRangeValidator(MaxTirePressure, 0, i_AirPressureToAdd + (float)m_CurrentTirePressure) // Throw exception if CurrentTirePressure is null.
                                                            || i_AirPressureToAdd < 0f)
            {
                throw new ValueRangeException(MaxTirePressure - (float)m_CurrentTirePressure, 0f);
            }
            else
            {
                m_CurrentTirePressure += i_AirPressureToAdd;
            }
        }

        internal static float ParseAndCheckCurrentTirePressure(float i_MaxTirePressure, string i_StringValue)
        {
            float floatValue = float.Parse(i_StringValue); // Throw exception if value is null or it's not a valid float number.

            if (GarageLogicUtils.IsValueInRangeValidator(i_MaxTirePressure, 0, floatValue)) // Throw exception if value is null.
            {
                throw new ValueRangeException(i_MaxTirePressure, 0f);
            }

            return floatValue;
        }

        public override string ToString()
        {
            StringBuilder stringBuilder = new StringBuilder();

            stringBuilder.AppendLine(string.Format("Manufacturer: {0}. CopyOfTire pressure: {1}", Manufacturer, CurrentTirePressure));

            return stringBuilder.ToString();
        }
    }
}