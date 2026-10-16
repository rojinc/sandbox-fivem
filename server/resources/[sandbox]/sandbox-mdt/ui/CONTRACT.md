# sandbox-mdt: Lua and NUI contract

Svelte 5 NUI for the mobile data terminal (police, EMS, DOC, DOJ, attorneys and
public records), the emergency alerts panel, the body camera stamp and the
badge and state ID cards. The Lua client is the source of truth; message types
and payload fields below are used verbatim by `src/bridge.js` and the pages.

- Build: `cd ui && ../../../../../node_modules/.bin/vite build` (output `ui/dist`, served by `ui_page`).
- Dev server: `vite` on port 3020.
- Preview: `node scripts/preview.mjs --ui sandbox-mdt` renders `ui/preview/*.json`.

## 1. Lua to UI (`SendNUIMessage({ type, data })`)

### Terminal (`client/client.lua`, `client/component.lua`, `client/data.lua`)

| type | data | effect in the UI |
| --- | --- | --- |
| `APP_SHOW` | none | Shows the terminal. Lua also calls `SetNuiFocus(true, true)`. |
| `APP_HIDE` | none | Hides the terminal (state is kept). Lua drops focus and sets data `prison = false`. |
| `SET_USER` | `{ user }`, the character document (`SID, First, Last, Callsign, Qualifications, MDTSystemAdmin, ...`) | Merged into the signed-in user. Header subline: "Callsign 1-A-12, Sergeant Jordan Reyes". |
| `JOB_LOGIN` | `{ points: { reduction, license }, job: { Id, Name, Workplace: { Id, Name }, Grade: { Id, Name, Level } }, jobPermissions: { PERM: true }, attorney }` (attorney login sends only `attorney = true`) | Sets role, permissions and licence-point breakpoint; returns to the dashboard. |
| `JOB_UPDATE` | `{ job, jobPermissions }` | Updates job and permissions in place. |
| `JOB_LOGOUT` | none | Clears job and permissions (public records view). |
| `LOGOUT` | none | Resets every store, closes the dispatch socket, hides cards and body camera. |
| `SET_DATA` | `{ type, data }` | Stores `data` under `type`. Keys: `charges`, `bolos`, `governmentJobs`, `governmentJobsData`, `permissions`, `qualifications`, `homeLastFetch` (0 makes the dashboard refetch), `prison` (true opens the public visitation kiosk), `route` (deep link, see below). |
| `ADD_DATA` | `{ type, data, key? }` | Appends to a list (`bolos`, `charges`) or sets `key` on an object. |
| `UPDATE_DATA` | `{ type, id, data }` | Replaces the list item whose `id == id`. |
| `REMOVE_DATA` | `{ type, id }` | Removes the list item whose `id == id`. |
| `RESET_DATA` | none | Resets the data store. |
| `SET_BODYCAM` | `{ state }` | Shows or hides the body camera stamp (top right, text on the world, no panel). |
| `TOGGLE_BODYCAM` | none | Toggles it. |
| `SHOW_GOV_ID` | `{ First, Last, Department, SID, Title, Callsign?, Mugshot?, DOB?, 'Department Name'? }` | Government ID card, bottom left, with the department seal. Lua hides it after 9 s. |
| `HIDE_GOV_ID` | none | Hides it. |
| `SHOW_DRIVER_LICENSE` | `{ SID, Name, Gender, DOB, Mugshot }` (the `govid` item) | State identification card, bottom left. Lua hides it after 9 s. |
| `HIDE_DRIVER_LICENSE` | none | Hides it. |

`route` deep links (a path, as the old router took): `/people?person=SID`, `/people?search=term`,
`/vehicles?vehicle=VIN`, `/vehicles?search=term`, `/reports?report=ID`, `/reports?edit=ID`,
`/reports?mode=create&type=N`, `/warrants`, `/warrants?warrant=ID`, `/firearms?firearm=SERIAL`,
`/bolos`, `/properties`, `/penal-code`, `/library`, `/roster`, `/prisoners`, `/admin`, `/`.

