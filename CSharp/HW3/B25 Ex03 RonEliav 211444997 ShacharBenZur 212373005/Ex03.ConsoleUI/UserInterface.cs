using System;
using System.Collections.Generic;
using Ex03.GarageLogic;
// $G$ DSN-999 (-5) Why static? it's not object-oriented. You should have had an instance of this class created by the Main and call a Run() method. 
namespace Ex03.ConsoleUI
{
    internal class UserInterface
    {
        // $G$ CSS-002 (-5) Bad members variable name (should be in the form of m_PascalCase).
        private const string filePath = "Vehicles.db";
        private static bool isDataFileLoadedAlready { get; set; } = false;

        // $G$ DSN-007 (-5) This method is too long, should be divided into several methods.
        internal static void GarageHandler()
        {
            eUserOptions currentUserOption = eUserOptions.GarageIsOpen;

            while(!chooseExitGarageProgram(currentUserOption))
            {
                // $G$ NTT-004 (-3) You should have used string.Empty instead of "".
                string licensePlate = "";

                try
                {
                    showGarageMethods();
                    int validInput = InputValidator.GetValidInputNumberFromUser(1, 8);

                    switch(validInput)
                    {
                        case 1:
                            if(!isDataFileLoadedAlready)
                            {
                                GarageSystemLogic.LoadVehiclesFromFile(filePath);
                                isDataFileLoadedAlready = true;

                                Console.WriteLine("Data base loaded to memory");
                            }
                            else
                            {
                                Console.WriteLine("Already loaded the file!");
                            }

                            break;
                        case 2:
                            licensePlate = getLicensePlate();

                            addVehicleToGarage(licensePlate);
                            break;
                        case 3:
                            Console.WriteLine("The filter options are the following: ");
                            Console.WriteLine("1. Under repair");
                            Console.WriteLine("2. Repaired");
                            Console.WriteLine("3. Paid");
                            Console.WriteLine("4. No filter");
                            eVehicleGarageStatus? sortOption = getStatusFilterFromUser();

                            foreach(string license in GarageSystemLogic.DisplayLicensePlatesByStatus(sortOption))
                            {
                                Console.WriteLine(license);
                            }

                            break;
                        case 4:
                            licensePlate = getLicensePlate();

                            Console.WriteLine("The status options are the following: ");
                            Console.WriteLine("1. Under repair");
                            Console.WriteLine("2. Repaired");
                            Console.WriteLine("3. Paid");
                            eVehicleGarageStatus newStatus = getStatusToChangeTo();
                            GarageSystemLogic.UpdateVehicleStatus(licensePlate, newStatus);
                            Console.WriteLine(string.Format("Vehicle status with the license plate: {0} updated", licensePlate));
                            break;
                        case 5:
                            licensePlate = getLicensePlate();

                            GarageSystemLogic.InflateTiresToMax(licensePlate);
                            Console.WriteLine(string.Format("All the vehicle tires with license plate: {0} inflated to max", licensePlate));
                            break;
                        case 6:
                            licensePlate = getLicensePlate();

                            Console.WriteLine("1. For refuel the vehicle");
                            Console.WriteLine("2. For charging the vehicle");
                            increaseVehicleEnergy(licensePlate);
                            break;
                        case 7:
                            licensePlate = getLicensePlate();

                            Console.WriteLine(GarageSystemLogic.GetDetailsOnVehicleByLicensePlate(licensePlate));
                            break;
                        case 8:
                            currentUserOption = eUserOptions.Exit;
                            break;
                    }
                }
                catch(ArgumentException argEx)
                {
                    Console.WriteLine(argEx.Message);
                }
                catch(ValueRangeException rangeEx)
                {
                    // $G$ DSN-010 (-5) The using of exceptions is not as required. When trying to charge vehicle with value out of range, the program fails.
                    Console.WriteLine(
                        string.Format("The valid range is {1} - {2}!", rangeEx.MinValue, rangeEx.MaxValue));
                }
                catch(FormatException formatEx)
                {
                    Console.WriteLine(formatEx.Message);
                }
                catch(NullReferenceException nullEx)
                {
                    Console.WriteLine("Cannot proceed because one or more required fields have not been initialized");
                    Console.WriteLine(nullEx.Message);
                }
                catch(Exception ex)
                {
                    Console.WriteLine(ex.Message);
                }
                finally
                {
                    if(!chooseExitGarageProgram(currentUserOption))
                    {
                        Console.WriteLine("Press enter to continue");
                        Console.ReadLine();
                        Console.Clear();
                    }
                }
            }
        }

        private static bool chooseExitGarageProgram(eUserOptions i_UserChoice)
        {
            return i_UserChoice == eUserOptions.Exit;
        }

