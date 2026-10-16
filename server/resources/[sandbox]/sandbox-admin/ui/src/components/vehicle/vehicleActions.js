import { LEVEL } from '../../lib/permissions.js';

/**
 * Vehicle actions and the staff level each needs (mirrors the old console;
 * the server also requires the admin permission for every one of them).
 * `remote`: ActionVehicle on any entity. `current`: CurrentVehicleAction on your own vehicle.
 */
const ALL = [
    { key: 'repair', label: 'Quick repair', hint: 'Fixes enough damage to drive it away.', level: 0, refresh: true, remote: true, current: true },
    { key: 'repair_full', label: 'Full repair', hint: 'Restores the engine, body and every part to new.', level: LEVEL.SENSITIVE, refresh: true, remote: true, current: true },
    { key: 'repair_engine', label: 'Engine repair', hint: 'Fixes the engine only.', level: LEVEL.SENSITIVE, refresh: true, remote: true, current: true },
    { key: 'fuel', label: 'Refuel', hint: 'Fills the tank.', level: LEVEL.SENSITIVE, refresh: true, remote: true, current: true },
    { key: 'sitinside', label: 'Sit inside', hint: 'Puts you in the first free seat.', level: LEVEL.SENIOR, remote: true },
    { key: 'locks', label: 'Lock or unlock', hint: 'Switches the door locks.', level: LEVEL.SENSITIVE, remote: true },
    { key: 'alarm', label: 'Sound alarm', hint: 'Sounds for 25 seconds. Use it again to silence the alarm.', level: LEVEL.SENSITIVE, current: true },
    { key: 'customs', label: 'Open customs', hint: 'Opens the customs shop for this vehicle and closes the console.', level: LEVEL.SENSITIVE, current: true },
    {
        key: 'stall',
        label: 'Stall engine',
        verb: 'Stall',
        hint: 'Cuts the engine until the driver starts it again.',
        level: LEVEL.SENSITIVE,
        danger: true,
        remote: true,
        confirm: 'The driver loses power until they start the engine again.',
    },
    {
        key: 'explode',
        label: 'Explode vehicle',
        verb: 'Explode',
        hint: 'Wrecks the vehicle and hurts anyone inside.',
        level: LEVEL.SENSITIVE,
        danger: true,
        remote: true,
        current: true,
        confirm: 'The vehicle is wrecked and anyone inside is hurt. This cannot be undone.',
        confirmCurrent: 'You are sitting in this vehicle. It is wrecked and you and anyone with you are hurt.',
    },
    {
        key: 'delete',
        label: 'Delete vehicle',
        verb: 'Delete',
        hint: 'Removes it from the world.',
        level: LEVEL.SENIOR,
        danger: true,
        remote: true,
        confirm: 'The vehicle is removed from the world. Owned vehicles go back to their owner through the usual garage rules.',
    },
];

export function vehicleActions(kind, level) {
    return ALL.filter((a) => a[kind] && level >= a.level);
}
