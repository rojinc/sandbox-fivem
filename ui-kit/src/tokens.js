/**
 * JS mirror of tokens.css. Use these when a value is needed in JavaScript
 * (MUI theme, canvas drawing, inline maths). For styling prefer the CSS
 * variables so every NUI stays in sync from one place.
 */
export const fonts = {
    ui: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    mono: "'JetBrains Mono', ui-monospace, 'Cascadia Mono', Consolas, monospace",
};

export const colors = {
    bg0: '#090b0f',
    bg1: '#0f1218',
    bg2: '#151a22',
    bg3: '#1c222c',
    bg4: '#242b37',

    surface: 'rgba(15, 18, 24, 0.78)',
    surfaceStrong: 'rgba(15, 18, 24, 0.92)',
    surfaceSoft: 'rgba(255, 255, 255, 0.045)',
    surfaceHover: 'rgba(255, 255, 255, 0.07)',
    surfaceActive: 'rgba(255, 255, 255, 0.11)',

    border: 'rgba(255, 255, 255, 0.08)',
    borderStrong: 'rgba(255, 255, 255, 0.16)',
    borderAccent: 'rgba(245, 184, 46, 0.45)',

    text: '#f2f4f7',
    text2: '#aab2bf',
    text3: '#6f7886',
    textDisabled: '#4a515d',
    textInverse: '#0b0d12',

    accent: '#f5b82e',
    accentStrong: '#e5a502',
    accentSoft: 'rgba(245, 184, 46, 0.14)',
    success: '#3ddc84',
    successSoft: 'rgba(61, 220, 132, 0.14)',
    warning: '#f6a623',
    warningSoft: 'rgba(246, 166, 35, 0.14)',
    danger: '#f0475a',
    dangerSoft: 'rgba(240, 71, 90, 0.14)',
    info: '#4f9cff',
    infoSoft: 'rgba(79, 156, 255, 0.14)',
};

export const radius = {
    xs: 4,
    sm: 6,
    md: 10,
    lg: 14,
    xl: 20,
    pill: 999,
};

export const space = (n) => n * 4;

export const shadow = {
    1: '0 2px 8px rgba(0, 0, 0, 0.35)',
    2: '0 10px 30px rgba(0, 0, 0, 0.45)',
    3: '0 24px 60px rgba(0, 0, 0, 0.55)',
};

export const motion = {
    ease: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
    easeOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
    fast: 120,
    normal: 200,
    slow: 320,
};

export const blur = 18;
export const textShadow = '0 1px 2px rgba(0, 0, 0, 0.65)';

/** Semantic colour for a notification / status kind. */
export function semanticColor(kind) {
    switch (kind) {
        case 'success':
            return colors.success;
        case 'warning':
            return colors.warning;
        case 'error':
        case 'danger':
            return colors.danger;
        case 'info':
            return colors.info;
        default:
            return colors.accent;
    }
}

/** Soft (translucent) companion of semanticColor. */
export function semanticSoft(kind) {
    switch (kind) {
        case 'success':
            return colors.successSoft;
        case 'warning':
            return colors.warningSoft;
        case 'error':
        case 'danger':
            return colors.dangerSoft;
        case 'info':
            return colors.infoSoft;
        default:
            return colors.accentSoft;
    }
}

export default { fonts, colors, radius, space, shadow, motion, blur, textShadow };
