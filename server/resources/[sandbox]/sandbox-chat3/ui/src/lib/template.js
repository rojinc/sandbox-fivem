import { colorize } from './colorize.js';
import { escapeHtml } from './html.js';

/** Templates every cfx-compatible chat ships with; ON_TEMPLATE_ADD extends (or overrides) them. */
export const DEFAULT_TEMPLATES = {
    default: '<b>{0}</b>: {1}',
    defaultAlt: '{0}',
    print: '<pre>{0}</pre>',
};

/** True for the standard cfx message shape ({ args, templateId, color, ... }). */
export function isCfxMessage(message) {
    return Boolean(message) && Array.isArray(message.args);
}

/**
 * Render a cfx-style message to (unsanitised) HTML: arguments are escaped,
 * dropped into the template, then colour codes become styled spans.
 */
export function renderCfxMessage(message, templates = DEFAULT_TEMPLATES) {
    const args = (message.args ?? []).map((a) => escapeHtml(a));
    let template = message.template;
    if (typeof template !== 'string' && message.templateId !== undefined) template = templates?.[message.templateId];
    if (typeof template !== 'string') {
        const id = args.length === 1 ? 'defaultAlt' : 'default';
        template = typeof templates?.[id] === 'string' ? templates[id] : DEFAULT_TEMPLATES[id];
    }
    const html = template.replace(/\{(\d+)\}/g, (match, i) => (args[i] !== undefined ? args[i] : ''));
    return colorize(html);
}

/** Accepts [r,g,b], {r,g,b} or a Lua table encoded as {"1":r,"2":g,"3":b}. */
export function rgbString(color) {
    if (!color) return null;
    let r;
    let g;
    let b;
    if (Array.isArray(color)) [r, g, b] = color;
    else if (typeof color === 'object') {
        r = color.r ?? color[1];
        g = color.g ?? color[2];
        b = color.b ?? color[3];
    }
    if ([r, g, b].some((v) => typeof v !== 'number')) return null;
    return `rgb(${r}, ${g}, ${b})`;
}
