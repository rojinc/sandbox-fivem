import '@sandbox/ui-kit/fonts';
import '@sandbox/ui-kit/base.css';
import { mount } from 'svelte';
import { installBridge } from './bridge.js';
import App from './App.svelte';

// Lua never sends icon names and the meter draws no icons, so no icon set is registered.
installBridge();

mount(App, { target: document.getElementById('app') });
