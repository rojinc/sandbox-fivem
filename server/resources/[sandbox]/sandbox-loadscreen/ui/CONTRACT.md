# sandbox-loadscreen: UI contract

This NUI is a FiveM **loading screen** (`loadscreen 'ui/dist/index.html'` in
`fxmanifest.lua`), not a regular `ui_page`. It is shown from the moment the
client joins until a Lua script calls `ShutdownLoadingScreenNui()`, because the
manifest sets `loadscreen_manual_shutdown 'yes'`.

Nothing in this resource sends `SendNUIMessage` and nothing registers a NUI
callback. The screen is driven entirely by the game's native loading-screen
events plus optional handover data. It is a Svelte 5 app on `@sandbox/ui-kit`
(GOLD look): `src/bridge.js` listens on `window` and mutates the rune state in
`src/state/loading.svelte.js`; the components only read that state.

## Game → UI: native events

The game posts plain objects on `window` `'message'`. They carry an
`eventName` field, **not** the `{ type, data }` shape used by `SendNUIMessage`.
The kit's `onNui` does not apply: it keys on `msg.type ?? msg.action ??
msg.eventName`, and the init-function events carry their own `type` field
(`INIT_SESSION`, `MAP`, `onDataFileEntry.type: 20`) that would shadow the event
name. `src/bridge.js` therefore installs a plain `'message'` listener keyed by
`eventName` and hands the raw message to `applyLoadEvent()`.

Reference: https://docs.fivem.net/docs/scripting-manual/nui-development/loading-screens/

| `eventName`              | Fields                                            | What the UI does with it |
| ------------------------ | ------------------------------------------------- | ------------------------ |
| `loadProgress`           | `loadFraction: number` (0..1)                     | Big bar + percentage in the status card and the rail along the bottom edge. Kept monotonic (never moves back). |
| `onLogLine`              | `message: string`                                 | Shown as the mono detail line under the checklist. |
| `startDataFileEntries`   | `count: number`                                   | Step "Game data" becomes active; headline "Loading game data" (unless an init batch is running); detail "N data file entries". |
| `onDataFileEntry`        | `name: string`, `type: number`, `isNew: boolean`  | Detail line shows `name`. |
| `performMapLoadFunction` | `idx: number`                                     | Headline "Loading the map" (unless an init batch is running); detail "map load function N". |
| `endDataFileEntries`     | –                                                 | Ignored (counted as activity only). |
| `startInitFunction`      | `type: string`                                    | Headline and active step from `type` (see below); clears the batch counter. |
| `startInitFunctionOrder` | `type: string`, `order: number`, `count: number`  | Same as above, plus an `invoked / count` counter for this batch. |
| `initFunctionInvoking`   | `type: string`, `name: string`, `idx: number`     | Detail line shows the function `name`. |
| `initFunctionInvoked`    | `type: string`, `name: string`                    | Increments the batch counter when `type` matches the current batch. |
| `endInitFunction`        | `type: string`                                    | For `INIT_SESSION`: everything is loaded; step "Server sync", headline "Syncing with the server", bar turns green, header tag "Almost there". Other types are ignored. |

Any other `eventName`, or a message without one, is ignored. The first
recognised event moves the checklist from "connecting" (no active step) to
"Game data".

### Init-function `type` values

| `type`                     | Step      | Headline                 |
| -------------------------- | --------- | ------------------------ |
| `INIT_CORE`                | Game data | Loading core game data   |
| `INIT_BEFORE_MAP_LOADED`   | World     | Preparing the world      |
| `INIT_AFTER_MAP_LOADED`    | World     | Populating the world     |
| `INIT_SESSION`             | Session   | Joining the session      |
| `MAP`                      | Game data | Loading the map          |
| anything else              | Game data | "Loading " + prettified type |

Steps never move backwards: the checklist is `Game data → World → Session →
Server sync`. "Server sync" is the state after `endInitFunction INIT_SESSION`
while the screen waits for Lua to shut it down.

### Header tag (`statusLabel`)

`Connecting` (no event yet) → `Loading data` → `Building the world` →
`Joining session` → `Almost there` (finished).

## Handover data (`window.nuiHandoverData`)

The server can pass values to the loading screen with `deferrals.handover({...})`
during `playerConnecting`; they appear as `window.nuiHandoverData` before the
page scripts run. `src/state/handover.svelte.js` reads them once at start-up
and tolerates their absence:

| Key               | Type   | Shown as |
| ----------------- | ------ | -------- |
| `name`            | string | "Welcome back, {name}" instead of "Welcome to Los Santos". |
| `priority`        | number | A solid warning "Priority N" tag next to the welcome line when > 0. |
| `priorityMessage` | string | A short line under the headline when `priority` > 0. |

At the time of writing the call that sends them is **commented out** in
`sandbox-queue/server/server.lua` (`ply.Deferrals.handover({ name, priority,
priorityMessage })`), so in production the screen shows the generic welcome.
Re-enabling that block lights the personalised variant without UI changes.

### Preview-only message

`{ type: 'HANDOVER', data: { name, priority, priorityMessage } }` feeds the same
state from a preview scenario (`07-welcome-back.json`), because the harness
cannot set `window.nuiHandoverData` before load. Nothing in Lua sends it.

## UI → Lua

None. The loading screen has no keyboard focus and nothing to click
(`pointer-events: none` on the root).

## Shutdown

`sandbox-base/core/cl_core.lua` (`COMPONENTS.Core.Init`) and
`sandbox-base/core/cl_spawn.lua` (`COMPONENTS.Spawn.Init`) call
`ShutdownLoadingScreenNui()` once the player is ready. Until then the screen
stays up, which is why the "Server sync" state exists.

## Layout

Designed in px for 1920x1080: navy header band (wordmark, "Loading Los Santos",
status tag), white status card bottom-left (welcome line, stage headline,
`ProgressBar` lg with the percentage, four-step checklist, mono detail line),
rules/tips callout bottom-right rotating every 9 s, 6 px teal rail along the
bottom edge. The frame is zoomed 1.3x from 2200 px wide and 1.9x from 3400 px
(`App.svelte`), so 1440p and 4K keep the 1080p proportions.

## Previewing

`ui/preview/*.json` scenarios use the `raw` form so the preview script posts
the object verbatim, exactly as the game does:

```json
{ "raw": { "eventName": "loadProgress", "loadFraction": 0.42 } }
{ "raw": { "eventName": "startInitFunctionOrder", "type": "MAP", "order": 1, "count": 10 } }
```

Run `node scripts/preview.mjs --ui sandbox-loadscreen` from the repository
root; screenshots land in `.preview/sandbox-loadscreen/`.
