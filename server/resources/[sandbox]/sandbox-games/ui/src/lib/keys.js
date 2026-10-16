/** Keys a scanner / round skill check may ask for, and that fail a round check when wrong. */
export const KEYMAP = ['e', 'q', 'r', '1', '2', '3', '4'];

/** Key sets for the keymaster alleys. */
export const KEYSETS = [
    ['q', 'w', 'e', 'r'],
    ['a', 's', 'd', 'f'],
    ['z', 'x', 'c', 'v'],
];

/** Both cases of a key, for useKey(). */
export const bothCases = (k) => (k.toLowerCase() === k.toUpperCase() ? [k] : [k.toLowerCase(), k.toUpperCase()]);
