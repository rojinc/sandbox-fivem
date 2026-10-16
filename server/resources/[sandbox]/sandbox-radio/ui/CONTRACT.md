# sandbox-radio NUI contract

Source of truth: `client/main.lua` and `client/utils.lua`. Every `SendNUIMessage({ type, data })`
below is routed by `ui/src/bridge.js` into the rune state in `ui/src/state/radio.svelte.js`;
every `RegisterNUICallback` is called with `fetchNui(name, body)` from `ui/src/lib/actions.js`, which the
knobs, the power key, the soft keys and the keyboard all share. The handset is drawn inside its picture
(`ui/src/assets/radio_frame.webp`), bottom-right over the game world; see "The handset" below.

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
| `Close` | `{}` | nothing | `CloseRadio()`: drops NUI focus, sends `APP_HIDE`. Sent by **Escape** (a real handset has no close button). |
| `TogglePower` | `{}` | nothing | If the character has a radio: toggles power, restores the last frequency on power-on, plays the on/off sound, replies with `UPDATE_DATA`. Sent by the power key on the handset. |
| `SetChannel` | `{ frequency: number }` | `data.frequency` → `tonumber()` → `Utils:Round(x, 1)` | Plays a click, then `SetCharacterRadioFrequency()`. Lua validates power, the radio's range (`config.lua` `_radioData`) and channel authorisation and shows its own Notification on refusal. Replies with `UPDATE_DATA` whether accepted or refused (frequency unchanged when refused). Nothing is sent back when the value equals the current frequency, so the UI never sends that case. Sent by Enter in the frequency entry, the **Tune** soft key, and the **Ch** soft keys (±1 kept inside the radio's range; stepping below the minimum sends `0` = leave channel). |
| `VolumeUp` / `VolumeDown` | `{}` | nothing | ±10, clamped 0–200, persisted in VOIP settings; replies with `UPDATE_DATA`. Sent by the tall knob (right half / left half, or the mouse wheel over it) and **Arrow Up / Down**, only while the radio is on. |
| `ClickVolumeUp` / `ClickVolumeDown` | `{}` | nothing | ±5 on the click-sound volume (0–200) and plays a click at the new level. Sent by the short knob (right half / left half, or the mouse wheel over it). The value is **never** sent to the UI, so the screen only says "Click sound Louder / Quieter" for a moment. |

## Round-trip bookkeeping (UI only)

`SetChannel` sets `radio.pending`; the next `UPDATE_DATA` clears it and raises a 2.2 s notice:
`tuned` when the frequency now equals the request, `refused` otherwise. A request that gets no
answer within 1.5 s is dropped. A small word above the channel shows, in priority order:
**Tuning 1337.5**, **Refused 1337.5** (error colour), **Tuned** (success colour), **Receiving**
(on a channel), **Standby** (no channel). Power off blanks the whole screen. Lua sends no transmit
state to this resource, so there is no "Transmitting" word (sandbox-voip keeps `RADIO_TALKING` to
itself and only reports it to the HUD voice indicator); the signal bars are lit while on a channel.

Turning a knob (click, wheel or arrow key) replaces the channel readout for 1.4 s with what it did
(`radio.osd`): "Volume 110%" with a 10-step meter, or "Click sound Louder / Quieter".

## Focus and keys

* `OpenRadio()` calls `SetNuiFocus(true, true)` then sends `APP_SHOW` (main.lua:162).
* `CloseRadio()` calls `SetNuiFocus(false, false)` then sends `APP_HIDE` (main.lua:221).
* The UI never calls `SetNuiFocus`. Escape → `Close`; Lua drops focus and hides the UI.
* Every key handler returns `false` while the handset is closed so nothing is swallowed.
* The frequency entry on the screen is focused on open and on power-on; Enter submits it. Knobs, the
  power key and soft keys cancel `mousedown` so the caret stays in the entry and digits keep typing.
* Arrow Up / Down change the volume (only while the radio is on).

## The handset

`src/lib/frame.js` holds the geometry measured from `radio_frame.webp` (276 × 572): the screen
cut-out (60, 248, 156 × 255), the tall volume knob, the short click-sound knob and the power pill.
Everything is drawn at 1.25× for 1920 × 1080 (345 × 715 px, the size of the old React handset) and
the dock is zoomed by `min(innerWidth / 1920, innerHeight / 1080)`, so 1440p / 4K scale up and
ultrawide screens do not get a handset taller than the screen. It slides in from the bottom-right
(200 ms, none with reduced motion).

* The frame image sits on top with `pointer-events: none`; the screen sits behind the cut-out.
* Screen (`components/Screen.svelte`), a dim backlit LCD (`--au-bg-sunk`; black `--hud-black` when
  off) with every readable line at 16px or more: status row (model from `typeName` without the
  "Radio" suffix, signal bars, a small volume bar and %), the state word, the channel number in
  Roboto Mono, the channel name, the frequency entry (kit `TextInput`: label "Frequency", hint
  "100 to 2000" under it, which turns into the error "Use 100 to 2000" when the typed value is out of
  range or not a frequency), and three soft keys: Ch down, Tune (shown while the entry holds a
  frequency), Ch up.
* Hotspots (`components/Handset.svelte`): each knob is split into a left (down) and right (up) half
  with a `title` tooltip; hovering lightens only the knob's metal (an ink layer masked with the
  frame's own alpha); keyboard focus shows the kit's gold outline. The wheel over a knob turns it, one step per 90 ms. The power key is the pill
  in the bottom rocker.

## Ranges shown as hints (mirrored from `config.lua`)

`src/lib/ranges.js` mirrors `_radioData` (1: 1–9999, 2: 100–2000, 3: 100–1000) for the entry's
hint and error, and to clamp the Ch soft keys (the one at the end of the range is disabled).
A radio with no known type uses 1 to 9999. Every request is still sent to Lua, which is the authority; a refusal
arrives as `UPDATE_DATA` with the frequency unchanged.

## Dropped (dead, UI-only or contradicted by Lua)

* The on-screen numeric keypad and global digit key capture of the React handset: the entry on
  the screen keeps focus instead (knobs and soft keys never take it), and only digits and one
  separator are accepted.
* The four "memory" slots (recent channels persisted in `localStorage`): UI-only invention with
  no Lua counterpart; not carried over.
* `KeyListener` mapped `keyCode 127` to `Close`. Browsers never emit 127 on keydown, so it never
  fired. Only Escape is kept.
* The old frequency field had `max: 999`, contradicting Lua's ranges (up to 9999 on the encrypted
  radio). Not ported.
* `SetChannel` used to be sent as a string (`(+freq).toFixed(1)`), which made Lua's
  `input ~= RADIO_FREQUENCY` guard always true. The UI sends a number.
* The screen wallpaper (`background.webp`) and any glass reflection: decoration outside the design
  rules. The LCD is one flat dark colour.
* The close button and the labelled button panel of the first Svelte pass: the handset is controlled
  through its own parts.
