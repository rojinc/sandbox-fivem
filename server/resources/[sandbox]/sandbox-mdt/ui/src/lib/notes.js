/**
 * Report and notice bodies are stored as HTML (the old terminal used a rich
 * editor). The new terminal edits plain text and stores it back as escaped
 * paragraphs, so old and new notes render the same way through RichText.
 */
export function htmlToText(html) {
    if (!html) return '';
    const withBreaks = String(html)
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/(p|div|li|h[1-6])>/gi, '\n')
        .replace(/<li[^>]*>/gi, '- ');
    const doc = new DOMParser().parseFromString(withBreaks, 'text/html');
    return (doc.body.textContent ?? '').replace(/\n{3,}/g, '\n\n').trim();
}

const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function textToHtml(text) {
    return String(text ?? '')
        .trim()
        .split(/\n{2,}/)
        .filter(Boolean)
        .map((para) => `<p>${escape(para).replace(/\n/g, '<br>')}</p>`)
        .join('');
}
