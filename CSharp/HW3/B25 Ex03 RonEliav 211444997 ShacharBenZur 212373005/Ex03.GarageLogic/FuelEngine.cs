namespace Ex03.GarageLogic
{
    public class FuelEngine
    {
        // $G$ DSN-999 (-4) The "fuel type" field should be readonly member of class FuelEnergyProvider. Not property.
        internal eFuelType FuelType { get; }
        // $G$ DSN-999 (-5) The "energy capacity" and "current energy" fields should be members of base class EnergyProvider.
        internal float MaxFuelL { get; }
        private float? m_CurrentFuelL { get; set; } = null;

        internal float? CurrentFuelL
        {
            get
            {
                return m_CurrentFuelL;
            }
            set
            {
                m_CurrentFuelL = value;
            }
        }

        internal FuelEngine(eFuelType i_FuelType, float i_MaxFuelL)
        {
            FuelType = i_FuelType;
            MaxFuelL = i_MaxFuelL;
        }

        internal float CheckCurrentFuelL(float i_CurrentFuelL)
        {
            if (GarageLogicUtils.IsValueInRangeValidator(MaxFuelL, 0f, i_CurrentFuelL))  // Throw exception if value is null.
            {
                throw new ValueRangeException(MaxFuelL, 0f);
            }

            return i_CurrentFuelL;
        }

        internal void Refueling(float i_FuelLitersToAdd)
        {
            if (GarageLogicUtils.IsValueInRangeValidator(MaxFuelL, 0f,
                    (float)CurrentFuelL + i_FuelLitersToAdd) || i_FuelLitersToAdd < 0f)
            {
                throw new ValueRangeException(MaxFuelL - (float)CurrentFuelL, 0); // Throw exception if CurrentFuelL is null.
            }

            CurrentFuelL += i_FuelLitersToAdd;
        }
    }

    // $G$ DSN-001 (0) Redundant class. 
    public class CopyOfFuelEngine
    {
        internal eFuelType FuelType { get; }
        internal float MaxFuelL { get; }
        private float? m_CurrentFuelL { get; set; } = null;

        internal float? CurrentFuelL
        {
            get
            {
                return m_CurrentFuelL;
            }
            set
            {
                m_CurrentFuelL = value;
            }
        }

        internal CopyOfFuelEngine(eFuelType i_FuelType, float i_MaxFuelL)
        {
            FuelType = i_FuelType;
            MaxFuelL = i_MaxFuelL;
        }

        internal float CheckCurrentFuelL(float i_CurrentFuelL)
        {
            if (GarageLogicUtils.IsValueInRangeValidator(MaxFuelL, 0f, i_CurrentFuelL))  // Throw exception if value is null.
            {
                throw new ValueRangeException(MaxFuelL, 0f);
            }

            return i_CurrentFuelL;
        }

        internal void Refueling(float i_FuelLitersToAdd)
        {
            if (GarageLogicUtils.IsValueInRangeValidator(MaxFuelL, 0f,
                    (float)CurrentFuelL + i_FuelLitersToAdd) || i_FuelLitersToAdd < 0f)
            {
                throw new ValueRangeException(MaxFuelL - (float)CurrentFuelL, 0); // Throw exception if CurrentFuelL is null.
            }

            CurrentFuelL += i_FuelLitersToAdd;
        }
    }
}