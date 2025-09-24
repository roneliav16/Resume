namespace Ex03.GarageLogic
{
    internal class GarageLogicUtils
    {
        // $G$ DSN-006 (-1) This method should be in ValueOutOfRangeException class.
        internal static bool IsValueInRangeValidator(float i_Max, float i_Min, float i_Value)
        {
            return i_Value > i_Max || i_Value < i_Min;
        }

        // $G$ DSN-006 (-2) These methods should be in vehicle class.
        internal static float EnergyToPercentage(float i_MaxEnergyContainer, float i_CurrentEnergyPercentage)
        {
            return (i_CurrentEnergyPercentage / i_MaxEnergyContainer) * 100f;
        }

        internal static float PercentageToEnergy(float i_MaxEnergyContainer, float i_Percentage)
        {
            return (i_Percentage /100) * i_MaxEnergyContainer;
        }
    }
}