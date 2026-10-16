# sandbox-admin — Lua ↔ NUI contract

Extracted from `client/nui.lua` (the only client file that talks to the page)
with data shapes from `server/callbacks.lua`, `server/server.lua`,
`server/dashboard.lua` and `sandbox-base/core/sv_player.lua`. The Lua side is
the source of truth; the UI's reducers (`ui/src/features/*`) and `fetchNui`
calls follow these names and field names exactly.

## Lua → UI (`SendNUIMessage`) — 4 message types

| `type` | `data` | Sent from | Reducer |
|---|---|---|---|
| `SET_USERDATA` | `user` `{ Source, Name, AccountID, Identifier, Groups[], Discord, Mention, Avatar }`, `permission` (highest staff group id: `management`/`dev`/`admin`…), `permissionName` (its display name), `permissionLevel` (number) | `Admin:Client:Menu:RecievePermissionData`, once per session (guarded by `_hasMenu`), fired by the `Characters:Spawning` middleware | `features/app` |
| `APP_SHOW` | none | `OpenMenu()` ← `Admin:Client:Menu:Open` (`/admin`, `/staff`, HOME keybind) | `features/app` (`visible = true`) |
| `APP_HIDE` | none | `CloseMenu()` ← `Close` callback, `UI:Client:Reset`, spectate start, customs | `features/app` (`visible = false`) |
| `COPY` | `data` (string) | `CopyClipboard()` ← `Admin:CopyClipboard` export, `/cpcoords`, `/cpproperty` | `features/clipboard` (recorded; `ClipboardBridge` performs the copy) |

## NUI focus

`OpenMenu()` sends `APP_SHOW` then `SetNuiFocus(true, true)`; `CloseMenu()`
sends `APP_HIDE` then `SetNuiFocus(false, false)`. The page never assumes
focus: Escape and the Close button both call the `Close` callback and Lua
drops focus. `CloseMenu()` is also called from `Admin:Client:Attach`
(spectate) and one second after `CurrentVehicleAction { action = "customs" }`.

## UI → Lua (`RegisterNUICallback`) — 16 callbacks

| Callback | Body the Lua reads | Reply | Used by |
|---|---|---|---|
| `Close` | — | `"OK"` | Escape, Close button |
| `GetPlayerList` | `{ disconnected: bool }` | online: `[{ Source, Name, AccountID, Character }]`; disconnected: `RecentDisconnects` entries `[{ Source, Groups, Name, GameName, ID, Discord, Mention, AccountID, Avatar, Identifier, Level, IsStaff, IsAdmin, Character, Reason, DisconnectedTime }]` (last 60); `false` when not staff | Online players, Disconnected |
| `GetPlayer` | raw number (server id) | online: `{ Source, Name, GameName, AccountID, Identifier, Discord, Mention, Avatar, Level, Groups, StaffGroup, Character:{First,Last,SID,DOB,Phone,Jobs,Coords}|false, Characters[], Vehicle:{Entity,VIN,Plate,Make,Model,Driver}|number }`; disconnected: the `RecentDisconnects` entry + `StaffGroup`, `Disconnected=true`, `Reconnected` (new source or `false`); `false` when unknown | Player view |
| `GetAllPlayersByCharacter` | `{ term: string, page: number }` | `{ players: [{ SID, First, Last, DOB, BankAccount, Jobs, Cash, LastPlayed, Phone, Deleted, User, Online? }], pages }` — note `pages` is the **total document count** (10 per page) | Find characters |
| `ActionPlayer` | `{ targetSource, action: "goto"|"bring"|"heal"|"attach"|"marker" }` | `{ success, message }` or `false` | Player view |
| `KickPlayer` | `{ targetSource, reason }` | result of `Punishment:Kick` or `false` | Player view (menu) |
| `BanPlayer` | `{ targetSource, reason, length }` (`length` −1..90 days; non-admins 1..7) | result of `Punishment.Ban:Source` or `false` | Player view (menu) |
| `GetVehicleList` | — | `[{ Entity, VIN, Plate, Make, Model, OwnerId }]` or `false` | Owned vehicles |
| `GetVehicle` | raw number (entity id) | `{ Make, Model, VIN, Owned, Owner, Plate, Value, Entity, EntityModel, Coords, Heading, Fuel, Damage:{Engine,Body}, DamagedParts:{Axle,Radiator,Transmission,FuelInjectors,Brakes,Clutch,Electronics} }` or `false` | Vehicle view |
| `ActionVehicle` | `{ model, target, action: "fuel"|"delete"|"locks"|"sitinside"|"explode"|"repair"|"repair_full"|"repair_engine"|"stall" }` (client adds `numSeats` from `model`) | `{ success, message }` or `false` | Vehicle view |
| `GetCurrentVehicle` | — | same as `GetVehicle` plus `Seat` (−1 driver, 0… passenger, or `"Not In Vehicle"`), no `Entity`; `false` when not in a vehicle | Current vehicle |
| `CurrentVehicleAction` | `{ action: "repair"|"repair_full"|"repair_engine"|"explode"|"alarm"|"fuel"|"customs" }` | `{ success, message }` or `false` | Current vehicle |
| `StopAllAttach` | — | `"OK"` | Sidebar tool |
| `GetPlayerHistory` | — | `{ current, max, queue, history: [{ count, time }] }` (≤ 12 samples, one every 30 min) | Dashboard |
| `ToggleInvisible` | — | `true`/`false` | Sidebar tool (level ≥ 100) |
| `ToggleIDs` | — | `"OK"` | Sidebar tool |

