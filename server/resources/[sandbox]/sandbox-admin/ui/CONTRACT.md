# sandbox-admin: Lua and NUI contract

Source of truth: `client/nui.lua` (the only client file that talks to the page),
with reply shapes from `server/callbacks.lua`, `server/dashboard.lua` and
`sandbox-base`. The Svelte bridge (`src/bridge.js`) and every `call()` in
`src/components` use these names and fields exactly.

## Lua to UI (`SendNUIMessage`): 4 message types

| `type` | `data` | Sent from | Handled in |
|---|---|---|---|
| `SET_USERDATA` | `user` `{ Source, Name, AccountID, Identifier, Groups[], Discord, Mention, Avatar }`, `permission` (highest staff group id: `management`, `dev`, `admin`...), `permissionName` (its display name), `permissionLevel` (number) | `Admin:Client:Menu:RecievePermissionData`, once per session (guarded by `_hasMenu`) | `state/app.svelte.js` `setUserData` |
| `APP_SHOW` | `{ toggles: { ids: bool, invisible: bool } }` (current state of the Self toggles; older Lua sent no data and the UI keeps its last known state) | `OpenMenu()` from `Admin:Client:Menu:Open` (`/admin`, `/staff`, HOME keybind) | `show()` |
| `APP_HIDE` | none | `CloseMenu()` from the `Close` callback, `UI:Client:Reset`, spectate start, customs | `hide()` |
| `COPY` | `{ data: string }` | `CopyClipboard()` from the `Admin:CopyClipboard` export, `/cpcoords`, `/cpproperty` | `state/clipboard.svelte.js` `copyText` (the console's own copy buttons use the same function) |

## Focus

`OpenMenu()` sends `APP_SHOW` then `SetNuiFocus(true, true)`; `CloseMenu()` sends
`APP_HIDE` then `SetNuiFocus(false, false)`. The page never calls `SetNuiFocus`.
Escape and the "Close console" button call `Close`; Lua drops focus and sends
`APP_HIDE`. While a dialog is open, Escape closes the dialog only.
The console is mounted only while visible, so every section fetches fresh data
each time it is opened; `state/nav.svelte.js` remembers the last section.

## UI to Lua (`RegisterNUICallback`): 16 callbacks

| Callback | Body | Reply | Used by |
|---|---|---|---|
| `Close` | `{}` | `"OK"` | Close console, Escape |
| `GetPlayerList` | `{ disconnected: bool }` | online: `[{ Source, Name, AccountID, Character, Groups, Ping }]`; disconnected: `RecentDisconnects` entries `[{ Source, Groups, Name, GameName, ID, Discord, Mention, AccountID, Avatar, Identifier, Level, IsStaff, IsAdmin, Character, Reason, DisconnectedTime }]` (last 60); `false` when not staff | Players (online, left recently), Dashboard (recent disconnects) |
| `GetPlayer` | raw number (server id) | online: `{ Source, Name, GameName, AccountID, Identifier, Discord, Mention, Avatar, Level, Groups, StaffGroup, Character: { First, Last, SID, DOB, Phone, Jobs, Coords } or false, Characters[], Vehicle: { Entity, VIN, Plate, Make, Model, Driver } or number }`; disconnected: the `RecentDisconnects` entry plus `StaffGroup`, `Disconnected = true`, `Reconnected` (new source or `false`); `false` when unknown | Player record, Self (your own character and coordinates) |
| `GetAllPlayersByCharacter` | `{ term: string, page: number }` | `{ players: [{ SID, First, Last, DOB, BankAccount, Jobs, Cash, LastPlayed, Phone, Deleted, User, Online? }], pages }`: `pages` is the total number of matches (10 per page) | Players, "Every character on record" |
| `ActionPlayer` | `{ targetSource, action: "goto" or "bring" or "heal" or "attach" or "marker" }` | `{ success, message }` or `false` | Player record actions, Self "Heal yourself" |
| `KickPlayer` | `{ targetSource, reason }` | result of `Punishment:Kick` or `false` | Kick dialog |
| `BanPlayer` | `{ targetSource, reason, length }` (days, -1 permanent; non-admins 1 to 7) | result of `Punishment.Ban:Source` or `false` | Ban dialog |
| `GetVehicleList` | `{}` | `[{ Entity, VIN, Plate, Make, Model, OwnerId }]` or `false` | Vehicle, Owned vehicles |
| `GetVehicle` | raw number (entity) | `{ Make, Model, VIN, Owned, Owner, Plate, Value, Entity, EntityModel, Coords, Heading, Fuel, Damage: { Engine, Body }, DamagedParts: { Axle, Radiator, Transmission, FuelInjectors, Brakes, Clutch, Electronics } }` or `false` | Vehicle record |
| `ActionVehicle` | `{ model, target, action: "fuel" or "delete" or "locks" or "sitinside" or "explode" or "repair" or "repair_full" or "repair_engine" or "stall" }` (Lua adds `numSeats`) | `{ success, message }` or `false` | Vehicle record actions |
| `GetCurrentVehicle` | `{}` | as `GetVehicle` plus `Seat` (-1 driver, 0.. passenger, or `"Not In Vehicle"`), no `Entity`; `false` when not in a vehicle | Vehicle, Your vehicle |
| `CurrentVehicleAction` | `{ action: "repair" or "repair_full" or "repair_engine" or "explode" or "alarm" or "fuel" or "customs" }` | `{ success, message }` or `false` | Your vehicle actions |
| `StopAllAttach` | `{}` | `"OK"` | Self, Stop spectating |
| `GetPlayerHistory` | `{}` | `{ current, max, queue, history: [{ count, time }] }` (up to 12 samples, one every 30 minutes) | Dashboard |
| `ToggleInvisible` | `{}` | `true` or `false` (level 100) | Self, "Invisible to other players" checkbox |
| `ToggleIDs` | `{}` | `"OK"` | Self, "Show player IDs above heads" checkbox |

## Lua changes made for this console

- `server/callbacks.lua` `Admin:GetPlayerList`: online entries also carry
  `Groups` and `Ping` (`GetPlayerPing`) for the Groups and Ping columns. The UI
  hides both columns when an older server leaves them out.
- `client/nui.lua` `OpenMenu()`: `APP_SHOW` carries `toggles`, read from two new
  accessors, `AdminPlayerIDsActive()` (`client/ids.lua`) and `AdminIsInvisible()`
  (`client/attach.lua`), so the Self checkboxes start in the real state even
  after the debug keybind or a character logout changed it.

## Permission gates (old console behaviour; the server re-checks everything)

- Console flavour: `permission` of `dev` or `management` adds the Vehicle section.
- Level 100: invisibility checkbox.
- Level 90: phone numbers and coordinates of other players, GPS marker, full and
  engine repair, refuel, locks, stall, explode, alarm, customs.
- Level 75: ban, heal yourself, sit inside, delete a vehicle, open a player's vehicle.
- Ban lengths of 1, 2, 3 and 7 days from level 75; 14, 30 days and permanent from level 99.
- On a player record: actions on yourself are hidden (except heal from level 75);
  bring, spectate and kick are disabled with a reason when their level is above
  yours; actions that need a character are disabled with a reason when they have
  none; a disconnected record shows no actions, only a link to the new session
  when they have reconnected.

## Not ported, and why

- Noclip and god mode toggles: no NUI callback exists. Noclip is the END keybind
  and `/noclip` (server-checked through `Admin:NoClip`); god mode is not part of
  this resource.
- The legacy Redux actions `SET_DATA`, `ADD_DATA`, `UPDATE_DATA`, `REMOVE_DATA`,
  `RESET_DATA`, `LOGOUT`, `UPDATE_SEARCH_TERM`, `CLEAR_SEARCH`, `SET_OPACITY_MODE`
  and the MDT search reducer: no Lua sends them.
- "Copy admin site URL" (it pointed at an external site with no Lua behind it),
  avatars, the logo image, audio files and the old fonts.
- The "Esc closes the console" hint: no key hints anywhere.

## Lua quirks the UI works around

- `ActionPlayer` never calls `cb` for `marker`; the UI sends it with a 2 second
  timeout and reports success without waiting.
- `GetAllPlayersByCharacter` returns the total count under `pages`; the UI
  divides by 10 (`PER_PAGE`).
- `"OK"` replies are not JSON; `fetchNui` returns the string, which counts as success.
- Every call has an 8 second timeout so a missing `cb` cannot leave a section loading.
- Lua messages arrive in Title Case ("Vehicle Repaired Fully"); the UI shows them
  in sentence case.

## Preview-only hook

`scripts/preview.mjs` can only post window messages, so scenarios choose a
screen with `{ "raw": { "previewRoute": "/players" } }`. The object has no
`type`, Lua never sends it, and it is not part of the contract
(`previewRoute` in `src/state/nav.svelte.js`). Routes: `/`, `/players`,
`/disconnected-players`, `/players-characters`, `/player/<id>`,
`/player/<id>/kick`, `/player/<id>/ban`, `/self`, `/current-vehicle`,
`/vehicles`, `/vehicle/<entity>`.

## Preview scenarios (`ui/preview`)

01 dashboard, 02 players, 03 players empty, 04 left recently, 05 character
search, 06 owned vehicles, 07 player record, 08 disconnected record, 09 player
not found, 10 vehicle record, 11 your vehicle, 12 not in a vehicle, 13 staff
dashboard with no samples, 14 level 50 player record, 15 kick dialog (replaces
the old router "not found" page, which no longer exists), 16 no staff profile,
17 hidden, 18 ban dialog, 19 Self at level 100, 20 Self at level 50, 21 player
record at 2560x1440, 22 player list refused by the server.
