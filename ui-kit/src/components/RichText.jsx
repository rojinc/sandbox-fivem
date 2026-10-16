import React, { useMemo } from 'react';
import DOMPurify from 'dompurify';
import { Kbd } from './primitives.jsx';

const ALLOWED_TAGS = ['b', 'i', 'u', 's', 'em', 'strong', 'br', 'span', 'p', 'ul', 'ol', 'li', 'kbd', 'code', 'small'];
const ALLOWED_ATTR = ['style', 'class'];

/**
 * Sanitise HTML coming from Lua (notifications, chat, descriptions).
 * Never render untrusted markup without this.
 */
export function sanitizeHtml(html) {
    return DOMPurify.sanitize(String(html ?? ''), { ALLOWED_TAGS, ALLOWED_ATTR });
}

/**
 * Render text that may contain the framework's lightweight markup:
 *   {key}E{/key}            -> a key cap
 *   {keybind}NAME{/keybind} -> resolved on the Lua side before it reaches us
 *   <b>, <i>, <br> ...      -> sanitised inline HTML
 *
 * Plain strings render as-is; nothing here is dangerouslySet without
 * sanitising first.
 */
export function RichText({ text, component: Component = 'span', ...rest }) {
    const parts = useMemo(() => {
        const src = String(text ?? '');
        const out = [];
        const re = /\{key\}(.*?)\{\/key\}/g;
        let last = 0;
        let m;
        while ((m = re.exec(src)) !== null) {
            if (m.index > last) out.push({ html: src.slice(last, m.index) });
            out.push({ key: m[1] });
            last = m.index + m[0].length;
        }
        if (last < src.length) out.push({ html: src.slice(last) });
        return out;
    }, [text]);

    return (
        <Component {...rest}>
            {parts.map((p, i) =>
                p.key !== undefined ? (
                    <Kbd key={i} style={{ margin: '0 4px', verticalAlign: 'middle' }}>
                        {p.key}
                    </Kbd>
                ) : (
                    <span key={i} dangerouslySetInnerHTML={{ __html: sanitizeHtml(p.html) }} />
                ),
            )}
        </Component>
    );
}
