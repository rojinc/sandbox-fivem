import { createNuiStore } from '@sandbox/ui-kit';
import app from './features/app/reducer.js';
import data from './features/data/reducer.js';
import alerts from './features/alerts/reducer.js';
import badge from './features/badge/reducer.js';
import bodycam from './features/bodycam/reducer.js';

export const store = createNuiStore({ app, data, alerts, badge, bodycam });

export default store;
