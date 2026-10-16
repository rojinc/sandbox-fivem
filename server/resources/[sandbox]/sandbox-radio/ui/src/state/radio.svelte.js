/**
 * Handset state. The "from Lua" block mirrors the UPDATE_DATA payload sent by
 * SendUpdates() in client/main.lua; the rest is local bookkeeping around the
 * SetChannel round trip (Lua answers every request with UPDATE_DATA, accepted
 * or refused, but stays silent when the requested channel equals the current one).
 */
export const TUNE_TIMEOUT = 1500; // ms before a request that got no answer is dropped
export const NOTICE_TIMEOUT = 2200; // ms the Tuned / Refused tag stays up

export const radio = $state({
    open: false,

    // from Lua
    power: false,
    volume: 100, // 0–200, step 10
    frequency: 0, // 0 = no channel, one decimal
    frequencyName: '', // "" unless a named job channel
    type: 0, // 1 Encrypted, 2 B0085, 3 P6900, 0 = no radio
    typeName: 'Radio',
    maskRadio: false, // HUDConfig.maskRadio: hide the channel from stream viewers

    // local
    pending: null, // frequency sent with SetChannel, awaiting UPDATE_DATA
    notice: null, // { kind: 'tuned' | 'refused', frequency }
});

const num = (value, fallback) => {
    if (value === undefined || value === null) return fallback;
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
};

export function setOpen(open) {
    radio.open = Boolean(open);
    if (!radio.open) {
        radio.pending = null;
        radio.notice = null;
    }
}

let noticeSeq = 0;
function setNotice(notice) {
    const seq = ++noticeSeq;
    radio.notice = notice;
    if (!notice) return;
    setTimeout(() => {
        if (noticeSeq === seq) radio.notice = null;
    }, NOTICE_TIMEOUT);
}

/** UPDATE_DATA: every field is optional (the logout payload omits type/typeName). */
export function applyUpdate(p = {}) {
    const frequency = num(p.frequency, radio.frequency);
    radio.frequency = frequency;
    if (typeof p.frequencyName === 'string') radio.frequencyName = p.frequencyName;
    if (typeof p.power === 'boolean') radio.power = p.power;
    radio.volume = num(p.volume, radio.volume);
    if (p.type !== undefined && p.type !== null) radio.type = p.type === false ? 0 : num(p.type, 0);
    if (typeof p.typeName === 'string' && p.typeName) radio.typeName = p.typeName;
    if (typeof p.maskRadio === 'boolean') radio.maskRadio = p.maskRadio;

    if (radio.pending !== null) {
        const wanted = radio.pending;
        radio.pending = null;
        setNotice(Math.abs(frequency - wanted) < 0.05 ? { kind: 'tuned', frequency } : { kind: 'refused', frequency: wanted });
    }
}

/** Mark a SetChannel request as in flight; dropped after TUNE_TIMEOUT if Lua never answers. */
export function tuneRequested(frequency) {
    radio.pending = frequency;
    setNotice(null);
    setTimeout(() => {
        if (radio.pending === frequency) radio.pending = null;
    }, TUNE_TIMEOUT);
}
