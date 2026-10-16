# sandbox-mdt — Lua ↔ NUI contract

Extracted from `client/*.lua` and `client/alerts/*.lua` (the Lua client is the
source of truth). Reducers under `src/features/*` keep these message `type`
strings and payload field names verbatim.

## 1. Lua → UI (`SendNUIMessage({ type, data })`)

`<NuiBridge>` dispatches each as `{ type, payload: { ...data } }`.

### MDT shell (`client/client.lua`, `client/component.lua`)

| type | data | sent when |
| --- | --- | --- |
| `APP_SHOW` | — | `MDT:Open()`; Lua also `SetNuiFocus(true, true)` |
| `APP_HIDE` | — | `MDT:Close()`; Lua also `SetNuiFocus(false, false)` and sets data `prison=false` |
| `SET_USER` | `{ user }` – full character document (`SID, First, Last, Callsign, Qualifications, MDTSystemAdmin, Gender, DOB, Phone, …`) | `Characters:Client:Updated` (key `-1`, `Callsign`, `Qualifications`, `MDTSystemAdmin`) |
| `JOB_LOGIN` | `{ points: {reduction, license}, job: {Id, Name, Workplace:{Id,Name}, Grade:{Id,Name,Level}}, jobPermissions: {PERM:true}, attorney: bool }` – all optional (attorney login sends only `attorney=true`) | `MDT:Client:Login` (going on duty / attorney spawn) |
| `JOB_LOGOUT` | — | `MDT:Client:Logout` (off duty) |
| `JOB_UPDATE` | `{ job, jobPermissions }` | `MDT:Client:UpdateJobData` |
| `LOGOUT` | — | `Characters:Client:Logout` |
| `SET_DATA` | `{ type: key, data }` | `MDT.Data:Set(key, data)` – keys seen: `governmentJobs`, `charges`, `governmentJobsData`, `permissions`, `qualifications`, `bolos`, `homeLastFetch`, `prison` (bool: public DOC visitation view). Any other key is stored as-is; `route` (a path string) is honoured as an optional deep link by the UI. |
| `ADD_DATA` | `{ type: key, data, key? }` | `MDT.Data:Add` – appends to array keys (`bolos`, `charges`) or merges into object keys |
| `UPDATE_DATA` | `{ type: key, id, data }` | `MDT.Data:Update` – replaces array item with `item.id == id` (`charges`) |
| `REMOVE_DATA` | `{ type: key, id }` | `MDT.Data:Remove` – removes array item with `item.id == id` |
| `RESET_DATA` | — | `MDT.Data:Reset` (the `MDT:Client:ResetData` handler actually calls `Phone.Data:Reset()` – Lua bug) |
| `SET_BODYCAM` | `{ state: bool }` | `UI:Client:Reset`, character logout |
| `TOGGLE_BODYCAM` | — | `MDT:Client:ToggleBodyCam` |
| `SHOW_GOV_ID` | `{ First, Last, Department, SID, Title, Callsign?, Mugshot?, DOB?, 'Department Name'? }` | `MDT.Badges:Open` (auto hides after 9s via `HIDE_GOV_ID`) |
| `HIDE_GOV_ID` | — | `MDT.Badges:Close` |
| `SHOW_DRIVER_LICENSE` | `{ SID, Name, Gender, DOB, Mugshot }` | `MDT.Licenses:Open` (auto hides after 9s) |
| `HIDE_DRIVER_LICENSE` | — | `MDT.Licenses:Close` |

### Emergency alerts (`client/alerts/component.lua`, `client/alerts/events.lua`)

