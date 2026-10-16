/** Vehicle categories the dealerships stock, as the old pages listed them. */
export const CATEGORIES = [
    { value: 'all', label: 'All categories' },
    { value: 'import', label: 'Imports' },
    { value: 'drift', label: 'Drift' },
    { value: 'tuner', label: 'Tuners' },
    { value: 'coupe', label: 'Coupes' },
    { value: 'compact', label: 'Compacts' },
    { value: 'suv', label: 'SUVs' },
    { value: 'sedans', label: 'Sedans' },
    { value: 'muscle', label: 'Muscle' },
    { value: 'sport', label: 'Sports' },
    { value: 'sportclassic', label: 'Sports classics' },
    { value: 'super', label: 'Super' },
    { value: 'motorcycles', label: 'Motorcycles' },
    { value: 'offroad', label: 'Off-road' },
    { value: 'rally', label: 'Rally' },
    { value: 'van', label: 'Vans' },
    { value: 'utility', label: 'Utility' },
    { value: 'misc', label: 'Other' },
];

export function categoryLabel(value) {
    return CATEGORIES.find((c) => c.value === value)?.label ?? 'Other';
}

/**
 * The sale price and loan figures the old sale form showed. The server does
 * its own sums; these are for the salesperson.
 */
export function saleFigures({ base, profitPercentage = 0, commission = 0, interest = 15, downPercent = 50, weeks = 8 }) {
    const price = Number(base) || 0;
    const sale = price * (1 + (Number(profitPercentage) || 0) / 100);
    const earned = (sale - price) * ((Number(commission) || 0) / 100);
    const down = sale * (Number(downPercent) / 100);
    const owed = (sale - down) * (1 + (Number(interest) || 0) / 100);
    return {
        sale: Math.ceil(sale),
        commission: Math.ceil(earned),
        down: Math.ceil(down),
        owed: Math.ceil(owed),
        weekly: Math.ceil(owed / (Number(weeks) || 1)),
    };
}
