import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { AppRoot, NuiBridge, debugData, isEnvBrowser } from '@sandbox/ui-kit';
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

// Browser development only (vite dev): replay a preview scenario so the UI has data.
if (import.meta.env.DEV && isEnvBrowser()) {
    import('../preview/creator.json').then((m) => debugData(m.default.messages ?? [], 200));
}
