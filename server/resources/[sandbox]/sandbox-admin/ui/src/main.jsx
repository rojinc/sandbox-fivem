import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { AppRoot, NuiBridge } from '@sandbox/ui-kit';
import { store } from './store.js';
import App from './App.jsx';

createRoot(document.getElementById('app')).render(
    <React.StrictMode>
        <Provider store={store}>
            <NuiBridge>
                <AppRoot>
                    <App />
                </AppRoot>
            </NuiBridge>
        </Provider>
    </React.StrictMode>,
);
