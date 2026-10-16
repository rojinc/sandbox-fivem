import '@sandbox/ui-kit/fonts';
import '@sandbox/ui-kit/base.css';
import './styles.css';
import { mount } from 'svelte';
import { installBridge } from './bridge.js';
import App from './App.svelte';

// Lua never sends icon names. The one icon the chat draws (the "jump to latest"
// arrow) is a built-in Tabler icon drawn by name through the kit Icon.
installBridge();

mount(App, { target: document.getElementById('app') });
