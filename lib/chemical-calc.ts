export interface ChemicalDosage {
    chemicalName: string
    amount: number
    unit: string
    instruction: string
    type: 'increase' | 'decrease'
}

export const calculatePhDosage = (
    volumeLitros: number,
    currentPh: number,
    targetPh: number = 7.4
): ChemicalDosage | null => {
    const diff = targetPh - currentPh

    // If difference is negligible, no action needed
    if (Math.abs(diff) < 0.1) return null

    if (diff > 0) {
        // Need to INCREASE pH (Acidic water)
        // Rule: ~100g Soda Ash per 10,000L to raise 0.1 pH
        // Formula: (Diff / 0.1) * 100 * (Volume / 10000)
        const baseDosagePer10k = 100 // grams
        const amount = (diff / 0.1) * baseDosagePer10k * (volumeLitros / 10000)

        return {
            chemicalName: "Carbonato de Sodio (Soda Ash)",
            amount: Math.round(amount),
            unit: "gramos",
            instruction: "Disolver previamente en un balde con agua y esparcir por toda la piscina.",
            type: 'increase'
        }
    } else {
        // Need to DECREASE pH (Basic water)
        // Rule: ~120g Dry Acid (Sodium Bisulfate) per 10,000L to lower 0.1 pH
        // Formula: (AbsDiff / 0.1) * 120 * (Volume / 10000)
        const baseDosagePer10k = 120 // grams
        const amount = (Math.abs(diff) / 0.1) * baseDosagePer10k * (volumeLitros / 10000)

        return {
            chemicalName: "Reductor de pH (Bisulfato de Sodio)",
            amount: Math.round(amount),
            unit: "gramos",
            instruction: "Aplicar con cuidado cerca de las boquillas de retorno, evitando salpicaduras.",
            type: 'decrease'
        }
    }
}
