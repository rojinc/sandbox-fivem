/**
 * Mirrors `_radioData` in ../../../config.lua, keyed by the `type` Lua sends in
 * UPDATE_DATA (1 Encrypted, 2 B0085, 3 P6900). Display hints only: every request
 * still goes to Lua, which validates it and answers with UPDATE_DATA.
 */
export const RANGES = {
    1: { min: 1, max: 9999 },
    2: { min: 100, max: 2000 },
    3: { min: 100, max: 1000 },
};

export function rangeFor(type) {
    return RANGES[type] ?? null;
}

export function inRange(type, frequency) {
    const r = rangeFor(type);
    if (!r) return true;
    return frequency >= r.min && frequency <= r.max;
}
