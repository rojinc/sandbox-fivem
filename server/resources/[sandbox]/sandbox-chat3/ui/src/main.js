import '@sandbox/ui-kit/fonts';
import '@sandbox/ui-kit/base.css';
import './styles.css';
import { mount } from 'svelte';
import { installBridge } from './bridge.js';
import App from './App.svelte';

// Lua never sends icon names, so no icon pack is registered: the one icon the
// chat uses (the "jump to latest" arrow) is imported by its definition.
installBridge();

mount(App, { target: document.getElementById('app') });
