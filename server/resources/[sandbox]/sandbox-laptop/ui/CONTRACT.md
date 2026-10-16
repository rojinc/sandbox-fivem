# sandbox-laptop NUI contract

Svelte 5 UI in `ui/src`, built to `ui/dist` (served by `ui_page 'ui/dist/index.html'`).
Every Lua -> UI message is `SendNUIMessage({ type = 'X', data = {...} })` and lands in
`src/bridge.js`. Every UI -> Lua call is `fetchNui(name, body)` answered by a
`RegisterNUICallback(name, function(data, cb) ... end)`.

Sources read for this file: `client/main.lua`, `client/component.lua`, `client/data.lua`,
`client/apps/*/*.lua`, `server/main.lua`, `server/component.lua`, `server/apps/**`.

Note on Lua tables: an empty Lua table arrives as `[]`, so every map the UI reads
(`LaptopPermissions`, `JobPermissions`, `appNotifications`, `action`, `data`) is
treated as "empty" when it is an array.

## Focus

Lua owns focus. `Laptop:Open()` sends `LAPTOP_VISIBLE` then `SetNuiFocus(true, true)`;
`Laptop:Close()` sends `CLEAR_HISTORY` and `ALERTS_RESET` (plus
`LAPTOP_NOT_VISIBLE_FORCED` first when forced) and calls `SetNuiFocus(false, false)`.
The UI never calls `SetNuiFocus`. To close, the UI hides itself and calls `CloseLaptop`
(Escape, F3, or the "Close laptop" button in the taskbar). Escape is ignored while a
dialog is open (the dialog takes it).

Close flow: `CloseLaptop` -> Lua `Laptop:Close()` -> `CLEAR_HISTORY` -> the UI hides,
waits 2 seconds (the old slide-out time) and calls `CDExpired`, which clears Lua's
open cooldown (`_openCd`). If `LAPTOP_VISIBLE` arrives inside those 2 seconds the UI
calls `CDExpired` straight away. Open windows survive a close (as before); they are
dropped by `CLOSE_ALL_APPS` (logout).

## Lua -> UI messages

| type | data | UI behaviour |
|---|---|---|
| `LAPTOP_VISIBLE` | none | Show the laptop. |
| `LAPTOP_NOT_VISIBLE` | none | Hide and call `CloseLaptop` (old reducer did the same; Lua sends it on logout). |
| `LAPTOP_NOT_VISIBLE_FORCED` | none | Hide only (`Laptop:Close(true)`: death, LAPTOP state removed). |
| `CLEAR_HISTORY` | none | Hide; after 2 s call `CDExpired`. |
| `ALERTS_RESET` | none | Drop the short in-laptop feedback messages. |
| `UI_RESET` | `{}` | Hide, drop dialogs and feedback; if the laptop was open, call `CloseLaptop` so Lua's `laptopOpen` flag clears (client/main.lua checks `tabletOpen`, which is never set). |
| `CLOSE_ALL_APPS` | none | Close every window (logout). |
| `SET_APPS` | `{ [name]: { name, label, storeLabel, icon, color, params, hidden, canUninstall, store, unread, restricted?, requirements?, fake?, size? } }` | App catalogue (server/startup.lua from `_appData`). `restricted` = `{ state?: string \| string[], job?, jobPermission?, laptopPermission?, reputation?, reputationAmount? }`; every key must pass. |
| `SET_TIME` | `GlobalState["Sync:Time"]` = `{ hour, minute }` | Taskbar clock (every 15 s). |
| `LOAD_PERMS` | any | Stored, unused (Lua never calls `Laptop.Permissions:Load`). |
| `SET_DATA` | `{ type, data }` | `data[type] = data` (nil clears). |
| `ADD_DATA` | `{ type, data, key? }` | Array: push. Map: `key` ? `map[key] = data` : merge. Missing: `[data]`. |
| `UPDATE_DATA` | `{ type, id, data }` | Array: replace items whose `_id == id`. Map: `map[id] = data`. |
| `REMOVE_DATA` | `{ type, id }` | Array of objects: drop `_id == id`; array of values: drop `== id`. Map: delete `id`. |
| `RESET_DATA` | none | Back to `{ disabledBoostingContracts: [] }`. |
| `NOTIF_ADD` | `{ notification: { _id?, title, description, time, duration, app, action, data, show } }` | `duration` ms, `-1` = stays until removed. `app` is an app name or an object `{ label, icon, color }`. `action` = `{ view?, accept?, cancel? }` (event names). `_id` given (AddWithId) replaces the notification with that id. |
| `NOTIF_UPDATE` | `{ id, title, description }` | Update text of `_id == id`. |
| `NOTIF_HIDE` | `{ id }` | Remove `_id == id`. |
| `NOTIF_DISMISS_ALL` | none | Remove all. |

