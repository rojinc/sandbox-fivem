import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { AppRoot, NuiBridge, debugData, isEnvBrowser } from '@sandbox/ui-kit';
import store from './store.js';
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

// Browser development: `npm run dev` then open /?game=keypad to replay ui/preview/keypad.json.
if (isEnvBrowser()) {
    const name = new URLSearchParams(window.location.search).get('game');
    if (name && /^[a-z0-9-]+$/i.test(name)) {
        fetch(`/preview/${name}.json`)
            .then((r) => r.json())
            .then((scenario) => debugData(scenario.messages ?? [], 300))
            .catch(() => {});
    }
}
