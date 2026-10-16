// Focus-taking menus and dialogs: list menu (client/list.lua), input (client/input.lua),
// confirm (client/confirm.lua), interaction wheel (client/interaction.lua),
// third-eye targeting (client/events.lua), meth table (client/hud.lua Meth).

export const listInitial = {
    showing: false,
    active: null,
    menus: {}, // id -> { label, headerAction?, items: [{ label, description, event, data, submenu, actions, disabled }] }
    stack: [],
};

export function list(state = listInitial, action) {
    switch (action.type) {
        case 'SET_LIST_MENU':
            return { ...state, showing: true, active: 'main', menus: action.payload.menus ?? {}, stack: [] };
        case 'CHANGE_MENU':
            if (!state.menus[action.payload.menu] || action.payload.menu === state.active) return state;
            return { ...state, active: action.payload.menu, stack: [...state.stack, state.active] };
        case 'LIST_GO_BACK':
            return {
                ...state,
                active: state.stack.length ? state.stack[state.stack.length - 1] : 'main',
                stack: state.stack.slice(0, -1),
            };
        case 'CLOSE_LIST_MENU':
        case 'UI_RESET':
            return { ...listInitial };
        default:
            return state;
    }
}

export const inputInitial = {
    showing: false,
    event: null,
    title: null,
    label: null,
    inputs: [], // { id, label?, type: text|number|multiline|select, options?, select? }
    data: null,
};

export function input(state = inputInitial, action) {
    switch (action.type) {
        case 'SHOW_INPUT':
            return { ...inputInitial, ...action.payload, inputs: action.payload.inputs ?? [], showing: true };
        case 'CLOSE_INPUT':
        case 'UI_RESET':
            return { ...inputInitial };
        default:
            return state;
    }
}

export const confirmInitial = {
    showing: false,
    yes: null,
    no: null,
    data: null,
    title: null,
    description: null,
    denyLabel: null,
    acceptLabel: null,
};

export function confirm(state = confirmInitial, action) {
    switch (action.type) {
        case 'SHOW_CONFIRM':
            return { ...confirmInitial, ...action.payload, showing: true };
        case 'CLOSE_CONFIRM':
        case 'UI_RESET':
            return { ...confirmInitial };
        default:
            return state;
    }
}

export const interactionInitial = {
    show: false,
    menuItems: [], // { id, label, icon, data }
    layer: 0,
};

export function interaction(state = interactionInitial, action) {
    switch (action.type) {
        case 'SHOW_INTERACTION_MENU':
            return { ...state, show: Boolean(action.payload.toggle) };
        case 'SET_INTERACTION_LAYER':
            return { ...state, layer: Number(action.payload.layer) || 0 };
        case 'SET_INTERACTION_MENU_ITEMS': {
            const items = Object.values(action.payload.items ?? {});
            return { ...state, menuItems: items.filter(Boolean).sort((a, b) => a.id - b.id) };
        }
        case 'UI_RESET':
            return { ...interactionInitial };
        default:
            return state;
    }
}

export const thirdEyeInitial = {
    showing: false,
    icon: null,
    menuOpen: false,
    menu: [], // { icon, text, event, data }
};

export function thirdEye(state = thirdEyeInitial, action) {
    switch (action.type) {
        case 'SHOW_EYE':
            return { ...state, icon: action.payload.icon || null, showing: true };
        case 'HIDE_EYE':
            return { ...state, showing: false };
        case 'OPEN_MENU':
            return { ...state, menu: Object.values(action.payload.menu ?? {}), menuOpen: true };
        case 'CLOSE_MENU':
        case 'UI_RESET':
            return { ...state, menuOpen: false, menu: [] };
        default:
            return state;
    }
}

export const methInitial = {
    showing: false,
    config: { ingredients: 0, cookTimeMax: 60, tableId: null },
};

export function meth(state = methInitial, action) {
    switch (action.type) {
        case 'OPEN_METH':
            return { ...state, showing: true, config: { ...methInitial.config, ...(action.payload.config ?? {}) } };
        case 'CLOSE_METH':
        case 'UI_RESET':
            return { ...methInitial };
        default:
            return state;
    }
}
