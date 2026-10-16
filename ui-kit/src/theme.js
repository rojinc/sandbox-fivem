import { createTheme, alpha } from '@mui/material/styles';
import { colors, fonts, radius, shadow, motion } from './tokens.js';

/**
 * Build the MUI theme every NUI uses.
 *
 * @param {object} [options]
 * @param {string} [options.accent]  override the brand accent (e.g. a per-user colour)
 * @param {object} [options.overrides] extra createTheme() options merged last
 */
export function createSandboxTheme({ accent = colors.accent, overrides = {} } = {}) {
    const base = createTheme({
        palette: {
            mode: 'dark',
            primary: {
                main: accent,
                light: alpha(accent, 0.85),
                dark: colors.accentStrong,
                contrastText: colors.textInverse,
            },
            secondary: {
                main: colors.bg3,
                light: colors.bg4,
                dark: colors.bg2,
                contrastText: colors.text,
            },
            success: { main: colors.success, contrastText: colors.textInverse },
            warning: { main: colors.warning, contrastText: colors.textInverse },
            error: { main: colors.danger, contrastText: '#ffffff' },
            info: { main: colors.info, contrastText: '#ffffff' },
            background: {
                default: 'transparent',
                paper: colors.bg2,
            },
            text: {
                primary: colors.text,
                secondary: colors.text2,
                disabled: colors.textDisabled,
                // legacy aliases kept so ported code keeps compiling
                main: colors.text,
                alt: colors.text2,
                info: colors.text3,
                light: colors.text,
                dark: colors.textInverse,
            },
            divider: colors.border,
            border: {
                main: colors.border,
                strong: colors.borderStrong,
                divider: colors.border,
                input: colors.borderStrong,
                light: colors.borderStrong,
                dark: colors.bg1,
            },
            surface: {
                main: colors.surface,
                strong: colors.surfaceStrong,
                soft: colors.surfaceSoft,
                hover: colors.surfaceHover,
                active: colors.surfaceActive,
            },
        },
        shape: { borderRadius: radius.md },
        typography: {
            fontFamily: fonts.ui,
            fontSize: 14,
            htmlFontSize: 16,
            fontWeightLight: 400,
            fontWeightRegular: 400,
            fontWeightMedium: 500,
            fontWeightBold: 600,
            h1: { fontSize: 34, fontWeight: 700, letterSpacing: -0.5, lineHeight: 1.15 },
            h2: { fontSize: 26, fontWeight: 700, letterSpacing: -0.4, lineHeight: 1.2 },
            h3: { fontSize: 20, fontWeight: 600, letterSpacing: -0.2, lineHeight: 1.25 },
            h4: { fontSize: 16, fontWeight: 600, lineHeight: 1.3 },
            h5: { fontSize: 14, fontWeight: 600, lineHeight: 1.35 },
            h6: { fontSize: 12, fontWeight: 600, letterSpacing: 0.6, textTransform: 'uppercase', lineHeight: 1.4 },
            subtitle1: { fontSize: 14, fontWeight: 500, color: colors.text2 },
            subtitle2: { fontSize: 12, fontWeight: 500, color: colors.text2 },
            body1: { fontSize: 14 },
            body2: { fontSize: 12.5 },
            caption: { fontSize: 11.5, color: colors.text3 },
            overline: { fontSize: 11, fontWeight: 600, letterSpacing: 0.8, textTransform: 'uppercase' },
            button: { fontSize: 13, fontWeight: 600, textTransform: 'none', letterSpacing: 0 },
            mono: { fontFamily: fonts.mono, fontVariantNumeric: 'tabular-nums' },
        },
        transitions: {
            easing: { easeInOut: motion.ease, easeOut: motion.easeOut, easeIn: motion.ease, sharp: motion.ease },
            duration: {
                shortest: motion.fast,
                shorter: motion.fast,
                short: motion.normal,
                standard: motion.normal,
                complex: motion.slow,
                enteringScreen: motion.slow,
                leavingScreen: motion.normal,
            },
        },
        zIndex: { tooltip: 2000, snackbar: 1900, modal: 1500, drawer: 1300 },
    });

    const glassPaper = {
        backgroundImage: 'none',
        backgroundColor: colors.surface,
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        border: `1px solid ${colors.border}`,
        boxShadow: shadow[2],
    };

    return createTheme(base, {
        components: {
            MuiCssBaseline: {
                styleOverrides: {
                    body: { backgroundColor: 'transparent' },
                },
            },
            MuiPaper: {
                defaultProps: { elevation: 0 },
                styleOverrides: {
                    root: { backgroundImage: 'none', borderRadius: radius.lg },
                },
            },
            MuiButton: {
                defaultProps: { disableElevation: true, disableRipple: false },
                styleOverrides: {
                    root: {
                        borderRadius: radius.sm,
                        minHeight: 34,
                        padding: '6px 14px',
                        fontWeight: 600,
                        transition: `all ${motion.fast}ms ${motion.ease}`,
                    },
                    sizeSmall: { minHeight: 28, padding: '4px 10px', fontSize: 12 },
                    sizeLarge: { minHeight: 42, padding: '10px 20px', fontSize: 14 },
                    containedPrimary: {
                        color: colors.textInverse,
                        '&:hover': { backgroundColor: colors.accentStrong },
                    },
                    outlined: {
                        borderColor: colors.borderStrong,
                        color: colors.text,
                        '&:hover': { borderColor: colors.borderStrong, backgroundColor: colors.surfaceHover },
                    },
                    text: {
                        color: colors.text2,
                        '&:hover': { backgroundColor: colors.surfaceHover, color: colors.text },
                    },
                },
            },
            MuiIconButton: {
                styleOverrides: {
                    root: {
                        borderRadius: radius.sm,
                        color: colors.text2,
                        transition: `all ${motion.fast}ms ${motion.ease}`,
                        '&:hover': { backgroundColor: colors.surfaceHover, color: colors.text },
                    },
                },
            },
            MuiOutlinedInput: {
                styleOverrides: {
                    root: {
                        borderRadius: radius.sm,
                        backgroundColor: colors.surfaceSoft,
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: colors.border },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: colors.borderStrong },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: accent,
                            borderWidth: 1,
                        },
                    },
                    input: { padding: '10px 12px' },
                    inputSizeSmall: { padding: '7px 10px' },
                },
            },
            MuiFilledInput: {
                styleOverrides: {
                    root: {
                        borderRadius: radius.sm,
                        backgroundColor: colors.surfaceSoft,
                        '&:hover': { backgroundColor: colors.surfaceHover },
                        '&.Mui-focused': { backgroundColor: colors.surfaceHover },
                        '&::before, &::after': { display: 'none' },
                    },
                },
            },
            MuiInputLabel: {
                styleOverrides: { root: { color: colors.text3, fontSize: 13 } },
            },
            MuiFormHelperText: {
                styleOverrides: { root: { marginLeft: 2, fontSize: 11.5 } },
            },
            MuiSelect: {
                styleOverrides: { icon: { color: colors.text3 } },
            },
            MuiMenu: {
                styleOverrides: { paper: { ...glassPaper, borderRadius: radius.md, marginTop: 4 } },
            },
            MuiMenuItem: {
                styleOverrides: {
                    root: {
                        borderRadius: radius.xs,
                        margin: '2px 6px',
                        padding: '7px 10px',
                        fontSize: 13,
                        '&:hover': { backgroundColor: colors.surfaceHover },
                        '&.Mui-selected': { backgroundColor: colors.accentSoft },
                        '&.Mui-selected:hover': { backgroundColor: colors.accentSoft },
                    },
                },
            },
            MuiListItemButton: {
                styleOverrides: {
                    root: {
                        borderRadius: radius.sm,
                        '&:hover': { backgroundColor: colors.surfaceHover },
                        '&.Mui-selected': { backgroundColor: colors.accentSoft },
                        '&.Mui-selected:hover': { backgroundColor: colors.accentSoft },
                    },
                },
            },
            MuiListSubheader: {
                styleOverrides: {
                    root: {
                        backgroundColor: 'transparent',
                        color: colors.text3,
                        fontSize: 11,
                        fontWeight: 600,
                        letterSpacing: 0.8,
                        textTransform: 'uppercase',
                        lineHeight: '32px',
                    },
                },
            },
            MuiDivider: {
                styleOverrides: { root: { borderColor: colors.border } },
            },
            MuiDialog: {
                styleOverrides: {
                    paper: { ...glassPaper, backgroundColor: colors.surfaceStrong, borderRadius: radius.lg },
                },
            },
            MuiDialogTitle: {
                styleOverrides: {
                    root: { fontSize: 16, fontWeight: 600, letterSpacing: 0, textTransform: 'none', padding: '18px 20px 8px' },
                },
            },
            MuiDialogContent: {
                styleOverrides: { root: { padding: '8px 20px 16px' } },
            },
            MuiDialogActions: {
                styleOverrides: { root: { padding: '8px 20px 18px', gap: 8 } },
            },
            MuiBackdrop: {
                styleOverrides: {
                    root: { backgroundColor: 'rgba(5, 7, 10, 0.55)' },
                    invisible: { backgroundColor: 'transparent' },
                },
            },
            MuiTooltip: {
                defaultProps: { arrow: true, enterDelay: 250 },
                styleOverrides: {
                    tooltip: {
                        ...glassPaper,
                        backgroundColor: colors.surfaceStrong,
                        borderRadius: radius.sm,
                        fontSize: 12,
                        padding: '6px 10px',
                        color: colors.text,
                    },
                    arrow: { color: colors.surfaceStrong },
                },
            },
            MuiTabs: {
                styleOverrides: {
                    root: { minHeight: 38 },
                    indicator: { height: 2, borderRadius: 2, backgroundColor: accent },
                },
            },
            MuiTab: {
                styleOverrides: {
                    root: {
                        minHeight: 38,
                        padding: '8px 14px',
                        fontSize: 13,
                        fontWeight: 600,
                        textTransform: 'none',
                        color: colors.text2,
                        '&.Mui-selected': { color: colors.text },
                    },
                },
            },
            MuiChip: {
                styleOverrides: {
                    root: {
                        borderRadius: radius.sm,
                        fontWeight: 500,
                        fontSize: 12,
                        backgroundColor: colors.surfaceSoft,
                        border: `1px solid ${colors.border}`,
                    },
                    sizeSmall: { height: 22, fontSize: 11 },
                },
            },
            MuiLinearProgress: {
                styleOverrides: {
                    root: {
                        height: 6,
                        borderRadius: radius.pill,
                        backgroundColor: 'rgba(255, 255, 255, 0.12)',
                    },
                    bar: { borderRadius: radius.pill },
                },
            },
            MuiSwitch: {
                styleOverrides: {
                    root: { padding: 8 },
                    track: { borderRadius: 11, backgroundColor: colors.bg4, opacity: 1 },
                    thumb: { boxShadow: 'none' },
                },
            },
            MuiSlider: {
                styleOverrides: {
                    root: { height: 4 },
                    thumb: { width: 14, height: 14, boxShadow: 'none' },
                    rail: { opacity: 0.25 },
                },
            },
            MuiTableCell: {
                styleOverrides: {
                    root: { borderBottom: `1px solid ${colors.border}`, padding: '10px 12px', fontSize: 13 },
                    head: { color: colors.text3, fontSize: 11, fontWeight: 600, letterSpacing: 0.6, textTransform: 'uppercase' },
                },
            },
            MuiAlert: {
                styleOverrides: {
                    root: { borderRadius: radius.md, border: `1px solid ${colors.border}` },
                },
            },
            MuiSkeleton: {
                styleOverrides: { root: { backgroundColor: colors.surfaceSoft } },
            },
            MuiPopover: {
                styleOverrides: { paper: { ...glassPaper, borderRadius: radius.md } },
            },
            MuiAutocomplete: {
                styleOverrides: { paper: { ...glassPaper, borderRadius: radius.md } },
            },
        },
        ...overrides,
    });
}

export default createSandboxTheme;
