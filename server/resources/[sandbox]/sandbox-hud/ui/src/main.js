import '@sandbox/ui-kit/fonts';
import '@sandbox/ui-kit/base.css';
import './styles.css';
import { mount } from 'svelte';
import { registerIcons } from '@sandbox/ui-kit/icons';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { installBridge } from './bridge.js';
import App from './App.svelte';

// Lua picks icons by name at runtime (statuses, buffs, menus), so the whole free set is registered.
registerIcons(fas, far);
installBridge();

mount(App, { target: document.getElementById('app') });
