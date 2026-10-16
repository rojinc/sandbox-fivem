import '@sandbox/ui-kit/fonts';
import '@sandbox/ui-kit/base.css';
import { mount } from 'svelte';
import { isEnvBrowser, debugData } from '@sandbox/ui-kit/nui';
import { installBridge } from './bridge.js';
import App from './App.svelte';

installBridge();

mount(App, { target: document.getElementById('app') });

// vite dev in a plain browser: replay a preview scenario so the editor has data.
if (import.meta.env.DEV && isEnvBrowser()) {
    import('../preview/creator.json').then((m) => debugData((m.default.messages ?? []).filter((x) => x.type), 50));
}
