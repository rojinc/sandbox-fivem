/** Copy text in CEF, where navigator.clipboard is often unavailable. */
export function copyText(text) {
    const value = String(text ?? '');
    try {
        const ta = document.createElement('textarea');
        ta.value = value;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(ta);
        if (ok) return true;
    } catch {
        /* fall through */
    }
    try {
        navigator.clipboard?.writeText(value);
        return true;
    } catch {
        return false;
    }
}

/**
 * Split message text into plain parts, links and image links. Nothing is
 * rendered as HTML; links become buttons that copy the address.
 */
export function splitLinks(text) {
    const src = String(text ?? '');
    const out = [];
    const re = /https?:\/\/[^\s<>"']+/gi;
    let last = 0;
    let m;
    while ((m = re.exec(src)) !== null) {
        if (m.index > last) out.push({ text: src.slice(last, m.index) });
        const url = m[0].replace(/[.,!?)]+$/, '');
        const image = /^https:\/\/\S+\.(png|jpe?g|gif|webp)(\?\S*)?$/i.test(url) || /^https:\/\/(i\.)?imgur\.com\/\w+(\.\w{3,4})?$/i.test(url);
        out.push({ url, image });
        last = m.index + url.length;
        re.lastIndex = last;
    }
    if (last < src.length) out.push({ text: src.slice(last) });
    return out;
}