Data keys Lua sets (`SET_DATA` unless noted): `player` (character data: `SID`, `First`,
`Last`, `Jobs`, `States`, `Profiles.redline`, `Reputations`, `LaptopApps { home, installed }`,
`LaptopSettings { wallpaper, colors, notifications, volume, appNotifications, zoom, texttone }`,
`LaptopPermissions`, `BoostingContracts`), `items` (item definitions, unused),
`onDuty` (job id or false), `JobPermissions` (`{ [jobId]: { [perm]: true } }`), `JobData`,
`myGroup` (team or nil), `boostingQueue` (`{ joined, source, SID, team, admin }` or nil),
`disabledBoostingContracts` (ADD/REMOVE of contract ids), `businessLogo`, `businessPages`
(`[{ id, icon, label, permission?, hidden? }]`), `businessNotices` (ADD/REMOVE by `_id`).

### Preview only (never sent by Lua)

| type | data | |
|---|---|---|
| `PREVIEW_OPEN` | `{ app, page?, id? }` | Opens an app window (and a BizWiz page) so `ui/preview` scenarios can show it. |

## Notifications

Shown with the kit Toast look. While the laptop is open they sit at the top right of the
screen; while it is closed, at the bottom right of the game screen. Only notifications for
apps the player can use are shown (or for `app` objects). Timed ones disappear `duration`
ms after they arrive; `-1` ones stay (pinned). A notification with `action.view` opens its
app when clicked (laptop open). One with `action.accept` / `action.cancel` opens as a kit
Modal while the laptop is open:

- Accept -> `AcceptPopup` `{ event: action.accept, data }`
- Decline -> `CancelPopup` `{ event: action.cancel, data }`

Lua triggers the event (server event when `data.server` is set). Answers `"OK"`.
Team and boosting requests use `Laptop:Client:Teams:RequestNotifAccept/Deny` with
`data = { request }`.

## UI -> Lua callbacks

Shell

| name | body | answer |
|---|---|---|
| `CloseLaptop` | `{}` | `"OK"`; Lua runs `Laptop:Close()`. |
| `CDExpired` | `{}` | `"OK"`; clears `_openCd`. |
| `AcceptPopup` / `CancelPopup` | `{ event, data }` | `"OK"` |
| `UpdateSetting` | `{ type, val }` | `"OK"` straight away; server saves `LaptopSettings[type] = val`. Used types: `wallpaper` (preset key `wallpaper`, `wallpaper2`..`wallpaper10`, or an image URL), `notifications` (bool), `volume` (0-100), `appNotifications` (`{ [app]: true }` = muted; read by `Laptop.Notification:Add`). |

LS Underground (`client/apps/lsu/app.lua`)