### Emergency alerts (`client/alerts/component.lua`, `client/alerts/events.lua`)

| type | data | effect in the UI |
| --- | --- | --- |
| `SET_SHOWING` | `{ state }` | Shows the alerts panel docked on the right edge. Lua sets or drops focus with it. |
| `ADD_ALERT` | `{ alert: { id: 'local-...', code, title, type, location, description, panic, blip, style, camera, client: true, attached: [] } }` | Adds a client-only alert and calls `ReceiveAlert` for its sound and blip. A panic alert opens itself. |
| `ALERTS_WS_CONNECT` | `{ url, token }` | Opens the dispatch socket (section 4). |
| `ALERTS_WS_DISCONNECT` | `{}` | Closes the socket and clears alerts, units and log. |
| `ALERTS_UPDATE_PURSUIT_MODE` | `{ mode }` | Emits `changePursuitMode(job, unitOrLeader, mode)`. |
| `ALERTS_UPDATE_RADIO_CHANNEL` | `{ channel }` | Emits `changeRadioChannel(channel)`. |

24 message types in total.

## 2. UI to Lua (`RegisterNUICallback`), 43 callbacks

`fetchNui(name, body)`. Most bodies go straight to `Callbacks:ServerCallback("MDT:...")`.
A callback that throws or times out is shown as an error state with "Try again".

### Records (`client/nui.lua`)

