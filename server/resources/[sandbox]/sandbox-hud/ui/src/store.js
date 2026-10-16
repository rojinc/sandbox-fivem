import { createNuiStore } from '@sandbox/ui-kit';
import app from './features/app.js';
import hud from './features/hud.js';
import status from './features/status.js';
import vehicle from './features/vehicle.js';
import location from './features/location.js';
import notifications from './features/notifications.js';
import actions from './features/actions.js';
import progress from './features/progress.js';
import { list, input, confirm, interaction, thirdEye, meth } from './features/menus.js';
import { infoOverlay, overlay, gemTable } from './features/overlays.js';

export const store = createNuiStore({
    app,
    hud,
    status,
    vehicle,
    location,
    notifications,
    actions,
    progress,
    list,
    input,
    confirm,
    interaction,
    thirdEye,
    meth,
    infoOverlay,
    overlay,
    gemTable,
});
