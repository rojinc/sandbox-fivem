import '@sandbox/ui-kit/fonts';
import '@sandbox/ui-kit/base.css';
import './styles.css';
import { mount } from 'svelte';
import { debugData, mockNui } from '@sandbox/ui-kit/nui';
import { installBridge } from './bridge.js';
import App from './App.svelte';

// Icons are imported as definitions where they are used; Lua never sends icon names.
installBridge();

// Browser-only sample traffic so `vite` on port 3012 shows a live unit. No-op in game.
mockNui('UpdateSettings', 'OK');
mockNui('CloseRemote', 'OK');
debugData([
    {
        type: 'UPDATE_SETTINGS',
        data: { scale: 100, location: 1, fastSpeed: 75, frontRadar: { lane: true, transmit: true }, rearRadar: { lane: true, transmit: true } },
    },
    { type: 'RADAR_SHOW' },
    {
        type: 'UPDATE_DATA',
        data: {
            patrolSpeed: 41,
            frontRadar: { speed: 48, direction: 'down', plate: '46EEK572', class: 'B' },
            rearRadar: { speed: 33, direction: 'up', plate: 'KLM 2210', class: 'D' },
        },
    },
    {
        type: 'UPDATE_DATA',
        data: {
            patrolSpeed: 55,
            frontRadar: { speed: 92, direction: 'down', plate: '8GTB294', class: 'A' },
            frontFast: { speed: 92, plate: '8GTB294', fast: true, locked: false, flag: false, class: 'A' },
        },
    },
    { type: 'REMOTE_SHOW' },
], 400);

mount(App, { target: document.getElementById('app') });
