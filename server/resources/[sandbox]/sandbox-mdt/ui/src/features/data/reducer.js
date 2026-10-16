/**
 * Generic key/value store fed by MDT.Data:Set/Add/Update/Remove/Reset
 * (client/component.lua). Keys are whatever the server sends: charges,
 * governmentJobs, governmentJobsData, permissions, qualifications, bolos,
 * warrants, notices, govWorkers, homeLastFetch, prison, route.
 */
export const initialState = {
    data: {
        charges: [],
        warrants: [],
        notices: [],
        govWorkers: [],
        bolos: [],
        homeLastFetch: 0,
        permissions: {},
        qualifications: {},
        governmentJobs: ['government', 'police', 'ems', 'prison'],
        governmentJobsData: {},
        prison: false,
        route: null,
    },
};

const isArray = (v) => Array.isArray(v);
const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

export default function dataReducer(state = initialState, action) {
    const p = action.payload ?? {};
    switch (action.type) {
        case 'SET_DATA':
            if (!p.type) return state;
            return { ...state, data: { ...state.data, [p.type]: p.data } };

        case 'ADD_DATA': {
            if (!p.type) return state;
            const current = state.data[p.type];
            let next;
            if (current == null) next = [p.data];
            else if (isArray(current)) next = p.first ? [p.data, ...current] : [...current, p.data];
            else if (p.key != null) next = { ...current, [p.key]: p.data };
            else next = { ...current, ...(isObject(p.data) ? p.data : {}) };
            return { ...state, data: { ...state.data, [p.type]: next } };
        }

        case 'UPDATE_DATA': {
            if (!p.type) return state;
            const current = state.data[p.type];
            let next;
            if (isArray(current)) next = current.map((item) => (item?.id == p.id ? { ...p.data } : item));
            else if (isObject(current)) {
                next = p.key
                    ? { ...current, [p.id]: { ...(current[p.id] ?? {}), [p.key]: p.data } }
                    : { ...current, [p.id]: p.data };
            } else return state;
            return { ...state, data: { ...state.data, [p.type]: next } };
        }

        case 'REMOVE_DATA': {
            if (!p.type) return state;
            const current = state.data[p.type];
            let next;
            if (isArray(current)) {
                next = current.filter((item) =>
                    isObject(item) ? (p.key ? item[p.key] != p.id : item.id != p.id) : item != p.id,
                );
            } else if (isObject(current)) {
                next = Object.fromEntries(Object.entries(current).filter(([k]) => k != p.id));
            } else return state;
            return { ...state, data: { ...state.data, [p.type]: next } };
        }

        case 'RESET_DATA':
        case 'LOGOUT':
            return initialState;

        case 'JOB_LOGIN':
        case 'JOB_LOGOUT':
            return { ...state, data: { ...state.data, homeLastFetch: 0 } };

        default:
            return state;
    }
}
