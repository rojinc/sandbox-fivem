# sandbox-radar NUI contract

Source of truth: `client/client.lua`, `client/remote.lua`, `client/settings.lua`.
`client/helicam.lua`, `client/sound.lua`, `client/utils.lua` and `server/server.lua` never talk to the NUI.

Every `SendNUIMessage({ type, data })` below is routed by `ui/src/bridge.js` into the rune state in
`ui/src/state/radar.svelte.js`. Two surfaces: the **radar unit** (`components/radar/RadarUnit.svelte`, drawn
as a dash-mounted unit: black housing, recessed LED windows with red target, amber fast and green patrol
digits, faceplate lamps; docked by `settings.location`, sized by `settings.scale`, never focused) and the
**remote** (`components/remote/Remote.svelte`, a dark kit form panel docked bottom centre, focused by Lua).

## Lua -> UI (`SendNUIMessage`), 7 types

| `type`            | `data`               | Sent from |
|-------------------|----------------------|-----------|
| `RADAR_SHOW`      | none                 | client.lua `EnableRadar()`: on-duty police enters a class-18 vehicle while not force-disabled, or `radar_toggle` / `/radar` re-enables |
| `RADAR_HIDE`      | none                 | client.lua `DisableRadar()`: vehicle exit, `radar_toggle`, `/radar` |
| `RESET_RADAR`     | none                 | client.lua on `Characters:Client:Logout`; the UI returns to its initial state (unit and remote hidden, default settings, empty data) |
| `UPDATE_DATA`     | partial, below       | client.lua every 200 ms while enabled, plus `LockRadar()` / `UnlockRadar()` |
| `UPDATE_SETTINGS` | full settings object | settings.lua on character spawn (`GetSavedSettings`) and after every `UpdateSettings` callback |
| `REMOTE_SHOW`     | none                 | remote.lua `OpenRadarRemote()` (`radar_remote` keybind, only while the radar is enabled) |
| `REMOTE_HIDE`     | none                 | remote.lua `CloseRadarRemote()` (`CloseRemote` callback or vehicle exit) |

### `UPDATE_DATA` payload

Every key is optional. `applyData()` shallow-merges the payload over the previous data, which is what Lua
relies on: a tick without `frontFast` keeps the previous fast reading.

```
patrolSpeed : number            mph (math.ceil), on every 200 ms tick
frontRadar  : { speed, direction, plate, class } | {}
                                only while settings.frontRadar.transmit; {} = nothing in the beam
rearRadar   : same, gated by settings.rearRadar.transmit
frontFast   : { speed, plate, fast = true, locked, flag, class }
                                only on the tick that records a new or higher fast reading
rearFast    : same
```

* `speed`: integer mph. `direction`: `'up'` = travelling away, `'down'` = closing, `false` = crossing /
  unknown (110 degree cone). `plate` is only sent when `direction` is truthy. `class` is the vehicle grade
  letter (`S`, `A`, `B`, `C`, `D`).
* Fast readings are sticky in Lua (highest reading per antenna) until the operator locks and unlocks. Only
  readings `>= settings.fastSpeed` count, and only when `settings.fastSpeed > 20`.
* Lock (`radar_lock`, `LockRadar`): `{ frontFast = {...locked = true}, rearFast = {...locked = true} }`. An
  antenna with no fast reading arrives as `{ locked = true }` with no `speed`; the UI lights that
  antenna's LOCK lamp and leaves its fast window blank.
* Unlock (`UnlockRadar`): `{ frontFast = {}, rearFast = {} }`.
* Empty Lua tables cross the msgpack -> JSON bridge as `[]`; `applyData()` normalises arrays to `{}`.
* `flag`: `GlobalState.RadarFlaggedPlates[plate] ~= nil`, so a boolean today. The UI renders a flagged state
  for any truthy value and uses a string as the reason, so the moment Lua sends the reason it is shown. Every
  flagged plate in any record gets one lit warning line inside the unit (error-tinted background, no edge
  bar), and the plate itself turns red under its window.
