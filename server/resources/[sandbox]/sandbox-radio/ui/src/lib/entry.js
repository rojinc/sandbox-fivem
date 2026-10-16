/** Frequency text helpers. Lua rounds every request to one decimal (Utils:Round(x, 1)). */

/** "420", "420.5", " 1337,5 " -> number rounded to one decimal, or null when not a frequency. */
export function parseEntry(text) {
    const raw = String(text ?? '').trim().replace(',', '.');
    if (!raw || !/^\d{1,4}(\.\d{0,2})?$/.test(raw)) return null;
    const n = Number(raw.endsWith('.') ? raw.slice(0, -1) : raw);
    if (!Number.isFinite(n) || n <= 0) return null;
    return Math.round(n * 10) / 10;
}

/** 0 -> "---.-", 123 -> "123.0", 123.45 -> "123.5" (one decimal, like Lua). */
export function formatFrequency(frequency) {
    const n = Number(frequency);
    if (!Number.isFinite(n) || n <= 0) return '---.-';
    return (Math.round(n * 10) / 10).toFixed(1);
}
