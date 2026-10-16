// Health/armor, registered statuses (hunger, thirst, stress, radio-freq...) and buffs
// (client/hud.lua RegisterStatus, client/buffs.lua, client/events.lua).
export const initialState = {
    health: 100,
    maxHealth: 100,
    armor: 0,
    isDead: false,
    buffDefs: {}, // id -> { icon, color, duration, type: timed|value|permanent }
    buffs: [], // { buff, override, val, options, startTime }
    statuses: [], // { name, max, value, icon, color, flash, inverted?, options }
};

export default function status(state = initialState, action) {
    switch (action.type) {
        case 'SET_DEAD':
            return { ...state, isDead: Boolean(action.payload.state) };
        case 'SHOW_HUD':
        case 'UPDATE_HP':
            return {
                ...state,
                health: action.payload.hp ?? state.health,
                maxHealth: action.payload.maxHp ?? state.maxHealth,
                armor: action.payload.armor ?? state.armor,
            };
        case 'REGISTER_STATUS': {
            const s = action.payload.status;
            if (!s) return state;
            const exists = state.statuses.some((x) => x.name === s.name);
            return {
                ...state,
                statuses: exists ? state.statuses.map((x) => (x.name === s.name ? { ...x, ...s } : x)) : [...state.statuses, s],
            };
        }
        case 'RESET_STATUSES':
            return { ...state, statuses: [] };
        case 'UPDATE_STATUS':
            return {
                ...state,
                statuses: state.statuses.map((s) => (s.name === action.payload.status?.name ? { ...s, ...action.payload.status } : s)),
            };
        case 'UPDATE_STATUS_VALUE':
            return {
                ...state,
                statuses: state.statuses.map((s) => (s.name === action.payload.name ? { ...s, value: action.payload.value } : s)),
            };
        case 'REGISTER_BUFF':
            return { ...state, buffDefs: { ...state.buffDefs, [action.payload.id]: action.payload.data } };
        case 'BUFF_APPLIED':
            return { ...state, buffs: [...state.buffs, action.payload.instance] };
        case 'BUFF_APPLIED_UNIQUE': {
            const inst = action.payload.instance;
            if (!inst) return state;
            const exists = state.buffs.some((b) => b?.buff === inst.buff);
            return {
                ...state,
                buffs: exists ? state.buffs.map((b) => (b?.buff === inst.buff ? { ...inst } : b)) : [...state.buffs, inst],
            };
        }
        case 'BUFF_UPDATED': {
            // Lua: UpdateBuff(buff, val) and IconOverride(buff, override)
            const { buff, val, override } = action.payload;
            return {
                ...state,
                buffs: state.buffs.map((b) =>
                    b?.buff === buff
                        ? { ...b, ...(val !== undefined ? { val } : {}), ...(override !== undefined ? { override } : {}) }
                        : b,
                ),
            };
        }
        case 'REMOVE_BUFF_BY_TYPE':
            return { ...state, buffs: state.buffs.filter((b) => b?.buff !== action.payload.type) };
        case 'UI_RESET':
            return { ...initialState, buffDefs: { ...state.buffDefs }, buffs: [...state.buffs] };
        default:
            return state;
    }
}
