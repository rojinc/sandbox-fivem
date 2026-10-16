import { sanitizeHtml } from '@sandbox/ui-kit/sanitize';

/**
 * Chat bodies and templates are HTML written in Lua. On top of the kit's
 * inline allowlist the stock cfx templates need <div>, <pre> (the "print"
 * template) and <img src> for pictures a script may post. Everything that is
 * rendered with {@html} goes through this first.
 */
const CHAT_PROFILE = {
    allowedTags: ['div', 'pre', 'img', 'span', 'b', 'i', 'u', 'strong', 'em', 'br'],
    allowedAttr: ['style', 'class', 'src'],
};

export function chatHtml(html) {
    return sanitizeHtml(html, CHAT_PROFILE);
}

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** Escape a plain-text argument before it is dropped into a template. */
export function escapeHtml(text) {
    return String(text ?? '').replace(/[&<>"']/g, (c) => ESCAPES[c]);
}

/** True when a string contains something that looks like an HTML tag. */
export function looksLikeHtml(text) {
    return /<\/?[a-z][^>]*>/i.test(String(text ?? ''));
}
