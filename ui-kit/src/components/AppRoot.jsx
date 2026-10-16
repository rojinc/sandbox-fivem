import React, { useEffect, useMemo } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { createSandboxTheme } from '../theme.js';
import { isEnvBrowser } from '../nui/index.js';
import '../icons.jsx'; // registers the icon library at load time
import '../fonts.js';
import '../tokens.css';

/**
 * Wrap every NUI's tree in this once. It provides the theme, the CSS
 * baseline, the fonts and the icon library, and adds `nui-dev` to <body>
 * when the page is opened in a normal browser so a fake backdrop shows.
 *
 * @param {object} props
 * @param {string} [props.accent]    per-UI or per-user accent override
 * @param {object} [props.theme]     a fully built MUI theme (overrides accent)
 */
export function AppRoot({ accent, theme, children }) {
    const muiTheme = useMemo(() => theme ?? createSandboxTheme({ accent }), [theme, accent]);

    useEffect(() => {
        if (isEnvBrowser()) document.body.classList.add('nui-dev');
        return () => document.body.classList.remove('nui-dev');
    }, []);

    return (
        <ThemeProvider theme={muiTheme}>
            <CssBaseline />
            {children}
        </ThemeProvider>
    );
}

export default AppRoot;
