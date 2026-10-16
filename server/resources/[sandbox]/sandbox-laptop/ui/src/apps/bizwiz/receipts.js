/**
 * Receipt types, as the old receipt form offered them: "General" everywhere,
 * repair types only at the mechanic businesses listed.
 */
const MECHANICS = ['redline', 'hayes', 'autoexotics', 'ottos', 'bennys', 'paleto_tuners', 'dreamworks'];

const TYPES = [
    { value: 'General', jobs: false },
    { value: 'Regular Repair', jobs: MECHANICS },
    { value: 'Full Repair', jobs: MECHANICS },
    { value: 'Lockpick', jobs: MECHANICS },
    { value: 'Performance Upgrades', jobs: MECHANICS },
    { value: 'Discounted Repair', jobs: MECHANICS },
    { value: 'Repair Kits', jobs: MECHANICS },
];

export function receiptTypes(job) {
    return TYPES.filter((t) => !t.jobs || t.jobs.includes(job)).map((t) => ({ value: t.value, label: t.value }));
}

/** Amounts were typed as text in the old form; read either. */
export function amount(v) {
    if (v === '' || v === null || v === undefined) return null;
    const n = Number(String(v).replace(/[^0-9.-]/g, ''));
    return Number.isFinite(n) ? n : null;
}
