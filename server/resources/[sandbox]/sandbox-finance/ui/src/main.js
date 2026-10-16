import '@sandbox/ui-kit/fonts';
import '@sandbox/ui-kit/base.css';
import './styles.css';
import { mount } from 'svelte';
import { registerIcons } from '@sandbox/ui-kit/icons';
import { faCircleNotch, faCircleDot } from '@fortawesome/free-solid-svg-icons';
import { installBridge } from './bridge.js';
import App from './App.svelte';

// Lua never sends icon names, so only the two the kit resolves by name are
// registered: Button's loading spinner and Icon's fallback. Everything else is
// imported as a definition where it is used.
registerIcons({ faCircleNotch, faCircleDot });
installBridge();

mount(App, { target: document.getElementById('app') });
