import '@sandbox/ui-kit/fonts';
import '@sandbox/ui-kit/base.css';
import './styles.css';
import { mount } from 'svelte';
import { debugData, isEnvBrowser } from '@sandbox/ui-kit/nui';
import { installBridge } from './bridge.js';
import App from './App.svelte';

// Icons are imported as definitions where they are used; Lua never sends icon names to this UI.
installBridge();

// `vite` dev server: open the handset with sample data so it can be designed in a browser.
if (isEnvBrowser()) {
    document.body.classList.add('nui-dev');
    debugData([
        {
            type: 'UPDATE_DATA',
            data: { frequency: 3, frequencyName: 'Emergency #3', power: true, volume: 100, type: 1, typeName: 'Encrypted Radio' },
        },
        { type: 'APP_SHOW' },
    ]);
}

mount(App, { target: document.getElementById('app') });