| callback | body sent | answer used |
| --- | --- | --- |
| `Search` | `{ type: 'people', term }` | array of characters (max 12) |
| `Search` | `{ type: 'vehicle', term, page, perPage }` (`term` may be `SID: n`) | `{ data, pages }` |
| `Search` | `{ type: 'report', term, page, perPage, reportType, isAttorney, evidence }` (`term` may be `suspect: SID`) | `{ data, pages }` |
| `Search` | `{ type: 'warrant', term, page, perPage }` | `{ data, pages }` (`pages` can be missing: a server bug, treated as one page) |
| `Search` | `{ type: 'firearm', term }` | array |
| `InputSearch` | `{ type: 'people' \| 'job', term, job? }` | up to 4 people (person and officer pickers) |
| `InputSearchSID` | `{ term }` | not used by this UI (kept in Lua) |
| `View` | `{ type: 'person' \| 'vehicle' \| 'report' \| 'warrant' \| 'firearm' \| 'notice', id }` | the record; `person` is `{ data, parole, convictions, vehicles, ownedBusinesses }`; false when missing |
| `Create` | `{ type: 'report', doc: { type, title, notes, time, evidence, suspects, primaries, people, allowAttorney } }` | new report id |
| `Create` | `{ type: 'BOLO', doc: { type, title, summary, description, time } }` | bool; the server then sends `ADD_DATA bolos` |
| `Create` | `{ type: 'charge', doc }`, `{ type: 'notice', doc: { title, description, restricted } }` | bool / id |
| `Create` | `{ type: 'vehicle-flag', parent: VIN, plate, doc: { Type, Description, Date, Author, radarFlag } }` | bool |
| `Create` | `{ type: 'firearm-flag', parentId: serial, doc: { title, description } }` | the new flag row |
| `Update` | `{ type: 'person', SID, Key, Data }` (Flags, Mugshot, Attorney, Callsign) | bool |
| `Update` | `{ type: 'report', id, report: { type, title, notes, time, allowAttorney, changes: [{ mode: add \| update \| delete, type: evidence \| suspect \| person \| primary, data }] } }` | bool |
| `Update` | `{ type: 'warrant', id, state: 'served' \| 'void' }` | bool |
| `Update` | `{ type: 'charge', doc }`, `{ type: 'vehicle-strikes', VIN, strikes }`, `{ type: 'jobPermissions', JobId, WorkplaceId, GradeId, UpdatedPermissions }` | bool |
| `Delete` | `{ type: 'report' \| 'BOLO' \| 'notice', id }`, `{ type: 'charge', doc }`, `{ type: 'vehicle-flag', parent, plate, id: flagType, removeRadarFlag }`, `{ type: 'firearm-flag', parentId, id }` | bool |
| `SentencePlayer` | `{ report, data: suspectRow, sentence: { type: 'months' \| 'fine' \| false, value, revoke: { drivers, weapons, hunting, fishing }, doc }, jail, fine, points, parole: { end, total, parole, sentence, fine } \| null }` | bool |
| `IssueWarrant` | `{ suspect: suspectRow, report, notes }` | bool |
| `OverturnSentence` | `{ SID, report }` (needs `DOJ_OVERTURN_CHARGES`) | bool |
| `RosterView` | `{ job }` | characters with their one matching job |
| `RosterSelect` | `{ job, person: SID }` | character or false |
| `HireEmployee` | `{ SID, JobId, WorkplaceId, GradeId }` | bool |
| `ManageEmployment` | `{ SID, data: jobObject, JobId }` | bool |
| `SuspendEmployee` / `UnsuspendEmployee` / `FireEmployee` | `{ SID, JobId, Length? }` | bool |
| `CheckCallsign` | the callsign (raw string) | true when free |
| `PrintBadge` | `{ SID, JobId }` | fire and forget (Lua only answers on failure) |
| `RevokeSuspension` | `{ SID, unsuspend: { Drivers: true, ... } }` | new `Licenses` or false |
| `RemovePoints` | `{ SID, newPoints }` | new `Licenses` or false |
| `ClearRecord` | `{ SID }` | bool |
| `GetHomeData` | `{}` | `{ warrants, notices, govWorkers }` |
| `GetProperties` | `{}` | array of properties (client side) |
| `FindProperty` | the property id (raw) | bool, sets a waypoint |
| `EvidenceLocker` | the report id (raw) | true, then the UI calls `Close` and Lua opens the locker |
| `ViewVehicleFleet` | `{}` | fleet vehicles or false |
| `SetAssignedDrivers` | `{ vehicle: VIN, assigned: [{ SID, First, Last, Callsign }] }` | bool |
| `TrackFleetVehicle` | `{ vehicle: VIN }` | bool, sets a waypoint |
| `GetLibraryDocuments` / `AddLibraryDocument` / `RemoveLibraryDocument` | `{}` / `{ label, link, job, workplace }` / `{ id }` | list / id / bool |
| `DOCGetPrisoners` | `{}` | `[{ First, Last, SID, Jailed: { Duration, Time, Release, Reduced } }]` |
| `DOCReduceSentence` | `{ SID, reduction }` | bool |
| `DOCRequestVisitation` | `{ SID }` | `{ success, message? }` |

### Shell and alerts (`client/component.lua`, `client/alerts/nui.lua`)

| callback | body | effect |
| --- | --- | --- |
| `Close` | `{}` | `MDT:Close()` and `EmergencyAlerts:Close()` |
| `CloseAlerts` | `{}` | `EmergencyAlerts:Close()` |
| `ReceiveAlert` | the alert | sound and blip |
| `RemoveAlert` | `{ id }` | removes the blip |
| `AssignedToAlert` | the alert id | accept sound, once per alert |
| `RouteAlert` | the alert | waypoint, closes the panel |
| `ViewCamera` | the alert (`camera`) | opens CCTV, closes the panel |
| `SwapToRadio` | `{ radio }` | switches the radio channel |

## 3. Focus and keys

Lua owns focus; the UI never calls `SetNuiFocus`. Escape calls `Close` while the
terminal is visible, otherwise `CloseAlerts` while the panel is visible; an open
dialog takes Escape first. The backquote key calls `CloseAlerts` while only the
panel is open and no field has focus (it mirrors the GRAVE keybind). No key hints
are shown anywhere.

