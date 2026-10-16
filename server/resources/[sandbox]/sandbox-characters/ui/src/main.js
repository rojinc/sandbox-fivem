import '@sandbox/ui-kit/fonts';
import '@sandbox/ui-kit/base.css';
import './styles.css';
import { mount } from 'svelte';
import { installBridge } from './bridge.js';
import App from './App.svelte';

installBridge();

mount(App, { target: document.getElementById('app') });
