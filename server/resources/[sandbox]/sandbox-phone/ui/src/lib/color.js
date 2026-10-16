/** Pick a readable glyph colour (ink or near-black) for an app tile colour. */
export function onColor(hex) {
    const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(hex ?? '').trim());
    if (!m) return 'var(--au-text)';
    let h = m[1];
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
    const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
    const L = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
    // Contrast against white (1.05 / (L + 0.05)) vs against #181a1d (L + 0.05) / 0.0598
    return 1.05 / (L + 0.05) >= (L + 0.05) / 0.0598 ? '#ffffff' : 'var(--au-on-ink)';
}

/** A tile colour from the catalogue, or a neutral fallback. */
export function tileColor(hex) {
    return /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.test(String(hex ?? '').trim()) ? (String(hex).startsWith('#') ? hex : `#${hex}`) : 'var(--au-bg-alt-shade)';
}
