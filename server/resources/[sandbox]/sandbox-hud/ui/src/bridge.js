/**
 * Lua -> UI message routing. Every SendNUIMessage({ type, data }) listed in
 * CONTRACT.md lands here and mutates the rune state modules directly.
 */
import { onNui } from '@sandbox/ui-kit/nui';
import { hud, setConfig } from './state/hud.svelte.js';
import { status, upsertStatus, applyHp } from './state/status.svelte.js';
import { vehicle } from './state/vehicle.svelte.js';
import { location } from './state/location.svelte.js';
import { ui, resetTransient } from './state/ui.svelte.js';

const asList = (v) => (Array.isArray(v) ? v : Object.values(v ?? {})).filter(Boolean);

export function installBridge() {
    /* ----------------------------------------------------------- hud */
    onNui('SHOW_HUD', (d = {}) => {
        hud.showing = true;
        applyHp(d);
        if (typeof d.fuel === 'number') vehicle.fuel = d.fuel;
    });
    onNui('HIDE_HUD', () => (hud.showing = false));
    onNui('TOGGLE_HUD', () => (hud.showing = !hud.showing));
    onNui('SET_CONFIG', (d = {}) => setConfig(d.config));
    onNui('UPDATE_MM_POS', (d = {}) => {
        if (d.position) hud.position = d.position;
    });
    onNui('SHIFT_LOCATION', (d = {}) => {
        if (d.position) hud.position = d.position;
        hud.shifted = Boolean(d.shift);
    });
    onNui('SET_VOIP_LEVEL', (d = {}) => {
        hud.voip = d.level ?? hud.voip;
        hud.talking = d.talking ?? 0;
        hud.voipIcon = d.icon || 'microphone';
    });
    onNui('TOGGLE_SETTINGS', (d = {}) => (hud.settings = Boolean(d.state)));

    /* -------------------------------------------------------- status */
    onNui('UPDATE_HP', applyHp);
    onNui('SET_DEAD', (d = {}) => (status.isDead = Boolean(d.state)));
    onNui('REGISTER_STATUS', (d = {}) => upsertStatus(d.status));
    onNui('UPDATE_STATUS', (d = {}) => upsertStatus(d.status, true));
    onNui('UPDATE_STATUS_VALUE', (d = {}) => {
        const s = status.statuses.find((x) => x.name === d.name);
        if (s) s.value = d.value;
    });
    onNui('RESET_STATUSES', () => (status.statuses = []));
    onNui('REGISTER_BUFF', (d = {}) => {
        if (d.id !== undefined) status.buffDefs[d.id] = d.data ?? {};
    });
    onNui('BUFF_APPLIED', (d = {}) => {
        if (d.instance) status.buffs.push(d.instance);
    });
    onNui('BUFF_APPLIED_UNIQUE', (d = {}) => {
        const inst = d.instance;
        if (!inst) return;
        const i = status.buffs.findIndex((b) => b?.buff === inst.buff);
        if (i >= 0) status.buffs[i] = { ...inst };
        else status.buffs.push(inst);
    });
    onNui('BUFF_UPDATED', (d = {}) => {
        const b = status.buffs.find((x) => x?.buff === d.buff);
        if (!b) return;
        if (d.val !== undefined) b.val = d.val;
        if (d.override !== undefined) b.override = d.override;
    });
    onNui('REMOVE_BUFF_BY_TYPE', (d = {}) => (status.buffs = status.buffs.filter((b) => b?.buff !== d.type)));

    /* ------------------------------------------------------ location */
    onNui('UPDATE_LOCATION', (d = {}) => Object.assign(location, d.location ?? {}));

    /* ------------------------------------------------------- vehicle */
    onNui('SHOW_VEHICLE', () => (vehicle.showing = true));
    onNui('HIDE_VEHICLE', () => (vehicle.showing = false));
    onNui('TOGGLE_VEHICLE', () => (vehicle.showing = !vehicle.showing));
    onNui('UPDATE_IGNITION', (d = {}) => (vehicle.ignition = Boolean(d.ignition)));
    onNui('UPDATE_RPM', (d = {}) => (vehicle.rpm = Number(d.rpm) || 0));
    onNui('UPDATE_SPEED', (d = {}) => {
        vehicle.speed = Number(d.speed) || 0;
        if (d.gear !== undefined) vehicle.gear = d.gear === false ? null : d.gear;
        if (d.gears !== undefined) vehicle.gears = Number(d.gears) || 0;
        if (d.headlights !== undefined) vehicle.headlights = Number(d.headlights) || 0;
    });
    onNui('UPDATE_FUEL', (d = {}) => {
        if (typeof d.fuel === 'number') vehicle.fuel = d.fuel;
        if (typeof d.fuelHide === 'boolean') vehicle.fuelHide = d.fuelHide;
    });
    onNui('UPDATE_NOS', (d = {}) => (vehicle.nos = Number(d.nos) || 0));
    onNui('UPDATE_SEATBELT', (d = {}) => (vehicle.seatbelt = Boolean(d.seatbelt)));
    onNui('SHOW_SEATBELT', () => (vehicle.seatbeltHide = false));
    onNui('HIDE_SEATBELT', () => (vehicle.seatbeltHide = true));
    onNui('UPDATE_CRUISE', (d = {}) => (vehicle.cruise = Boolean(d.cruise)));
    onNui('UPDATE_ENGINELIGHT', (d = {}) => (vehicle.checkEngine = Boolean(d.checkEngine)));

    /* -------------------------------------------------- notifications */
    onNui('ADD_ALERT', (d = {}) => {
        const n = d.notification;
        if (!n) return;
        const existing = n._id !== undefined && n._id !== null ? ui.notifications.find((x) => x._id === n._id) : null;
        if (existing) {
            Object.assign(existing, n, { created: Date.now(), hide: false });
            return;
        }
        const id = n._id ?? `n${ui.nextNotificationId++}`;
        ui.notifications.push({ ...n, _id: id, created: Date.now() });
    });
    onNui('HIDE_ALERT', (d = {}) => {
        const n = ui.notifications.find((x) => x._id === d.id);
        if (n) n.hide = true;
    });
    onNui('CLEAR_ALERTS', () => (ui.notifications = []));

    /* --------------------------------------------------------- prompts */
    onNui('ADD_ACTION', (d = {}) => {
        ui.actions = [...ui.actions.filter((a) => a.id !== d.id), { id: d.id, message: d.message }];
    });
    onNui('REMOVE_ACTION', (d = {}) => (ui.actions = ui.actions.filter((a) => a.id !== d.id)));
    onNui('REMOVE_ALL_ACTIONS', () => (ui.actions = []));
    onNui('START_PROGRESS', (d = {}) => {
        ui.progress = { showing: true, label: d.label ?? null, duration: Number(d.duration) || 0, startTime: Date.now(), state: 'running' };
    });
    onNui('CANCEL_PROGRESS', () => {
        if (ui.progress.showing) ui.progress.state = 'cancelled';
    });
    onNui('FAIL_PROGRESS', () => {
        if (ui.progress.showing) ui.progress.state = 'failed';
    });

    /* ----------------------------------------------------------- menus */
    onNui('SET_LIST_MENU', (d = {}) => {
        ui.list = { showing: true, active: 'main', menus: d.menus ?? {}, stack: [] };
    });
    onNui('CLOSE_LIST_MENU', () => (ui.list = { showing: false, active: null, menus: {}, stack: [] }));
    onNui('SHOW_INPUT', (d = {}) => {
        ui.input = { showing: true, event: d.event ?? null, title: d.title ?? null, label: d.label ?? null, inputs: asList(d.inputs), data: d.data ?? null };
    });
    onNui('CLOSE_INPUT', () => (ui.input.showing = false));
    onNui('SHOW_CONFIRM', (d = {}) => {
        ui.confirm = { showing: true, yes: d.yes ?? null, no: d.no ?? null, data: d.data ?? null, title: d.title ?? null, description: d.description ?? null, denyLabel: d.denyLabel ?? null, acceptLabel: d.acceptLabel ?? null };
    });
    onNui('CLOSE_CONFIRM', () => (ui.confirm.showing = false));
    onNui('SHOW_INTERACTION_MENU', (d = {}) => (ui.interaction.show = Boolean(d.toggle)));
    onNui('SET_INTERACTION_LAYER', (d = {}) => (ui.interaction.layer = Number(d.layer) || 0));
    onNui('SET_INTERACTION_MENU_ITEMS', (d = {}) => {
        ui.interaction.items = asList(d.items).sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
    });
    onNui('SHOW_EYE', (d = {}) => {
        ui.thirdEye.icon = d.icon || null;
        ui.thirdEye.showing = true;
    });
    onNui('HIDE_EYE', () => (ui.thirdEye.showing = false));
    onNui('OPEN_MENU', (d = {}) => {
        ui.thirdEye.menu = asList(d.menu);
        ui.thirdEye.menuOpen = true;
    });
    onNui('CLOSE_MENU', () => {
        ui.thirdEye.menuOpen = false;
        ui.thirdEye.menu = [];
    });
    onNui('OPEN_METH', (d = {}) => {
        ui.meth = { showing: true, config: { ingredients: 0, cookTimeMax: 60, tableId: null, ...(d.config ?? {}) } };
    });
    onNui('CLOSE_METH', () => (ui.meth.showing = false));

    /* -------------------------------------------------------- overlays */
    onNui('SHOW_INFO_OVERLAY', (d = {}) => (ui.infoOverlay = { showing: true, info: d.info ?? {} }));
    onNui('CLOSE_INFO_OVERLAY', () => (ui.infoOverlay.showing = false));
    onNui('SHOW_OVERLAY', (d) => {
        // Lua sends data = { item }: a one-element array (an object once it has crossed the bridge).
        ui.overlay = { showing: true, items: asList(d).filter((x) => typeof x === 'object') };
    });
    onNui('HIDE_OVERLAY', () => (ui.overlay.showing = false));
    onNui('SHOW_GEM_TABLE', (d = {}) => (ui.gemTable = { showing: true, info: d.info ?? null }));
    onNui('CLOSE_GEM_TABLE', () => (ui.gemTable.showing = false));
    onNui('DO_DEATH_TEXT', (d = {}) => {
        ui.death = {
            showing: true,
            releasing: false,
            deathTime: (Number(d.deathTime) || 0) * 1000,
            releaseTimer: (Number(d.timer) || 0) * 1000,
            type: d.type ?? null,
            key: d.key ?? null,
            helpKey: d.f1Key ?? null,
            medicalPrice: Number(d.medicalPrice) || 0,
        };
    });
    onNui('DO_DEATH_RELEASING', () => (ui.death.releasing = true));
    onNui('HIDE_DEATH_TEXT', () => (ui.death.showing = false));
    onNui('SET_BLINDFOLD', (d = {}) => (ui.blindfolded = Boolean(d.state)));
    onNui('SET_FLASHBANGED', (d = {}) => (ui.flashbang = { duration: Number(d.duration) || 3000, strength: Number(d.strength) || 1, at: Date.now() }));
    onNui('CLEAR_FLASHBANGED', () => (ui.flashbang = null));

    onNui('UI_RESET', () => {
        resetTransient();
        hud.settings = false;
    });
}
