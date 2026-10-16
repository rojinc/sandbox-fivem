import '@sandbox/ui-kit/fonts';
import '@sandbox/ui-kit/base.css';
import './styles.css';
import { mount } from 'svelte';
import { installBridge } from './bridge.js';
import App from './App.svelte';

// Lua never sends icon names and the chat draws no icons of its own, so nothing
// is registered (the kit draws its Tabler set by name where a component needs one).
installBridge();

mount(App, { target: document.getElementById('app') });
