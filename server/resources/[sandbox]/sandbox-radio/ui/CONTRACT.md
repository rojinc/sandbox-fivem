# sandbox-radio NUI contract

Source of truth: `client/main.lua` and `client/utils.lua`. Every `SendNUIMessage({ type, data })`
below is routed by `ui/src/bridge.js` into the rune state in `ui/src/state/radio.svelte.js`;
every `RegisterNUICallback` is called with `fetchNui(name, body)` from `ui/src/components/Handset.svelte`
and `ui/src/App.svelte`. The handset floats bottom-right over the game world in the GOLD dark palette.

## Lua → UI (`SendNUIMessage`)

| `type` | `data` | Sent from | Notes |
|---|---|---|---|
| `APP_SHOW` | none | `OpenRadio()` (main.lua:156) | Sent right after `SetNuiFocus(true, true)`. Triggered by keybind `voip_radio_open` or by event `Radio:Client:OpenUI` (radio items used from the inventory, see sandbox-voip). Mounts the handset and focuses the frequency box. |
| `APP_HIDE` | none | `CloseRadio()` (main.lua:217) | Sent right after `SetNuiFocus(false, false)`. Triggered by the `Close` callback, `UI:Client:Reset`, `Characters:Client:Logout`, or when the character loses the radio item. Unmounts the handset and drops any pending request / notice. |
| `UPDATE_DATA` | `frequency` number (0 = no channel, one decimal), `frequencyName` string ("" unless a named job channel), `power` boolean, `volume` number (0–200, step 10, rounded), `type` number or `false` (1 Encrypted, 2 B0085/Extendo, 3 P6900/Civ; `false` = no radio), `typeName` string, `maskRadio` boolean | `SendUpdates()` (main.lua:239) | Sent on spawn, radio type change, power toggle, volume change, HUD config change while on a channel, and after every channel request (accepted **or refused**). Also sent while the UI is hidden, so the state accepts it regardless of `open`. **Not** sent when a requested channel equals the current one. |
| `UPDATE_DATA` (logout) | `frequency = 0`, `frequencyName = ""`, `power = false`, `volume = 100` | `Characters:Client:Logout` (main.lua:130) | Reduced payload **without** `type`/`typeName`/`maskRadio`; missing fields keep their previous values. |

`maskRadio` mirrors `HUDConfig.maskRadio` (the sandbox-hud setting that hides the channel from
stream viewers). When true and on a channel the readout shows `???.?` and "Channel hidden",
exactly like the HUD status pill. It was added to the payload in this port (main.lua:230–237, 249
and the `Characters:Client:Updated` resend at main.lua:351); the UI treats it as optional.

Named channels (only via `frequencyName`): `Emergency #1`–`#20` (police/ems/prison on duty),
`Poggers` (21, dgang on duty), `Mald` (22, blackline). Channels 23–99 are never granted; ≥ 100
are open within the radio's range.

## UI → Lua (`RegisterNUICallback`)

| Callback | Body the UI sends | What Lua reads | Effect |
|---|---|---|---|
| `Close` | `{}` | nothing | `CloseRadio()`: drops NUI focus, sends `APP_HIDE`. Sent by the close button and **Escape**. |
| `TogglePower` | `{}` | nothing | If the character has a radio: toggles power, restores the last frequency on power-on, plays the on/off sound, replies with `UPDATE_DATA`. |
| `SetChannel` | `{ frequency: number }` | `data.frequency` → `tonumber()` → `Utils:Round(x, 1)` | Plays a click, then `SetCharacterRadioFrequency()`. Lua validates power, the radio's range (`config.lua` `_radioData`) and channel authorisation and shows its own Notification on refusal. Replies with `UPDATE_DATA` whether accepted or refused (frequency unchanged when refused). Nothing is sent back when the value equals the current frequency, so the UI never sends that case. Sent by **Tune** / Enter in the frequency box and by **Channel up / down** (±1 kept inside the radio's range; stepping below the minimum sends `0` = leave channel). |
| `VolumeUp` / `VolumeDown` | `{}` | nothing | ±10, clamped 0–200, persisted in VOIP settings; replies with `UPDATE_DATA`. Sent by the Volume buttons and **Arrow Up / Down**. |
| `ClickVolumeUp` / `ClickVolumeDown` | `{}` | nothing | ±5 on the click-sound volume (0–200) and plays a click at the new level. The value is **never** sent to the UI, so the "Clicks quieter / louder" buttons have no readout. |

## Round-trip bookkeeping (UI only)

`SetChannel` sets `radio.pending`; the next `UPDATE_DATA` clears it and raises a 2.2 s notice:
`tuned` when the frequency now equals the request, `refused` otherwise. A request that gets no
answer within 1.5 s is dropped. The header Tag shows, in priority order: **Off**, **Tuning**,
**Refused**, **Tuned**, **Receiving** (on a channel), **No channel**. Lua sends no transmit state
to this resource, so there is no "Transmitting" tag (sandbox-voip keeps `RADIO_TALKING` to itself
and only reports it to the HUD voice indicator).

## Focus and keys

* `OpenRadio()` calls `SetNuiFocus(true, true)` then sends `APP_SHOW` (main.lua:162).
* `CloseRadio()` calls `SetNuiFocus(false, false)` then sends `APP_HIDE` (main.lua:221).
* The UI never calls `SetNuiFocus`. Escape → `Close`; Lua drops focus and hides the UI.
* Every key handler returns `false` while the handset is closed so nothing is swallowed.
* The frequency box is focused on open; Enter submits it. Arrow Up / Down change the volume.

## Ranges shown as hints (mirrored from `config.lua`)

`src/lib/ranges.js` mirrors `_radioData` (1: 1–9999, 2: 100–2000, 3: 100–1000) to show
"Range …" on the readout, the input placeholder, an out-of-range warning under the box and to
clamp Channel up / down. Every request is still sent to Lua, which is the authority; a refusal
arrives as `UPDATE_DATA` with the frequency unchanged.

## Dropped (dead, UI-only or contradicted by Lua)

* The on-screen numeric keypad and global digit key capture of the React handset: a kit
  `TextInput` with the browser's own editing replaces both.
* The four "memory" slots (recent channels persisted in `localStorage`): UI-only invention with
  no Lua counterpart; not carried over.
* `KeyListener` mapped `keyCode 127` to `Close`. Browsers never emit 127 on keydown, so it never
  fired. Only Escape is kept.
* The old frequency field had `max: 999`, contradicting Lua's ranges (up to 9999 on the encrypted
  radio). Not ported.
* `SetChannel` used to be sent as a string (`(+freq).toFixed(1)`), which made Lua's
  `input ~= RADIO_FREQUENCY` guard always true. The UI sends a number.
* Antenna, speaker grille, backlit LCD, glass reflection: decoration outside the GOLD rules.