| name | body | answer |
|---|---|---|
| `GetLSUDetails` | `{}` | `{ chopList, reputations, items, banned, canBoost }` or `false`. `chopList` = nil (below Chopping rank 3) or `{ Public: { list, public }, Private?: {...}, "Chop List #n": { id, list } }`, list = `[{ name, hv }]`. `reputations` = `[{ id, label, value, current { level, label, value }, next { level, label, value } }]`. `items` = `[{ id, item, itemData { label }, coin, price, qty (-1 unlimited), delayed?, rep?, repLvl? }]`. `banned` = `LSUNDGBan` (array) or nil. `canBoost` = Chopping level 5. |
| `LSUNDG:Market:Checkout` | cart array `[{ id, quantity, qty, ...item }]` | `{ success, coords }` or `false`; Lua sets the pickup blip and waypoint. |
| `Boosting:EnterQueue` | `{}` | `{ success: true }`, `{ message }` or `false`; server then sets `boostingQueue`. |
| `Boosting:ExitQueue` | `{}` | `true` / `false` |
| `Boosting:AcceptContract` | `{ id, scratch }` | `{ success: true }`, `{ message }` or `false`. On success Lua adds the id to `disabledBoostingContracts` for 2 minutes (the team leader gets an accept/decline notification). `scratch` is ignored by the server; no contract carries `prices.scratch` today. |
| `Boosting:TransferContract` | `{ id, alias }` | `true` / `false` |
| `Boosting:DeclineContract` | `{ id }` | `true` / `false` |
| `Boosting:Admin:CreateContract` | `{ vehicle, make, model, class, trackers, price, skipRep, payoutOverride }` | Lua answers `{ success: false, message }` for an unknown model, else the contract or `false`. Needs `LaptopPermissions.lsunderground.admin`. |
| `Boosting:Admin:GetBans` | `{}` | `[{ SID, First, Last, RacingAlias, LSUNDGBan }]` or `false` |
| `Boosting:Admin:Ban` / `Boosting:Admin:Unban` | `{ SID }` (number) | `true` / `false` |

Contracts come from `player.BoostingContracts`: `[{ id, owner { SID, Alias }, vehicle { vehicle, label, make, model, class, classLevel, rare?, tracker, rewarded? }, prices { standard { price, coin }, scratch? }, expires (unix s) }]`.
Accept is blocked when the player's Boosting level (`current.level`, at least 1) is below
`vehicle.classLevel`, unless `rewarded`.

Teams (`client/apps/teams/app.lua`)

| name | body | answer |
|---|---|---|
| `GetTeams` | `{}` | `[{ ID, Name, State, StateName, Members [{ Leader, Source, SID, First, Last }] }]` |
| `GetTeamRequests` | `{}` | `[{ id, owner, expires (unix s), team (bool), event, label, description, data }]` |
| `CreateTeam` | `{ Name }` | `{ success, team }`, `{ message }` (name taken) or `false`. The server strips spaces from the name. |
| `InviteTeamMember` | `{ SID }` (number) | `{ success: true }` or `false` |
| `RemoveTeamMember` | member `{ SID, Source, ... }` | `true` / `false` (own SID = leave) |
| `DeleteTeam` | `{}` | `true` / `false` (leader, team idle) |
| `RequestTeamInvite` | team `ID` (a bare number) | `true` / `false` |
| `TeamRequest` | `{ ...request, action: 'accept' \| 'deny' }` | `"OK"` |

`myGroup.State` is `0` when idle, `"boosting"` during a contract; members can only change at `0`.

BizWiz (`client/apps/bizwiz/*.lua`). Permissions are job permissions on `JobPermissions[onDuty]`.

