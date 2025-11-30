export interface FiltrationResult {
    hoursNeeded: number
    cyclesPerDay: number
    isEfficient: boolean
    savingsVsStandard: number // Hours saved vs 8h standard
}

/**
 * Calculates optimal filtration time based on pool volume and pump flow rate.
 * Assumes 1 turnover per day is sufficient for residential pools.
 * @param volumeLitros Pool volume in Liters
 * @param flowRateM3H Pump flow rate in m³/h
 */
export const calculateFiltrationTime = (
    volumeLitros: number,
    flowRateM3H: number
): FiltrationResult | null => {
    if (!volumeLitros || !flowRateM3H || flowRateM3H <= 0) return null

    const volumeM3 = volumeLitros / 1000
    const hoursNeeded = volumeM3 / flowRateM3H

    // Cap at 24 hours, min 1 hour
    const safeHours = Math.max(1, Math.min(24, Number(hoursNeeded.toFixed(1))))

    // Standard is often cited as 8 hours/day for average pools
    const standardHours = 8
    const savings = Math.max(0, Number((standardHours - safeHours).toFixed(1)))

    return {
        hoursNeeded: safeHours,
        cyclesPerDay: 1,
        isEfficient: safeHours < standardHours,
        savingsVsStandard: savings
    }
}

export const HP_TO_FLOW_RATE: Record<string, number> = {
    "0.5": 7,    // ~7 m3/h
    "0.75": 11,  // ~11 m3/h
    "1.0": 14,   // ~14 m3/h
    "1.5": 18,   // ~18 m3/h
    "2.0": 22,   // ~22 m3/h
    "3.0": 30    // ~30 m3/h
}
