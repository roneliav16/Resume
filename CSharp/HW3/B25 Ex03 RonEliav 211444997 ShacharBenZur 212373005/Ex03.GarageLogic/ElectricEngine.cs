namespace Ex03.GarageLogic
{
    internal class ElectricEngine
    {
        internal float MaxBatteryInHours { get; }
        private float? m_RemainingBatteryInHours = null;

        internal float? RemainingBatteryInHours
        {
            get
            {
                return m_RemainingBatteryInHours;
            }
            set
            {
                m_RemainingBatteryInHours = value;
            }
        }

        internal float CheckRemainingBatteryInHours(float i_RemainingBatteryInHours)
        {
            if(GarageLogicUtils.IsValueInRangeValidator(MaxBatteryInHours, 0f, i_RemainingBatteryInHours))
            { 
                throw new ValueRangeException(MaxBatteryInHours, 0f);
            }

            return i_RemainingBatteryInHours;
        }

        internal ElectricEngine(float i_MaxBatteryInHours)
        {
            MaxBatteryInHours = i_MaxBatteryInHours;
        }

        internal void ChargeBattery(float i_BatteryHoursToAdd)
        {
            if (GarageLogicUtils.IsValueInRangeValidator(MaxBatteryInHours, 0f,
                    (float)RemainingBatteryInHours + i_BatteryHoursToAdd) || i_BatteryHoursToAdd < 0f) // Throw exception if RemainingBatteryInHours is null.
            {
                throw new ValueRangeException(MaxBatteryInHours - (float)RemainingBatteryInHours, 0f);
            }

            RemainingBatteryInHours += i_BatteryHoursToAdd;
        }
    }

    internal class CopyOfElectricEngine
    {
        internal float MaxBatteryInHours { get; }
        private float? m_RemainingBatteryInHours = null;

        internal float? RemainingBatteryInHours
        {
            get
            {
                return m_RemainingBatteryInHours;
            }
            set
            {
                m_RemainingBatteryInHours = value;
            }
        }

        internal float CheckRemainingBatteryInHours(float i_RemainingBatteryInHours)
        {
            if (GarageLogicUtils.IsValueInRangeValidator(MaxBatteryInHours, 0f, i_RemainingBatteryInHours))
            {
                throw new ValueRangeException(MaxBatteryInHours, 0f);
            }

            return i_RemainingBatteryInHours;
        }

        internal CopyOfElectricEngine(float i_MaxBatteryInHours)
        {
            MaxBatteryInHours = i_MaxBatteryInHours;
        }

        internal void ChargeBattery(float i_BatteryHoursToAdd)
        {
            if (GarageLogicUtils.IsValueInRangeValidator(MaxBatteryInHours, 0f,
                    (float)RemainingBatteryInHours + i_BatteryHoursToAdd) || i_BatteryHoursToAdd < 0f) // Throw exception if RemainingBatteryInHours is null.
            {
                throw new ValueRangeException(MaxBatteryInHours - (float)RemainingBatteryInHours, 0f);
            }

            RemainingBatteryInHours += i_BatteryHoursToAdd;
        }
    }
}