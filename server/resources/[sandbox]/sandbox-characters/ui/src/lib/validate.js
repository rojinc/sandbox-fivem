import { yearsBetween } from './format.js';

export const MIN_AGE = 18;
export const MAX_AGE = 100;
export const NAME_MIN = 2;
export const NAME_MAX = 24;
export const BIO_MAX = 500;

/** Letters (incl. accented), apostrophes and hyphens. The old UI stripped spaces as you typed. */
const NAME_RE = /^[A-Za-zÀ-ɏ][A-Za-zÀ-ɏ'’-]*$/;

export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function yearOptions(now = new Date()) {
    const newest = now.getFullYear() - MIN_AGE;
    const oldest = now.getFullYear() - MAX_AGE;
    const out = [];
    for (let y = newest; y >= oldest; y -= 1) out.push(y);
    return out;
}

export function daysInMonth(year, month) {
    return new Date(Number(year), Number(month) + 1, 0).getDate();
}

export function dayOptions(year, month) {
    const days = year !== '' && month !== '' ? daysInMonth(year, month) : 31;
    return Array.from({ length: days }, (_, i) => i + 1);
}

/** Remove whitespace the way the previous UI did on every keystroke. */
export function cleanName(value) {
    return String(value ?? '')
        .replace(/\s+/g, '')
        .slice(0, NAME_MAX);
}

/**
 * The DOB string stored in the database: the chosen calendar day at 12:00
 * UTC so it renders as the same date in every timezone and still matches
 * the `YYYY-MM-DDTHH:MM:SS` pattern other resources parse.
 */
export function buildDobIso(year, month, day) {
    return new Date(Date.UTC(Number(year), Number(month), Number(day), 12, 0, 0)).toISOString();
}

export function validateName(value, label) {
    const v = String(value ?? '');
    if (!v) return `${label} is required.`;
    if (v.length < NAME_MIN) return `${label} must be at least ${NAME_MIN} letters.`;
    if (v.length > NAME_MAX) return `${label} must be ${NAME_MAX} characters or fewer.`;
    if (!NAME_RE.test(v)) return `${label} can only contain letters, apostrophes and hyphens.`;
    return null;
}

export function validateDob({ year, month, day }, now = new Date()) {
    if (year === '' || month === '' || day === '') return 'Pick a day, month and year.';
    const d = new Date(Number(year), Number(month), Number(day));
    if (Number.isNaN(d.getTime()) || d.getDate() !== Number(day)) return 'That day does not exist in the chosen month.';
    const age = yearsBetween(d, now);
    if (age < MIN_AGE) return `Characters must be at least ${MIN_AGE} years old.`;
    if (age > MAX_AGE) return `Characters cannot be older than ${MAX_AGE}.`;
    return null;
}

export function validateBio(value) {
    const v = String(value ?? '').trim();
    if (!v) return 'Write a short biography.';
    if (v.length > BIO_MAX) return `Keep the biography under ${BIO_MAX} characters.`;
    return null;
}

/** Returns `{ field: message }` for every invalid field (empty when valid). */
export function validateForm(values, now = new Date()) {
    const errors = {};
    const first = validateName(values.first, 'First name');
    const last = validateName(values.last, 'Last name');
    const dob = validateDob(values.dob, now);
    const bio = validateBio(values.bio);
    if (first) errors.first = first;
    if (last) errors.last = last;
    if (dob) errors.dob = dob;
    if (bio) errors.bio = bio;
    if (values.gender !== 0 && values.gender !== 1) errors.gender = 'Choose a gender.';
    return errors;
}
