/**
 * Taxi meter state (client/component.lua). Field names follow the
 * SendNUIMessage payloads documented in ../../CONTRACT.md.
 */

/** Game units per mile; the divisor every previous meter used. */
export const METRES_PER_MILE = 1609;

/** Below this distance per 1 s tick the cab counts as standing still. */
export const MOVING_THRESHOLD = 0.5;

/** Lua's fallback rate when nothing is stored in the TAXI_RATE KVP. */
export const DEFAULT_RATE = 10;

const initial = () => ({
    visible: false,
    rate: DEFAULT_RATE, // $ per mile
    trip: 0, // distance this ride, game units (~ metres)
    lastDelta: 0, // distance covered during the last UPDATE_TRIP tick
    seconds: 0, // UPDATE_TRIP ticks (one per second) since the ride first moved
});

export const meter = $state(initial());

const num = (v, fallback = 0) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
};

/** APP_SHOW: meter on with Lua's rate; every show starts a fresh ride. */
export function showMeter(rate) {
    meter.visible = true;
    meter.rate = num(rate, meter.rate);
    meter.trip = 0;
    meter.lastDelta = 0;
    meter.seconds = 0;
}

/** APP_HIDE: meter off; the ride is dropped because the next show resets it anyway. */
export function hideMeter() {
    meter.visible = false;
}

/** APP_RESET: back to the initial state (hidden, default rate, no ride). */
export function resetMeter() {
    Object.assign(meter, initial());
}

/** SET_RATE: Lua already clamped the value to 1..1000. */
export function setRate(rate) {
    meter.rate = num(rate, meter.rate);
}

/** RESET_TRIP: distance, fare and ride time back to zero. */
export function resetTrip() {
    meter.trip = 0;
    meter.lastDelta = 0;
    meter.seconds = 0;
}

/** UPDATE_TRIP: `delta` is the distance moved since the previous tick, not a total. */
export function addTrip(delta) {
    const d = Math.max(0, num(delta));
    meter.trip += d;
    meter.lastDelta = d;
    // The ride clock runs once the cab has moved at all and keeps running while it waits.
    if (meter.trip > 0) meter.seconds += 1;
}

/* ---- derived readouts (call inside $derived so they track the state) ---- */

export function miles() {
    return meter.trip / METRES_PER_MILE;
}

/** Whole dollars, rounded up, like every previous meter. */
export function fare() {
    return Math.max(0, Math.ceil(miles() * meter.rate));
}

/** running: moved on the last tick. paused: ride under way, cab standing. stopped: no ride yet. */
export function tripStatus() {
    if (meter.lastDelta >= MOVING_THRESHOLD) return 'running';
    if (meter.trip > 0) return 'paused';
    return 'stopped';
}
