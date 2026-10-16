/**
 * State machine for FiveM's native loading-screen events, kept as one rune
 * object that the bridge mutates in place. Every event arrives on window
 * 'message' as `{ eventName, ...fields }`; the full list and payloads are
 * documented in ../../CONTRACT.md.
 */

/** Steps shown in the step row, in the order the game runs them. */
export const STEPS = [
    { id: 'data', label: 'Game data' },
    { id: 'world', label: 'World' },
    { id: 'session', label: 'Session' },
    { id: 'sync', label: 'Server sync' },
];

const STEP_INDEX = Object.fromEntries(STEPS.map((s, i) => [s.id, i]));

/** Init-function types the game emits, mapped to a step. */
const INIT_TYPE_STEP = {
    INIT_CORE: 'data',
    INIT_BEFORE_MAP_LOADED: 'world',
    INIT_AFTER_MAP_LOADED: 'world',
    INIT_SESSION: 'session',
};

const INIT_TYPE_HEADLINE = {
    MAP: 'Loading the map',
    INIT_CORE: 'Loading core game data',
    INIT_BEFORE_MAP_LOADED: 'Preparing the world',
    INIT_AFTER_MAP_LOADED: 'Populating the world',
    INIT_SESSION: 'Joining the session',
};

const MAX_LOG = 4;

export const loading = $state({
    /** Overall progress 0..1 from loadProgress; never moves backwards. */
    fraction: 0,
    /** Index into STEPS; -1 until the first event arrives. */
    step: -1,
    /** Stage headline. */
    headline: 'Connecting to the server',
    /** Short technical line under the progress (function / file / log). */
    detail: null,
    /** Last few activity lines, newest last. */
    log: [],
    /** Current init-function batch: { type, order, count, invoked }. */
    order: null,
    /** True after endInitFunction INIT_SESSION: the game is done, Lua will shut us down. */
    finished: false,
});

function prettyType(type) {
    if (!type) return 'game data';
    return String(type)
        .replace(/^INIT_/, '')
        .toLowerCase()
        .replace(/_/g, ' ');
}

function headlineFor(type) {
    return INIT_TYPE_HEADLINE[type] ?? `Loading ${prettyType(type)}`;
}

function stepFor(type) {
    return INIT_TYPE_STEP[type] ?? 'data';
}

/** Move to `stepId` unless we are already past it. */
function advance(stepId) {
    const i = STEP_INDEX[stepId] ?? 0;
    if (i > loading.step) loading.step = i;
}

function pushLog(line) {
    if (!line) return;
    const text = String(line).trim();
    if (!text || loading.log[loading.log.length - 1] === text) return;
    loading.log = [...loading.log.slice(-(MAX_LOG - 1)), text];
}

/** One handler per native event; each mutates `loading` in place. */
const HANDLERS = {
    loadProgress(msg) {
        const f = Number(msg.loadFraction);
        if (Number.isFinite(f)) loading.fraction = Math.min(1, Math.max(loading.fraction, f));
    },

    onLogLine(msg) {
        loading.detail = msg.message ?? loading.detail;
        pushLog(msg.message);
    },

    startDataFileEntries(msg) {
        advance('data');
        if (!loading.order) loading.headline = 'Loading game data';
        loading.detail = Number.isFinite(msg.count) ? `${msg.count} data file entries` : loading.detail;
    },

    onDataFileEntry(msg) {
        advance('data');
        loading.detail = msg.name ?? loading.detail;
    },

    performMapLoadFunction(msg) {
        advance('data');
        if (!loading.order) loading.headline = 'Loading the map';
        loading.detail = Number.isFinite(msg.idx) ? `map load function ${msg.idx}` : loading.detail;
    },

    endDataFileEntries() {
        /* activity only */
    },

    startInitFunction(msg) {
        advance(stepFor(msg.type));
        loading.headline = headlineFor(msg.type);
        loading.order = null;
        loading.detail = prettyType(msg.type);
    },

    startInitFunctionOrder(msg) {
        advance(stepFor(msg.type));
        loading.headline = headlineFor(msg.type);
        loading.order = {
            type: msg.type,
            order: Number(msg.order) || 0,
            count: Number(msg.count) || 0,
            invoked: 0,
        };
    },

    initFunctionInvoking(msg) {
        advance(stepFor(msg.type));
        loading.detail = msg.name ?? loading.detail;
    },

    initFunctionInvoked(msg) {
        if (loading.order && loading.order.type === msg.type) loading.order.invoked += 1;
        pushLog(msg.name);
    },

    endInitFunction(msg) {
        if (msg.type !== 'INIT_SESSION') return;
        loading.finished = true;
        loading.step = STEP_INDEX.sync;
        loading.headline = 'Syncing with the server';
        loading.detail = 'waiting for the server to hand over';
        loading.order = null;
    },
};

/**
 * Apply one native event to `loading`. Unknown or malformed messages are
 * ignored and return false.
 */
export function applyLoadEvent(msg) {
    if (!msg || typeof msg !== 'object' || typeof msg.eventName !== 'string') return false;
    const handler = HANDLERS[msg.eventName];
    if (!handler) return false;
    if (loading.step < 0) loading.step = 0;
    handler(msg);
    return true;
}

/** 'done' | 'active' | 'pending' for step `index`. */
export function stepStatus(state, index) {
    if (index < state.step) return 'done';
    if (index === state.step) return 'active';
    return 'pending';
}
