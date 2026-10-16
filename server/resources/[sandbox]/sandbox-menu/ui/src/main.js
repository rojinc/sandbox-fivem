import '@sandbox/ui-kit/fonts';
import '@sandbox/ui-kit/base.css';
import { mount } from 'svelte';
import { installBridge } from './bridge.js';
import App from './App.svelte';

installBridge();

mount(App, { target: document.getElementById('app') });

// `vite` on port 3022: open a sample menu so the page is not blank. Not part of the build.
if (import.meta.env.DEV) import('./dev.js').then((m) => m.showSample());
