# sandbox-taxi: Lua <-> NUI contract

Extracted from `client/component.lua`, `client/events.lua` and
`client/config.lua` (the resource has no `server/` or `shared/` folder).
The Lua side is the source of truth; `src/bridge.js` routes every type below
into `src/state/meter.svelte.js`.

## Lua -> UI (`SendNUIMessage`)

| `type`        | `data` fields          | Sent when                                                                                                                                  | UI effect |
|---------------|------------------------|--------------------------------------------------------------------------------------------------------------------------------------------|-----------|
| `APP_SHOW`    | `rate` (int, $/mile)   | Player enters the driver seat (seat `-1`) of a vehicle whose model is in `_models` (`taxi`), or the *Taxi - Toggle HUD* keybind turns the meter on. Lua also starts the 1 s trip thread. | Show the meter, store the rate, **trip, fare and time reset to 0** (a new ride). |
| `APP_HIDE`    | none                   | `Vehicles:Client:ExitVehicle`, or *Toggle HUD* while the meter is on. Lua stops the trip thread.                                           | Hide the meter. |
| `APP_RESET`   | none                   | `UI:Client:Reset` (character logout / UI reset).                                                                                           | Back to the initial state: hidden, trip 0, default rate 10. |
| `SET_RATE`    | `rate` (int, 1..1000)  | *Taxi - Increase Rate* / *Taxi - Decrease Rate* keybinds. Lua clamps to 1..1000 and persists the value in KVP `TAXI_RATE`.                  | Replace the rate; the fare is recomputed from the accumulated trip. |
| `RESET_TRIP`  | none                   | *Taxi - Reset Trip* keybind.                                                                                                               | Trip distance, fare and ride time back to 0; state shows *Stopped*. |
| `UPDATE_TRIP` | `trip` (float, metres) | Every 1000 ms while the meter is shown, the player is logged in and still in the same vehicle. `trip` is the **distance moved since the previous tick** (game units, roughly metres), not a running total. | Accumulate `trip += data.trip`, remember the tick's delta, advance the ride clock by one second once the ride has moved at all. |

Derived values (UI only, `src/state/meter.svelte.js`):

* miles    = `trip / 1609`
* fare     = `ceil(miles * rate)` in whole dollars (`formatMoney`, "$1,234")
* time     = number of `UPDATE_TRIP` ticks received since the cab first moved
  this ride, shown as `mm:ss` (`formatClock`). One tick per second in game; the
  clock keeps running while the cab waits, and starts again at 0 after
  `RESET_TRIP` or a new `APP_SHOW`.
* state    = *Running* when the last tick's `trip >= 0.5`; *Paused* when the
  ride has distance but the last tick was below that; *Stopped* when the trip
  is 0 (just shown, or reset). The React build called these Moving / Waiting.

Keybinds (`Keybinds:Add`, no default key): `taxi_increase_rate`,
`taxi_decrease_rate`, `taxi_reset_trip`, `taxi_toggle_hud`. They are bound by
the player under *Settings > Key Bindings > FiveM*; Lua never tells the UI which
keys are bound.

## UI -> Lua (`RegisterNUICallback`)

None. The resource registers no NUI callbacks, so the UI never calls `fetchNui`.

## Focus and keyboard

Never granted. `SetNuiFocus` is not called anywhere in the resource; the meter
is a passive overlay (`pointer-events: none` on the root). Keyboard events never
reach the page, so there is no Escape handler and no close callback.

## Placement and scale

Bottom-right, above the sandbox-hud speedometer cluster (both are on screen
whenever the player drives). Chrome is sized in px for 1920 wide; `App.svelte`
zooms the root by `window.innerWidth / 1920` so 1440p and 4K keep the same
proportions. The preview folder has one 2560x1440 scenario for this.

## Dropped (not driven by Lua)

* The key-hint footer of the React build. Lua never sends the bound keys, so it
  could only list action names; the actions are discoverable in the game's
  key-binding settings under their *Taxi - ...* labels.
* The "Downtown Cab Co." subline and the taxi icon tile: decoration, no data.
* From the original boilerplate: `dataReducer.js` (`SET_DATA`, `ADD_DATA`,
  `UPDATE_DATA`, `REMOVE_DATA`, `RESET_DATA`), `react-router`, `react-toastify`,
  `Nui.send()`, the bundled `LCD.ttf` font and the Google Fonts `Exo` link.
