import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { AppRoot, NuiBridge, isEnvBrowser, debugData } from '@sandbox/ui-kit';
import { store } from './store.js';
import App from './App.jsx';

createRoot(document.getElementById('app')).render(
    <Provider store={store}>
        <NuiBridge>
            <AppRoot>
                <App />
            </AppRoot>
        </NuiBridge>
    </Provider>,
);

// In a plain browser (npm run dev) replay a preview scenario so the HUD has something to show.
if (isEnvBrowser()) {
    import('../preview/hud-default.json').then((m) => debugData(m.default.messages, 100));
}
