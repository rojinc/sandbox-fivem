import '@sandbox/ui-kit/fonts';
import '@sandbox/ui-kit/base.css';
import './styles.css';
import { mount } from 'svelte';
import { installBridge } from './bridge.js';
import App from './App.svelte';

// Lua never picks icons by name on this screen (spawn `icon` names are not
// rendered, see CONTRACT.md), so the few icons used are imported as definitions.
installBridge();

mount(App, { target: document.getElementById('app') });
