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
 * dropped into the template, then colour codes become styled spans. A
 * `color` tints the first argument (the author), as the stock cfx chat does.
 */
export function renderCfxMessage(message, templates = DEFAULT_TEMPLATES) {
    const args = (message.args ?? []).map((a) => escapeHtml(a));
    const tint = readableRgb(message.color);
    if (tint && args.length > 0) args[0] = `<span style="color:${tint}">${args[0]}</span>`;
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

/** Relative luminance of an sRGB colour (0..1). */
function luminance([r, g, b]) {
    const lin = (v) => {
        const c = v / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/**
 * A script's `color` as a CSS colour that stays legible on the dark log: dark
 * colours are mixed towards white until they reach about 4.5:1 on #181a1d.
 */
export function readableRgb(color) {
    const css = rgbString(color);
    if (!css) return null;
    let rgb = css.match(/\d+/g).map((v) => Math.min(255, Math.max(0, Number(v))));
    for (let i = 0; i < 10 && luminance(rgb) < 0.22; i += 1) rgb = rgb.map((v) => Math.round(v + (255 - v) * 0.2));
    return `rgb(${rgb.join(', ')})`;
}