        private static void showGarageMethods()
        {
            Console.WriteLine("Choose one of the following options: ");
            Console.WriteLine("1. Load vehicle data from file");
            Console.WriteLine("2. Add new vehicle to the Garage");
            Console.WriteLine("3. Get license plates of vehicles in the garage, with optional status filter");
            Console.WriteLine("4. Change Vehicle status");
            Console.WriteLine("5. Inflating all the car's tires to the maximum");
            Console.WriteLine("6. Fuel / Charge vehicle");
            Console.WriteLine("7. Ask for the details of a specific car details ");
            Console.WriteLine("8. Exit garage");
        }

        private static string getLicensePlate()
        {
            Console.WriteLine("Insert car's license plate");

            return Console.ReadLine();
        }

        private static eVehicleGarageStatus? getStatusFilterFromUser()
        {
            int userOption = InputValidator.GetValidInputNumberFromUser(1, 4);
            eVehicleGarageStatus? sortOption;

            if (userOption == 4)
            {
                sortOption = null;
            }
            else
            {
                sortOption = (eVehicleGarageStatus)userOption;
            }

            return sortOption;
        }

        private static eVehicleGarageStatus getStatusToChangeTo()
        {
            int userOption = InputValidator.GetValidInputNumberFromUser(1, 3);

            return (eVehicleGarageStatus)userOption;
        }

        private static void increaseVehicleEnergy(string i_licensePlate)
        {
            int userOption = InputValidator.GetValidInputNumberFromUser(1, 2);

            if (userOption == 1)
            {
                Console.WriteLine("Insert fuel type");
                Console.WriteLine("1. Octan 95");
                Console.WriteLine("2. Octan 96");
                Console.WriteLine("3. Octan 98");
                Console.WriteLine("4. Soler");
                int FuelOption = InputValidator.GetValidInputNumberFromUser(1, 4);
                eFuelType fuelType = (eFuelType)FuelOption;

                Console.WriteLine("How much fuel would you like to add? (float number)");
                string strFuel = Console.ReadLine();
                float floatFuel = float.Parse(strFuel);

                GarageSystemLogic.Refueling(i_licensePlate, fuelType, floatFuel);
                Console.WriteLine(string.Format("Vehicle with license plate: {0} fueled", i_licensePlate));
            }
            else
            {
                Console.WriteLine("How much minutes would you like to charge ? (float number)");
                string strMinToCharge = Console.ReadLine();
                float intMinToCharge = float.Parse(strMinToCharge);

                GarageSystemLogic.ChargeBattery(i_licensePlate, intMinToCharge);
                Console.WriteLine(string.Format("Vehicle with license plate: {0} charged", i_licensePlate));
            }
        }

        // $G$ CSS-013 (-3) Bad variable name (should be in the form of: i_CamelCase).
        private static void addVehicleToGarage(string i_licensePlate)
        {
            if (!GarageSystemLogic.IsVehicleAlreadyExitsInGarage(i_licensePlate))
            {
                Console.WriteLine("Please choose one of the following vehicle types ");

                foreach (string vehicleType in VehicleCreator.SupportedTypes)
                {
                    Console.WriteLine(vehicleType);
                }

                string validVehicleType = InputValidator.GetValidInputStringFromUser(VehicleCreator.SupportedTypes);
                Console.WriteLine("Enter vehicle model");
                string modelName = Console.ReadLine();
                Vehicle newVehicle = VehicleCreator.CreateVehicle(validVehicleType, i_licensePlate, modelName);
                List<string> uniqueVehicleData = GarageSystemLogic.GetUniqueVehicleData(newVehicle);
                List<string> userInputs = new List<string>();
                List<string> tiresInput = new List<string>();

                Console.WriteLine("Enter the required details below:");
                foreach (string field in uniqueVehicleData)
                {
                    Console.WriteLine(field);
                    userInputs.Add(Console.ReadLine());
                }

                int amountOfTires = GarageSystemLogic.GetNumberOfVehicleTires(newVehicle);

                Console.WriteLine(string.Format("Enter tire pressures, either all at once, or all {0} tires one by one (comma separated):", amountOfTires));
                string[] tiresPressureInput = Console.ReadLine().Split(',');
                bool isInputAllAtOnce = tiresPressureInput.Length == 1;

                for (int i = 0; i < amountOfTires; i++)
                {
                    if (isInputAllAtOnce)
                    {
                        tiresInput.Add(tiresPressureInput[0]);
                    }
                    else
                    {
                        tiresInput.Add(tiresPressureInput[i]);
                    }
                }

                GarageSystemLogic.AddVehicle(newVehicle, userInputs, tiresInput);
                Console.WriteLine("Vehicle add successfully");
            }
            else
            {
                Console.WriteLine(string.Format("The Vehicle with license plate: {0} already at the garage. Its status changed to 'Under repair'", i_licensePlate));
            }
        }
    }
}
