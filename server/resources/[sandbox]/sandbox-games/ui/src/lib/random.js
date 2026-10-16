/** Inclusive integer in [min, max]. */
export const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

/** Integer in [0, n). */
export const randBelow = (n) => Math.floor(Math.random() * n);

/** Integer in [min, max): the helper the original games used for positions. */
export const randRange = (min, max) => Math.floor(Math.random() * (max - min)) + min;

export const pick = (arr) => arr[randBelow(arr.length)];

export function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i -= 1) {
        const j = randBelow(i + 1);
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export const range = (n, start = 0) => Array.from({ length: Math.max(0, n) }, (_, i) => i + start);

export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

export const toNumber = (v, fallback) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
};

/** Countdown seconds the way the games always read them: falsy -> fallback. */
export const countdownOf = (params, fallback = 5) => (params?.countdown ? toNumber(params.countdown, fallback) : fallback);

/** A Lua array may arrive as a JSON array or as an object with numeric keys. */
export const asList = (v) => (Array.isArray(v) ? v : v && typeof v === 'object' ? Object.values(v) : []);
