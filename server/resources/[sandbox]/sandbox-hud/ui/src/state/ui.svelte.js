/** Everything that is not the in-world HUD: toasts, prompts, menus, dialogs and overlays. */
const initial = () => ({
    notifications: [], // { _id, created, type, message, duration, icon, style? }
    nextNotificationId: 1,
    actions: [], // { id, message }
    progress: { showing: false, label: null, duration: 0, startTime: 0, state: 'running' }, // running | finished | cancelled | failed
    list: { showing: false, active: null, menus: {}, stack: [] },
    input: { showing: false, event: null, title: null, label: null, inputs: [], data: null },
    confirm: { showing: false, yes: null, no: null, data: null, title: null, description: null, denyLabel: null, acceptLabel: null },
    interaction: { show: false, items: [], layer: 0 },
    thirdEye: { showing: false, icon: null, menuOpen: false, menu: [] },
    meth: { showing: false, config: { ingredients: 0, cookTimeMax: 60, tableId: null } },
    infoOverlay: { showing: false, info: {} },
    overlay: { showing: false, items: [] },
    gemTable: { showing: false, info: null },
    death: { showing: false, releasing: false, deathTime: 0, releaseTimer: 0, type: null, key: null, helpKey: null, medicalPrice: 0 },
    blindfolded: false,
    flashbang: null, // { duration, strength }
});

export const ui = $state(initial());

/** UI_RESET: drop every transient surface but keep nothing that Lua would resend anyway. */
export function resetTransient() {
    const fresh = initial();
    for (const key of Object.keys(fresh)) {
        if (key === 'notifications' || key === 'nextNotificationId') continue;
        ui[key] = fresh[key];
    }
}
