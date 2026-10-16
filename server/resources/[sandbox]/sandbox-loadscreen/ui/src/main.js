import '@sandbox/ui-kit/fonts';
import '@sandbox/ui-kit/base.css';
import { mount } from 'svelte';
import { installBridge } from './bridge.js';
import App from './App.svelte';

// The loading screen only receives FiveM's native loadscreen events (window
// 'message' with `eventName`); nothing sends icon names, so the one icon it
// draws is imported where it is used instead of registering the whole set.
installBridge();

mount(App, { target: document.getElementById('app') });
