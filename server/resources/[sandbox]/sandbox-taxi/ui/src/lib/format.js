const miles = new Intl.NumberFormat('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 });

/** "0.181": miles to three decimals, like the old meter. */
export function formatMiles(n) {
    return miles.format(Math.max(0, Number(n) || 0));
}