## Permission gates (mirrors legacy UI + server checks)

* Console flavour: `permission` ∈ {`dev`, `management`} → admin navigation
  (adds Owned vehicles, Current vehicle); anything else → staff navigation.
* `permissionLevel ≥ 100`: invisibility toggle.
* `≥ 90`: phone numbers, coordinates, GPS marker, full/engine repair, refuel,
  locks, stall, explode, alarm, customs.
* `≥ 75`: ban, sit inside, delete vehicle, open a player's vehicle.
* Ban lengths 1/2/3/7 days from level 75; 14/30/permanent from level 99.

## Dead UI not ported (no Lua trigger)

* Redux actions `SET_DATA`, `ADD_DATA`, `UPDATE_DATA`, `REMOVE_DATA`,
  `RESET_DATA`, `LOGOUT`, `UPDATE_SEARCH_TERM`, `CLEAR_SEARCH` and
  `SET_OPACITY_MODE` (`grep -r` over `client/` finds none of them; the last was
  a hover effect dispatched by the UI itself).
* `searchReducer` (MDT leftovers: people/vehicle/firearm/report/warrant).
* `assets/audio/panic*.mp3`, `assets/font/*.ttf`, `globalStyles.js`
  (`pricedown.ttf`, never imported), `favicon.ico`, Google-hosted "Exo" font.
* The Kick/Ban buttons were commented out in the legacy player page but their
  callbacks are live and permission-checked on the server, so they are
  available behind the "More actions" menu with a confirmation dialog.

## Preview-only hook

`scripts/preview.mjs` can only post window messages, so scenarios pick a page
with `{ "raw": { "previewRoute": "/players" } }`. That object has no `type`,
`NuiBridge` ignores it, and it is **not** part of the Lua contract
(`src/components/shell/PreviewRouteListener.jsx`).

## Lua quirks the UI works around

* `Admin:ActionPlayer` never calls `cb` for `action == "marker"`; the UI fires
  it with a short timeout and does not wait for a reply.
* `GetAllPlayersByCharacter` returns the total count under `pages`; the UI
  divides by the server's `PER_PAGE` (10).
* `GetVehicleList` entries may lack `OwnerId` (`Owner?.Id`); shown as Unknown.
* Replies that are the string `"OK"` are not JSON; `fetchNui` yields `null`.
