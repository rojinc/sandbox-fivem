/**
 * Where the console is. The console stays mounted only while Lua has it
 * open, so every section fetches fresh data on each opening; this module
 * keeps the last place between openings.
 */
export const nav = $state({
    page: 'dashboard', // dashboard | players | self | vehicle
    playersView: 'online', // online | disconnected | characters
    player: null, // server id of the player record in the right column
    playerVehicle: null, // entity opened from that record ("Open vehicle")
    vehicleView: 'current', // current | owned
    vehicle: null, // entity of the vehicle record in the right column (owned view)
    dialog: null, // preview only: 'kick' | 'ban' opens that dialog on the player record
    reload: 0, // bumped after a kick or ban so the player list fetches again
});

export function go(page) {
    nav.page = page;
    nav.dialog = null;
}

export function openPlayer(source, view) {
    nav.page = 'players';
    if (view) nav.playersView = view;
    nav.player = Number(source);
    nav.playerVehicle = null;
    nav.dialog = null;
}

export function closePlayer() {
    nav.player = null;
    nav.playerVehicle = null;
}

export function openVehicle(entity) {
    nav.page = 'vehicle';
    nav.vehicleView = 'owned';
    nav.vehicle = Number(entity);
}

/**
 * Preview-only routes. scripts/preview.mjs can only post window messages, so a
 * scenario picks a screen with { "raw": { "previewRoute": "/players" } }. The
 * object has no `type`, so the NUI bridge never treats it as a Lua message.
 */
export function previewRoute(route) {
    const parts = String(route).split('/').filter(Boolean);
    const [head, id, extra] = parts;
    switch (head) {
        case undefined:
            go('dashboard');
            break;
        case 'players':
            go('players');
            nav.playersView = 'online';
            break;
        case 'disconnected-players':
            go('players');
            nav.playersView = 'disconnected';
            break;
        case 'players-characters':
            go('players');
            nav.playersView = 'characters';
            break;
        case 'player':
            openPlayer(id);
            if (extra === 'kick' || extra === 'ban') nav.dialog = extra;
            break;
        case 'self':
            go('self');
            break;
        case 'current-vehicle':
            go('vehicle');
            nav.vehicleView = 'current';
            break;
        case 'vehicles':
            go('vehicle');
            nav.vehicleView = 'owned';
            nav.vehicle = null;
            break;
        case 'vehicle':
            openVehicle(id);
            break;
        default:
            break;
    }
}
