/**
 * GTA / FiveM inline colour codes, as understood by the stock cfx chat:
 *   ^0..^9  colours      ^*  bold      ^_  underline
 *   ^~      strike       ^=  underline + strike      ^r  reset
 * The output is HTML; run it through chatHtml() before rendering. The
 * colours are the stock set lifted enough to read on the navy log panel.
 */
export const CODE_COLORS = {
    0: '#ffffff',
    1: '#ff6b6b',
    2: '#7ddc5a',
    3: '#f5b82e',
    4: '#6aaeff',
    5: '#61daff',
    6: '#c9a0ff',
    7: '#ffffff',
    8: '#ff8a65',
    9: '#ff8fc0',
};

const CODE_RE = /\^([0-9*_~=r])/g;

export function hasColorCodes(text) {
    CODE_RE.lastIndex = 0;
    return CODE_RE.test(String(text ?? ''));
}

export function colorize(html) {
    const src = String(html ?? '');
    if (!hasColorCodes(src)) return src;

    const state = { color: null, bold: false, underline: false, strike: false };
    let out = '';
    let last = 0;
    let open = false;
    let m;

    const openSpan = () => {
        const styles = [];
        if (state.color) styles.push(`color:${state.color}`);
        if (state.bold) styles.push('font-weight:700');
        const deco = [];
        if (state.underline) deco.push('underline');
        if (state.strike) deco.push('line-through');
        if (deco.length) styles.push(`text-decoration:${deco.join(' ')}`);
        if (!styles.length) return '';
        open = true;
        return `<span style="${styles.join(';')}">`;
    };

    CODE_RE.lastIndex = 0;
    while ((m = CODE_RE.exec(src)) !== null) {
        out += src.slice(last, m.index);
        last = m.index + m[0].length;
        if (open) {
            out += '</span>';
            open = false;
        }
        const c = m[1];
        if (c === 'r') {
            state.color = null;
            state.bold = false;
            state.underline = false;
            state.strike = false;
        } else if (c === '*') state.bold = true;
        else if (c === '_') state.underline = true;
        else if (c === '~') state.strike = true;
        else if (c === '=') {
            state.underline = true;
            state.strike = true;
        } else state.color = CODE_COLORS[c] ?? null;
        out += openSpan();
    }
    out += src.slice(last);
    if (open) out += '</span>';
    return out;
}

/** Strip colour codes for places that cannot show them. */
export function stripColorCodes(text) {
    return String(text ?? '').replace(CODE_RE, '');
}
