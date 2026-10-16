import { formatDate, formatMoney, timeAgo } from '@sandbox/ui-kit/util';

/**
 * Lua tables that are empty serialise as `{}` instead of `[]`; anything
 * that should be a list goes through here.
 */
export function asArray(value) {
    if (Array.isArray(value)) return value;
    if (value && typeof value === 'object') return Object.values(value);
    return [];
}

const valid = (d) => d instanceof Date && !Number.isNaN(d.getTime());

/** Parse the DOB string Lua stores (ISO 8601) or an epoch number. */
export function parseDob(dob) {
    if (!dob && dob !== 0) return null;
    let d = null;
    if (typeof dob === 'number') d = new Date(dob < 1e11 ? dob * 1000 : dob);
    else if (typeof dob === 'string') d = /^\d+$/.test(dob) ? parseDob(Number(dob)) : new Date(dob);
    return valid(d) ? d : null;
}

/** Whole years between two dates (calendar, like date-fns differenceInYears). */
export function yearsBetween(from, to = new Date()) {
    let years = to.getFullYear() - from.getFullYear();
    const months = to.getMonth() - from.getMonth();
    if (months < 0 || (months === 0 && to.getDate() < from.getDate())) years -= 1;
    return years;
}

export function formatDob(dob) {
    const d = parseDob(dob);
    return d ? d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
}

export function ageFrom(dob, now = new Date()) {
    const d = parseDob(dob);
    return d ? yearsBetween(d, now) : null;
}

/** LastPlayed is ms since epoch, or -1 when the character never played. */
export function lastPlayed(value) {
    const n = Number(value);
    if (!Number.isFinite(n) || n <= 0) return { never: true, relative: 'Never played', absolute: null };
    const ms = n < 1e11 ? n * 1000 : n;
    if (!valid(new Date(ms))) return { never: true, relative: 'Never played', absolute: null };
    return { never: false, relative: timeAgo(ms), absolute: formatDate(ms) };
}

/**
 * Jobs: [{ Id, Name, Workplace: false | { Id, Name }, Grade?: { Id, Name, Level } }]
 * Returns the first job as "Grade · Workplace" plus how many more there are.
 */
export function jobSummary(jobs) {
    const list = asArray(jobs).filter((j) => j && typeof j === 'object');
    if (!list.length) return { label: 'Unemployed', detail: null, extra: 0, employed: false };
    const j = list[0];
    const place = j.Workplace && j.Workplace.Name ? j.Workplace.Name : (j.Name ?? 'Employed');
    const grade = j.Grade && j.Grade.Name ? j.Grade.Name : null;
    return { label: grade ?? place, detail: grade ? place : null, extra: list.length - 1, employed: true };
}

/** Every job as one line: "Sergeant, Los Santos Police Department". */
export function jobLines(jobs) {
    return asArray(jobs)
        .filter((j) => j && typeof j === 'object')
        .map((j) => {
            const place = j.Workplace && j.Workplace.Name ? j.Workplace.Name : (j.Name ?? 'Employed');
            const grade = j.Grade && j.Grade.Name ? j.Grade.Name : null;
            return grade ? `${grade}, ${place}` : place;
        });
}

export function fullName(c) {
    return [c?.First, c?.Last].filter(Boolean).join(' ') || 'Unnamed';
}

export function genderLabel(g) {
    const n = Number(g);
    if (n === 0) return 'Male';
    if (n === 1) return 'Female';
    return 'Unknown';
}

export function formatSid(sid) {
    return sid === undefined || sid === null || sid === '' ? '—' : `#${sid}`;
}

/** Cash is only on documents that carry it (the create response, and the list once Lua sends it). */
export function formatCash(cash) {
    return typeof cash === 'number' && Number.isFinite(cash) ? formatMoney(cash) : '—';
}

/**
 * What kind of place a spawn is, from the id / event the providing resource
 * sets (sandbox-apartments, sandbox-properties, sandbox-jobs, this resource).
 */
export function spawnKind(spawn) {
    const id = String(spawn?.id ?? '');
    const event = spawn?.event ?? '';
    if (id === 'LastLocation') return 'Last location';
    if (event === 'Jail:SpawnJailed') return 'Prison';
    if (event === 'Hospital:SpawnICU') return 'Hospital';
    if (event === 'Apartment:SpawnInside' || id.startsWith('APT:')) return 'Apartment';
    if (event === 'Properties:SpawnInside') return 'Property';
    if (id.startsWith('JobSpawn:')) return 'Work';
    if (/creation/i.test(spawn?.label ?? '')) return 'New character';
    return 'Public';
}

/** A one-line description for the special spawns Lua hands out. */
export function spawnHint(spawn) {
    if (spawn?.id === 'LastLocation') return 'Where you logged out';
    if (spawn?.event === 'Jail:SpawnJailed') return 'You are serving a sentence';
    if (spawn?.event === 'Hospital:SpawnICU') return 'You are in intensive care';
    if (/creation/i.test(spawn?.label ?? '')) return 'Design your appearance first';
    return null;
}

const text = (v) => (typeof v === 'string' || typeof v === 'number' ? String(v).trim() : '');

/**
 * The changelog document has no defined shape (see CONTRACT.md), so the
 * usual field names are tried and nothing renders when none match.
 * Returns { title, date, items } or null.
 */
export function changelogView(c) {
    if (!c || typeof c !== 'object' || Array.isArray(c)) return null;
    const title = text(c.title ?? c.Title ?? c.name ?? c.Name ?? c.version ?? c.Version) || "What's new";
    const rawDate = c.date ?? c.Date ?? c.time ?? c.Time ?? c.createdAt;
    const d = typeof rawDate === 'number' || typeof rawDate === 'string' ? parseDob(rawDate) : null;
    const date = d ? d.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' }) : null;
    const raw = c.changes ?? c.Changes ?? c.content ?? c.Content ?? c.body ?? c.Body ?? c.description ?? c.Description ?? c.text ?? c.message ?? c.notes ?? c.Notes;
    const items = asArray(typeof raw === 'string' ? [raw] : raw)
        .map((x) => (typeof x === 'string' ? x : x && typeof x === 'object' ? text(x.text ?? x.message ?? x.title ?? x.label ?? x.description) : ''))
        .map((s) => s.trim())
        .filter(Boolean);
    if (!items.length) return null;
    return { title, date, items };
}
