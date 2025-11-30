// Constants
const KWH_PER_LITER_PER_DEGREE = 0.00116;
const KW_PER_BTU = 0.000293;
export const DEFAULT_INEFFICIENCY = 1.2; // 20% loss with cover
export const HIGH_INEFFICIENCY = 1.5; // 50% loss without cover

export interface CalculationResult {
    hours: number;
    completionDate: Date | null;
    isValid: boolean;
}

export const calculateHeatingTime = (
    volumeLiters: number,
    currentTemp: number,
    targetTemp: number,
    powerBTU: number,
    inefficiencyFactor: number = DEFAULT_INEFFICIENCY
): CalculationResult => {

    // Validations
    if (!volumeLiters || !powerBTU || powerBTU <= 0) {
        return { hours: 0, completionDate: null, isValid: false };
    }

    const deltaTemp = targetTemp - currentTemp;

    // If target is lower than current, heating is not needed (0 hours)
    if (deltaTemp <= 0) {
        return { hours: 0, completionDate: new Date(), isValid: true };
    }

    // 1. Calculate required Energy in kWh
    const requiredEnergyKwh = volumeLiters * deltaTemp * KWH_PER_LITER_PER_DEGREE;

    // 2. Apply inefficiency
    const totalEnergyNeeded = requiredEnergyKwh * inefficiencyFactor;

    // 3. Convert BTU power to kW
    const heaterPowerKw = powerBTU * KW_PER_BTU;

    // 4. Calculate time
    const hours = totalEnergyNeeded / heaterPowerKw;

    // 5. Calculate completion date
    const now = new Date();
    const completionDate = new Date(now.getTime() + hours * 60 * 60 * 1000);

    return {
        hours: Number(hours.toFixed(1)), // Round to 1 decimal
        completionDate,
        isValid: true
    };
};