| name | body | answer |
|---|---|---|
| `BusinessDocumentSearch` | `{ term }` | `[{ _id, title, notes, pinned, time, author { SID, First, Last }, lastUpdated? }]` or `false` |
| `BusinessDocumentView` | `{ id }` | document or `false` |
| `BusinessDocumentCreate` | `{ doc: { title, pinned, notes, time } }` | `{ _id }` or `false` |
| `BusinessDocumentUpdate` | `{ id, Report: { title, pinned, notes, time, author } }` | `true` / `false` |
| `BusinessDocumentDelete` | `{ id }` | `true` / `false` |
| `BusinessReceiptSearch` | `{ term }` | `[{ _id, type, customerName, customerNumber, paymentAmount, paymentPaid, workers [{ SID, First, Last }], notes, time, author, lastUpdated? }]` or `false` |
| `BusinessReceiptView` | `{ id }` | receipt or `false` |
| `BusinessReceiptCreate` | `{ doc: { type, customerName, customerNumber, paymentAmount, paymentPaid, workers, notes, time } }` | `{ _id }` or `false` |
| `BusinessReceiptUpdate` | `{ id, Report: { ...same fields, time, author } }` | `true` / `false` |
| `BusinessReceiptDelete` | `{ id }` | `true` / `false` |
| `BusinessReceiptDeleteAll` | `{}` | `true` / `false` |
| `CreateBusinessNotice` | `{ doc: { title, description, time } }` | new id or `false`; the server pushes `ADD_DATA businessNotices` to everyone on duty. |
| `DeleteBusinessNotice` | `{ id }` | `true` / `false`; server pushes `REMOVE_DATA`. |
| `BizWizEmployeeSearch` | `{ term, job }` | `[{ SID, First, Last }]` (max 4) or `false`. The old UI never sent `term`, so it only ever saw the first 4 employees. |
| `GetBusinessTwitter` | `{}` | `{ success, pfp }` or `false` |
| `SetBusinessTwitter` | `{ profile }` | the URL or `false` |
| `SendBusinessTweet` | `{ time, content, image { using, link }, likes: [] }` | `true` / `false` |
| `ViewVehicleFleet` | `{}` | `[{ VIN, Make, Model, RegisteredPlate, RegistrationDate, Storage { Name } }]` or `false` |
| `TrackFleetVehicle` | `{ vehicle: VIN }` | `true` / `false` (Lua sets a waypoint) |
| `CasinoGetBigWins` | `{}` | `[{ Type, Prize, Winner { SID, First, Last }, Time }]` or `false` |
| `PDMGetStock`, `PDMRunCredit { term }`, `PDMStartSale`, `DealershipStartTestDrive`, `PDMGetDealerData`, `PDMSaveDealerData { data }`, `PDMGetHistory { value, category, page }`, `PDMGetOwner { VIN }` | | Dealership pages, see `client/apps/bizwiz/dealers.lua`. Not ported yet (pages show "not available yet"). |
| `Dyn8SearchProperties`, `Dyn8MarkProperty`, `Dyn8StartSale`, `Dyn8StartTransfer`, `Dyn8RunCredit { term }`, `Dyn8ChangePropertyLocations`, `Dyn8ShowPropertyLocations`, `Dyn8CopyID`, `Dyn8ToggleBlips` | | Dynasty 8 pages, see `client/apps/bizwiz/realestate.lua`. Not ported yet. |

Document and receipt permissions: `TABLET_VIEW_DOCUMENT`, `TABLET_CREATE_DOCUMENT`,
`TABLET_PIN_DOCUMENT`, `TABLET_DELETE_DOCUMENT`, `TABLET_CREATE_RECEIPT`,
`TABLET_MANAGE_RECEIPT`, `TABLET_CLEAR_RECEIPT`, `TABLET_CREATE_NOTICE`,
`TABLET_DELETE_NOTICE`. Document and notice bodies are HTML; the UI sanitises them on
display and on save.

## Lua changes made with this port

- `client/apps/bizwiz/app.lua`: `BusinessDocumentDelete` and `BusinessReceiptDelete` now pass
  the whole body to the server callback. They passed `data.id`, and the server reads
  `data.id` again, so deletes never matched a record.

## Dropped as dead

- `LAPTOP_VISIBLE_LIMITED`, `SET_EXPANDED`, `TOGGLE_EXPANDED`, `ADD_UNREAD`, app reorder,
  add to home and dock actions: copied from the phone, never sent or used by laptop Lua.
- The `Reorder`, `TestSound` callbacks: not registered in Lua.
- The boosting contract market tab: disabled in the old UI and has no callbacks.
- The accent colour setting: the console theme has one palette, so the colour had nothing
  left to tint. `LaptopSettings.colors` is left as stored.
- SupplyMate and Terminal: not in the server's app list (`server/startup.lua`), so they can
  never be opened; they render "not available yet" if they ever are. Interwebz and Files are
  `fake` apps (empty in the old UI) and render the same page.
