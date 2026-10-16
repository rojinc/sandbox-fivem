/**
 * Business documents and notices are HTML written in the old CKEditor. They
 * are sanitised with the kit's DOMPurify wrapper (a few block tags added for
 * old documents), then stripped of style and class attributes so pasted
 * markup cannot restyle the laptop.
 */
import { sanitizeHtml, plainText } from '@sandbox/ui-kit';

const EXTRA_TAGS = ['h1', 'h2', 'h3', 'h4', 'blockquote', 'img', 'figure', 'figcaption', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'hr', 'div'];
const EXTRA_ATTR = ['src', 'alt'];

export function cleanHtml(html) {
    const safe = sanitizeHtml(String(html ?? ''), { allowedTags: EXTRA_TAGS, allowedAttr: EXTRA_ATTR });
    if (typeof document === 'undefined') return safe;
    const tpl = document.createElement('template');
    tpl.innerHTML = safe;
    for (const el of tpl.content.querySelectorAll('[style], [class]')) {
        el.removeAttribute('style');
        el.removeAttribute('class');
    }
    for (const img of tpl.content.querySelectorAll('img')) {
        const src = img.getAttribute('src') ?? '';
        if (!/^https:\/\//i.test(src)) img.remove();
    }
    return tpl.innerHTML;
}

/** One line of plain text for a table cell. */
export function summary(html, max = 120) {
    const text = plainText(
        String(html ?? '')
            .replace(/<\/li>\s*<li[^>]*>/gi, '; ')
            .replace(/<(br|\/p|\/li|\/h[1-6])\s*\/?>/gi, ' '),
    )
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/\s+/g, ' ')
        .trim();
    return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

export function isBlank(html) {
    return summary(html, 100000) === '' && !/<img/i.test(String(html ?? ''));
}
