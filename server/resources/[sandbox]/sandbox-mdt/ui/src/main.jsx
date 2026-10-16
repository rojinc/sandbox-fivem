import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { NuiBridge } from '@sandbox/ui-kit';
import { store } from './store.js';
import { bindAlertsStore } from './features/alerts/socket.js';
import App from './App.jsx';

bindAlertsStore(store);

createRoot(document.getElementById('app')).render(
    <Provider store={store}>
        <NuiBridge>
            <App />
        </NuiBridge>
    </Provider>,
);
