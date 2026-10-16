import { createNuiStore } from '@sandbox/ui-kit';
import app from './features/app/reducer.js';
import clipboard from './features/clipboard/reducer.js';

/**
 * Every SendNUIMessage({ type, data }) from client/nui.lua is dispatched as
 * { type, payload: data } by <NuiBridge>. The reducers below are the contract
 * (see ../CONTRACT.md).
 */
export const store = createNuiStore({ app, clipboard });
