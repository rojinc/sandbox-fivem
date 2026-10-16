import '@sandbox/ui-kit/fonts';
import '@sandbox/ui-kit/base.css';
import { mount } from 'svelte';
import { installBridge } from './bridge.js';
import App from './App.svelte';

// The loading screen only receives FiveM's native loadscreen events (window
// 'message' with `eventName`); see src/bridge.js and ../CONTRACT.md.
installBridge();

mount(App, { target: document.getElementById('app') });
