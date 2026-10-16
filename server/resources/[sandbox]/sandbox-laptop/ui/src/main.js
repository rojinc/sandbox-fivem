import '@sandbox/ui-kit/fonts';
import '@sandbox/ui-kit/base.css';
import './styles.css';
import { mount } from 'svelte';
import { installBridge } from './bridge.js';
import { installDevMocks } from './dev.js';
import App from './App.svelte';

installBridge();
installDevMocks();

mount(App, { target: document.getElementById('app') });