## 4. Dispatch socket (`src/lib/socket.js`, no socket.io-client)

`ALERTS_WS_CONNECT` gives `url` (convar `WS_MDT_ALERTS`, default
`http://localhost:4002/mdt-alerts`) and a JWT for namespace `/mdt-alerts`.
The UI speaks Socket.IO v4 over the browser WebSocket:

- Connect to `ws(s)://<host>/socket.io/?EIO=4&transport=websocket&token=<jwt>`.
  The URL's origin is the server and its path is the namespace, as `io(url)`
  reads it; a bare origin joins `/mdt-alerts`. `https` becomes `wss`.
  sandbox-ws reads the token from `socket.handshake.query.token`.
- On `0{...}` (engine open) send `40/mdt-alerts,`; `40/mdt-alerts,{sid}` means joined.
- Answer every `2` (ping) with `3`. No ping within `pingInterval + pingTimeout` closes the link.
- Events arrive as `42/mdt-alerts,[event, ...args]` (an ack id before `[` is ignored);
  emits go out the same way. `44` (connect error) and `41` (server disconnect) close the link.
- Any close reconnects with backoff: 1, 2, 4, 8, 16, then 30 s (plus or minus 25 %).
  `ALERTS_WS_DISCONNECT` and `LOGOUT` close it for good.
- Text frames only; binary packets and acks are not used by sandbox-ws.

Server events handled: `init(tokenData, alerts, units, myUnit, radioNames, dispatchLog)`,
`alert(alert)` (calls `ReceiveAlert`), `alertRemove(id)` (calls `RemoveAlert`),
`alertUpdateUnits(id, units)` (calls `AssignedToAlert` when my unit is newly attached),
`unitAdd(unit)`, `unitRemove(job, source)`, `unitUpdateData({ job, primary, key, value })`,
`unitOperateUnder(job, callsign, primary)`, `unitBreakOff(job, callsign)`,
`radioInfoUpdate(radioNames)`, `dispatchLog(entry)`.

Emitted by the panel: `changeAvailability(job, primary)`, `updateAlertUnits(alertId, units)`
(attach or detach my unit), `removeAlert(alertId)`, plus `changePursuitMode` and
`changeRadioChannel` from Lua messages. `changeUnit`, `operateUnderUnit`, `breakOffUnit`,
`addRadioInfo`, `updateRadioInfo`, `removeRadioInfo` and `logMessage` are wrapped in
`lib/alerts.js` where useful but have no controls yet (see section 6).

## 5. Data notes

- Report and notice bodies are stored as HTML. The editor shows plain text and saves
  escaped `<p>` paragraphs; display goes through the kit `RichText` sanitiser.
- Charge maths is unchanged: jail months are summed once per charge (not multiplied by
  count), fines and points are multiplied by count; parole is 1.5 times the jail time,
  with 0.5 times stored as `parole`.
- Times: dates read "16 October 2026", times "2:40pm", alert times 24-hour mono.

## 6. Dropped or changed, and why

- The dispatch log view, unit type menu, operate-under and radio name editing from the old
  alerts window have no controls in this pass; the socket keeps their data (`alerts.dispatchLog`,
  units, radio names) and the Units and Radio tabs show it read-only plus "Switch radio".
- `InputSearchSID` is not called: the hire form takes a state ID directly.
- `SET_OPACITY_MODE` (hover-to-fade) was UI-only and is gone.
- The rich text editor (CKEditor) is replaced by a plain textarea; images pasted as base64
  are no longer possible.
- Lua fixes made for this contract: `server/modules/misc.lua` now sends the BOLO id (not
  its list index) in `REMOVE_DATA`; `client/data.lua` `MDT:Client:ResetData` resets the MDT
  store (it called `Phone.Data:Reset()`); `server/modules/firearm.lua` selects the flag `id`
  so a firearm flag can be removed.
