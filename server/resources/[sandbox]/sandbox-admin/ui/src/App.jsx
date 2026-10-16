import React from 'react';
import { useSelector } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import Fade from '@mui/material/Fade';
import Box from '@mui/material/Box';
import { ToastProvider } from './components/common/Toasts.jsx';
import ClipboardBridge from './components/shell/ClipboardBridge.jsx';
import PreviewRouteListener from './components/shell/PreviewRouteListener.jsx';
import EscapeToClose from './components/shell/EscapeToClose.jsx';
import Shell from './components/shell/Shell.jsx';
import { selectVisible } from './features/app/reducer.js';

/**
 * The console is only mounted while Lua has it open (APP_SHOW / APP_HIDE).
 * Unmounting on hide means every page re-fetches fresh data when the menu is
 * reopened; the in-memory router keeps the last route between openings.
 */
export default function App() {
    const visible = useSelector(selectVisible);

    return (
        <MemoryRouter>
            <ToastProvider>
                <ClipboardBridge />
                <PreviewRouteListener />
                <EscapeToClose enabled={visible} />
                <Fade in={visible} timeout={{ enter: 200, exit: 160 }} mountOnEnter unmountOnExit>
                    <Box sx={{ position: 'fixed', inset: 0 }}>
                        <Shell />
                    </Box>
                </Fade>
            </ToastProvider>
        </MemoryRouter>
    );
}
