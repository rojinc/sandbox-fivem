/** Seconds left for the title-row countdown: "7.4" under a minute, "1:05" above. */
export function formatLeft(ms) {
    const v = Math.max(0, Number(ms) || 0);
    if (v >= 60000) {
        const s = Math.ceil(v / 1000);
        return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
    }
    return (Math.floor(v / 100) / 10).toFixed(1);
}
