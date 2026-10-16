const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

/** $1,234 */
export const formatMoney = (n) => money.format(Number(n) || 0);

/** "TAT_AR_000" -> "AR 000" (tattoo names are engine codes; make them readable). */
export const prettyTattoo = (name) => String(name ?? '').replace(/^TAT_/i, '').replace(/_/g, ' ');
