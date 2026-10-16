// Vehicle cluster (client/hud.lua StartVehicleThreads, client/events.lua).
export const initialState = {
    showing: false,
    ignition: false,
    nos: 0,
    speed: 0,
    rpm: 0,
    speedMeasure: 'MPH',
    seatbelt: false,
    seatbeltHide: false,
    cruise: false,
    checkEngine: false,
    fuel: 0,
    fuelHide: false,
};

export default function vehicle(state = initialState, action) {
    switch (action.type) {
        case 'SHOW_VEHICLE':
            return { ...state, showing: true };
        case 'HIDE_VEHICLE':
            return { ...state, showing: false };
        case 'TOGGLE_VEHICLE':
            return { ...state, showing: !state.showing };
        case 'UPDATE_IGNITION':
            return { ...state, ignition: Boolean(action.payload.ignition) };
        case 'UPDATE_RPM':
            return { ...state, rpm: Number(action.payload.rpm) || 0 };
        case 'UPDATE_SPEED':
            return { ...state, speed: Number(action.payload.speed) || 0 };
        case 'UPDATE_SPEED_MEASURE':
            return { ...state, speedMeasure: action.payload.measurement ?? state.speedMeasure };
        case 'UPDATE_SEATBELT':
            return { ...state, seatbelt: Boolean(action.payload.seatbelt) };
        case 'SHOW_SEATBELT':
            return { ...state, seatbeltHide: false };
        case 'HIDE_SEATBELT':
            return { ...state, seatbeltHide: true };
        case 'UPDATE_CRUISE':
            return { ...state, cruise: Boolean(action.payload.cruise) };
        case 'UPDATE_ENGINELIGHT':
            return { ...state, checkEngine: Boolean(action.payload.checkEngine) };
        case 'SHOW_HUD':
        case 'UPDATE_FUEL':
            return {
                ...state,
                fuel: typeof action.payload.fuel === 'number' ? action.payload.fuel : state.fuel,
                fuelHide: typeof action.payload.fuelHide === 'boolean' ? action.payload.fuelHide : state.fuelHide,
            };
        case 'UPDATE_NOS':
            return { ...state, nos: Number(action.payload.nos) || 0 };
        default:
            return state;
    }
}
