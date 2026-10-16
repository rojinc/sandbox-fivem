import '@sandbox/ui-kit/fonts';
import '@sandbox/ui-kit/base.css';
import { mount } from 'svelte';
import { registerIcons } from '@sandbox/ui-kit/icons';
import { fas } from '@fortawesome/free-solid-svg-icons';
import App from './App.svelte';

registerIcons(fas);

mount(App, { target: document.getElementById('app') });
