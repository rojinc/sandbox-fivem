/** Plain text <-> the simple HTML the old rich-text editors saved (paragraphs and line breaks). */
import { plain } from './format.js';

export function htmlToText(html) {
    return plain(
        String(html ?? '')
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<\/(p|div|li|h\d)>/gi, '\n')
            .replace(/<li[^>]*>/gi, '- '),
    )
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function textToHtml(text) {
    return String(text ?? '')
        .trim()
        .split(/\n{2,}/)
        .map((p) => `<p>${esc(p).replace(/\n/g, '<br>')}</p>`)
        .join('');
}
