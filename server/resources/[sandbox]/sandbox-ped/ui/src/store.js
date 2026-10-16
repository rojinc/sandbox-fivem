import { createNuiStore } from '@sandbox/ui-kit';
import app from './features/app/reducer.js';
import ped from './features/ped/reducer.js';
import catalog from './features/catalog/reducer.js';

export const store = createNuiStore({ app, ped, catalog });
