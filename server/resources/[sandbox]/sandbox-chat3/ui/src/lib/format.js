const pad = (n) => String(n).padStart(2, '0');

/** HH:MM for the timestamp column: the moment the line reached this client. */
export function formatTime(ms) {
    const d = new Date(ms);
    if (Number.isNaN(d.getTime())) return '';
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