* An antenna whose `transmit` setting is off renders blank whatever Lua last sent for it.

### `UPDATE_SETTINGS` payload (`RADAR_SETTINGS`, persisted in KVP `RADAR_SETTINGS`)

```
scale      : 85..150   percent, step 5 in the remote            default 100
location   : 1..9      see table                                  default 1
fastSpeed  : 0..300    mph; alerts armed only when > 20           default 75
frontRadar : { lane: boolean, transmit: boolean }   lane true = same-lane beam, false = opposite lane
rearRadar  : { lane: boolean, transmit: boolean }
```

| `location` | Docks at (1920x1080 frame) |
|-----------:|----------------------------|
| 1 | bottom right |
| 2 | right, vertically centred |
| 3 | top right |
| 4 | top centre |
| 5 | top left |
| 6 | left, vertically centred |
| 7 | bottom left, 25 % up to clear the sandbox-hud minimap and status bars |
| 8 | bottom centre (overlaps the remote while it is open; the remote draws on top) |
| 9 | centre |

1..7 keep the meaning of the original unit; 8 and 9 complete the 3x3 grid `SanitizeSettings()` accepts.
The app root is zoomed by `window.innerWidth / 1920`, so the dock offsets and the unit keep their 1080p
proportions at 1440p and 4K; `scale` is applied on top with `transform: scale()` from the anchored corner.

## UI -> Lua (`RegisterNUICallback`), 2 callbacks

| Name             | Body                                                                    | Effect |
|------------------|-------------------------------------------------------------------------|--------|
| `CloseRemote`    | `{}`                                                                    | remote.lua `CloseRadarRemote()`: `REMOTE_HIDE` + `SetNuiFocus(false, false)` |
| `UpdateSettings` | the whole settings object, exactly `{ scale, location, fastSpeed, frontRadar: { lane, transmit }, rearRadar: { lane, transmit } }` (`settingsPayload()`) | settings.lua `SanitizeSettings()` + `SaveSettings()`: KVP write + `UPDATE_SETTINGS` echo |

The remote applies each change locally first and then sends the full object; the echo from Lua (clamped
values) wins. The fast threshold is clamped to 0..300 in the UI before it is sent; everything else comes from
fixed option lists.

## Focus and keys

* Lua owns focus. `OpenRadarRemote()` calls `SetNuiFocus(true, true)` and `SetCursorLocation(0.5, 0.8)`;
  the remote is docked bottom centre (`bottom: 24px`) so the cursor lands on it.
* The root layer is `pointer-events: none`; only the remote re-enables pointer events.
* Escape -> `fetchNui('CloseRemote')` while the remote is open; declined (handler returns `false`) while it
  is closed so other inputs keep working. The close button and "Close remote" do the same.
* Keybinds (`Keybinds:Add`, client.lua; players can rebind): `radar_lock` NUMPAD `*`, `radar_remote`
  NUMPAD `/`, `radar_toggle` NUMPAD `-`. The UI shows no key hints (Lua never sends the bound keys).
  `heli_toggle` and `heli_rappell` have no UI.

## Preview scenarios (`ui/preview`)

01 standby, 02 tracking, 03 fast held, 04 locked (one antenna without a reading), 05 flagged plate,
06 remote open, 07 rear antenna off + top centre at 125 % + alerts off + remote, 08 left at 85 % with two
held readings, 09 show then hide then reset (renders nothing), 10 remote at 2560x1440 top right locked,
11 both antennas off at bottom centre, 12 centre at 150 % with two flagged plates.

## Dropped as dead

* `MENU_SHOW` / `MENU_HIDE` from the original unit (a UI-internal menu mode); the remote edits settings
  directly and the `UpdateSettings` body is unchanged.
* `fast.direction`: fast records never carry a direction.
* The React build's redux store, MUI sliders / toggle buttons, `react-router`, `react-toastify`, Inter and
  JetBrains Mono fonts, `bg.png` / `bgr.png`, Segment7 font, Google Fonts.
* The key-hint strip under the unit and in the remote footer (dropped in the dark restyle).