| type | data | sent when |
| --- | --- | --- |
| `SET_SHOWING` | `{ state: bool }` | `EmergencyAlerts:Open/Close` (GRAVE keybind, `EmergencyAlerts:Client:Open/Close`). Lua sets/drops NUI focus with it. |
| `ADD_ALERT` | `{ alert: { id:'local-…', code, title, type, location, description, panic, blip, style, camera, client:true, attached:[] } }` | `EmergencyAlerts:CreateClientAlert` (client-only alert, never on the socket) |
| `ALERTS_WS_CONNECT` | `{ url, token }` | `EmergencyAlerts:Client:Connect` (server hands out `WS_MDT_ALERTS` url + JWT for namespace `/mdt-alerts`) |
| `ALERTS_WS_DISCONNECT` | `{}` | `EmergencyAlerts:Client:Disconnect` (off duty) |
| `ALERTS_UPDATE_PURSUIT_MODE` | `{ mode }` | `EmergencyAlerts:Client:PursuitModeChange` → UI emits `changePursuitMode` on the socket |
| `ALERTS_UPDATE_RADIO_CHANNEL` | `{ channel }` | `EmergencyAlerts:Client:RadioChannelChange` → UI emits `changeRadioChannel` |

24 message types in total.

## 2. UI → Lua (`RegisterNUICallback`) — 43 callbacks

Call with `fetchNui(name, body)`. Lua forwards most bodies verbatim to a server
callback (`Callbacks:ServerCallback("MDT:…", data, cb)`) and replies with its result.

### Generic records (`client/nui.lua`)

| callback | body Lua reads | server handler / reply |
| --- | --- | --- |
| `Search` | `{ type, term, page?, perPage?, reportType?, isAttorney?, evidence? }` | `MDT:Search:<type>` — `people` → array of characters; `vehicle`/`warrant`/`report` → `{ data:[…], pages }`; `firearm` → array |
| `InputSearch` | `{ type:'people'|'job', term, job? }` | `MDT:InputSearch:<type>` → up to 4 matches |
| `InputSearchSID` | `{ term: SID }` | `MDT:InputSearchSID` → `[character]` |
| `View` | `{ type, id }` (only `data.id` forwarded) | `MDT:View:<type>` — `person` → `{ data, parole, convictions, vehicles, ownedBusinesses }`; `vehicle`, `report`, `warrant`, `firearm`, `notice` |
| `Create` | `{ type, doc, parent?, plate?, parentId? }` | `MDT:Create:<type>` — `report` (→ new id), `BOLO`, `charge`, `notice` (→ id), `vehicle-flag`, `firearm-flag` (→ flag row) |
| `Update` | `{ type, … }` | `MDT:Update:<type>` — `person {SID, Key, Data}`, `report {id, report}`, `warrant {id, state}`, `charge {doc}`, `vehicle-strikes {VIN, strikes}`, `jobPermissions {JobId, WorkplaceId, GradeId, UpdatedPermissions}` |
| `Delete` | `{ type, id?, doc?, parent?, plate?, removeRadarFlag?, parentId? }` | `MDT:Delete:<type>` — `report {id}`, `BOLO {id}`, `charge {doc}`, `notice {id}`, `vehicle-flag`, `firearm-flag` |
| `SentencePlayer` | `{ report, data: suspectRow, sentence:{type,value,revoke:{},doc}, jail, fine, points, parole:{end,total,parole,sentence,fine}|null }` | bool |
| `IssueWarrant` | `{ suspect: suspectRow, report, notes }` | bool |
| `OverturnSentence` | `{ SID, report }` | bool |
| `ManageEmployment` | `{ SID, data: jobObject, JobId }` | bool |
| `HireEmployee` | `{ SID, JobId, WorkplaceId, GradeId }` | bool |
| `FireEmployee` | `{ SID, JobId }` | bool |
| `SuspendEmployee` | `{ SID, JobId, Length }` | bool |
| `UnsuspendEmployee` | `{ SID, JobId }` | bool |
| `CheckCallsign` | raw number | bool (true = free) |
| `RosterView` | `{ job }` | array of characters (projected) |
| `RosterSelect` | `{ job, person: SID }` | character or false |
| `GetProperties` | — | array of properties (client side, `Properties:GetProperties()`) |
| `FindProperty` | raw property id | bool, sets GPS waypoint (client side) |
| `EvidenceLocker` | raw report id | `true` immediately, then opens the locker inventory |
| `PrintBadge` | `{ SID, JobId }` | bool on failure only (Lua never replies on success — fire and forget) |
| `RevokeSuspension` | `{ SID, unsuspend:{Drivers:true,…} }` | new `Licenses` object or false |
| `ClearRecord` | `{ SID }` | bool |
| `RemovePoints` | `{ SID, newPoints }` | new `Licenses` object or false |
| `ViewVehicleFleet` | — | array of fleet vehicles or false |
| `SetAssignedDrivers` | `{ vehicle: VIN, assigned:[{SID,First,Last,Callsign}] }` | bool |
| `TrackFleetVehicle` | `{ vehicle: VIN }` | bool, sets GPS waypoint |
| `GetHomeData` | — | `{ warrants, notices, govWorkers }` |
| `GetLibraryDocuments` | — | `[{ id, label, link }]` |
| `AddLibraryDocument` | `{ label, link, job, workplace }` | insert id or false |
| `RemoveLibraryDocument` | `{ id }` | bool |
| `DOCGetPrisoners` | — | array of prisoners `{ First, Last, SID, Jailed:{Duration,Time,Release,Reduced} }` |
| `DOCReduceSentence` | `{ SID, reduction }` | bool |
| `DOCRequestVisitation` | `{ SID }` | `{ success, message? }` |

