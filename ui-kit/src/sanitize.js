import DOMPurify from 'dompurify';

const ALLOWED_TAGS = ['b', 'i', 'u', 's', 'em', 'strong', 'br', 'span', 'p', 'ul', 'ol', 'li', 'kbd', 'code', 'small', 'mark'];
const ALLOWED_ATTR = ['style', 'class'];

/**
 * Sanitise HTML coming from Lua (notifications, chat, descriptions).
 * Never render untrusted markup without this.
 *
 * @param {string} html
 * @param {{ allowedTags?: string[], allowedAttr?: string[] }} [options] extend the inline-only defaults
 */
export function sanitizeHtml(html, { allowedTags = [], allowedAttr = [] } = {}) {
    return DOMPurify.sanitize(String(html ?? ''), {
        ALLOWED_TAGS: [...ALLOWED_TAGS, ...allowedTags],
        ALLOWED_ATTR: [...ALLOWED_ATTR, ...allowedAttr],
    });
}

/** Strip every tag; for places that must stay plain text (titles, labels). */
export function plainText(html) {
    return DOMPurify.sanitize(String(html ?? ''), { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
}
