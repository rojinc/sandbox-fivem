/** Vehicle readouts (client/hud.lua StartVehicleThreads). Speed arrives in mph. */
export const vehicle = $state({
    showing: false,
    ignition: false,
    speed: 0,
    rpm: 0, // 0..1
    gear: null, // raw dashboard gear, 0 = reverse
    gears: 0, // top gear of the vehicle
    headlights: 0, // 0 off, 1 low beam, 2 high beam
    nos: 0,
    fuel: 0,
    fuelHide: false,
    seatbelt: false,
    seatbeltHide: false,
    cruise: false,
    checkEngine: false,
});
