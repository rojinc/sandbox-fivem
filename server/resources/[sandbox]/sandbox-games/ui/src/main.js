import '@sandbox/ui-kit/fonts';
import '@sandbox/ui-kit/base.css';
import './styles.css';
import { mount } from 'svelte';
import { debugData, isEnvBrowser } from '@sandbox/ui-kit/nui';
import { installBridge } from './bridge.js';
import App from './App.svelte';

installBridge();

mount(App, { target: document.getElementById('app') });

// Browser development: run vite, then open /?game=keypad to replay ui/preview/keypad.json.
if (isEnvBrowser()) {
    const name = new URLSearchParams(window.location.search).get('game');
    if (name && /^[a-z0-9-]+$/i.test(name)) {
        document.body.classList.add('nui-dev');
        fetch(`/preview/${name}.json`)
            .then((r) => r.json())
            .then((scenario) => debugData(scenario.messages ?? [], 300))
            .catch(() => {});
    }
}
