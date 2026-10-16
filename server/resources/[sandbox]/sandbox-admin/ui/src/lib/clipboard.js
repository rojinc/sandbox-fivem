/** Clipboard copy that works inside FiveM's CEF (execCommand), with the async API as a fallback. */
export function copyToClipboard(value) {
    const text = String(value ?? '');
    try {
        const node = document.createElement('textarea');
        node.value = text;
        node.setAttribute('readonly', '');
        node.style.position = 'fixed';
        node.style.top = '0';
        node.style.opacity = '0';
        document.body.appendChild(node);
        node.select();
        node.setSelectionRange(0, text.length);
        const ok = document.execCommand('copy');
        document.body.removeChild(node);
        if (ok) return true;
    } catch {
        /* fall through */
    }
    if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text).catch(() => {});
        return true;
    }
    return false;
}