### Shell / focus (`client/component.lua`)

| callback | effect |
| --- | --- |
| `Close` | `MDT:Close()` (APP_HIDE + focus off) and `EmergencyAlerts:Close()` |

### Alerts (`client/alerts/nui.lua`)

| callback | body | effect |
| --- | --- | --- |
| `CloseAlerts` | — | `EmergencyAlerts:Close()` (SET_SHOWING false + focus off) |
| `ReceiveAlert` | the alert object (`id, panic, blip, location, title`) | plays sound, adds a blip |
| `RemoveAlert` | `{ id }` | removes the blip |
| `AssignedToAlert` | alert id | plays accept sound |
| `RouteAlert` | the alert object (`location, blip, id, title, panic`) | waypoint + closes alerts |
| `ViewCamera` | the alert object (`camera`) | opens CCTV + closes alerts |
| `SwapToRadio` | `{ radio: '12.0' }` | switches radio channel |

## 3. Focus

Lua owns focus: `MDT:Open` → `SetNuiFocus(true,true)`, `MDT:Close` → off;
`EmergencyAlerts:Open` → on, `EmergencyAlerts:Close` → off. The UI never
assumes focus; Escape calls `Close` when the MDT window is visible, otherwise
`CloseAlerts` when the alerts panel is visible. The backquote key also calls
`CloseAlerts` while the panel is open (mirrors the GRAVE toggle keybind).

## 4. Socket (`sandbox-ws/namespaces/mdtAlerts.js`)

`ALERTS_WS_CONNECT` gives `url` (e.g. `http://host:4002/mdt-alerts`) and a JWT.
The UI connects with `io(url, { query: { token } })`.

Server → UI events: `init(tokenData, alerts, units, myUnit, radioNames, dispatchLog)`,
`alert(alert)`, `alertRemove(id)`, `alertUpdateUnits(id, units)`, `unitAdd(unit)`,
`unitRemove(job, source)`, `unitUpdateData({job, primary, key, value})`,
`unitOperateUnder(job, callsign, primary)`, `unitBreakOff(job, callsign)`,
`radioInfoUpdate(radioNames)`, `dispatchLog(log)`.

UI → server events: `changeUnit(job, primary, type)`, `changeAvailability(job, primary)`,
`operateUnderUnit(job, primary, unit)`, `breakOffUnit(job, primary, unit)`,
`updateAlertUnits(alertId, units)`, `addRadioInfo(data)`, `updateRadioInfo(id, data)`,
`removeRadioInfo(id, data)`, `logMessage(message)`, `removeAlert(alertId)`,
`changePursuitMode(job, primary, mode)`, `changeRadioChannel(channel)`.

## 5. Dead UI not ported

* Old `Alerts/components/Unit.jsx` called `Nui.send('OperateUnder', …)` — no such callback exists in Lua (and the code path was commented out).
* Old `UserContent` oEmbed/iframe/lightbox rendering relied on CKEditor media; Lua only stores sanitised HTML notes.
* `SET_OPACITY_MODE` (hover-to-fade the window) was UI-only state, not a Lua message.
