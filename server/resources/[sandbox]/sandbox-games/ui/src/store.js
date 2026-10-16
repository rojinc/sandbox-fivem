import { createNuiStore } from '@sandbox/ui-kit';
import game from './features/game/reducer.js';

export const store = createNuiStore({ game });

export default store;
