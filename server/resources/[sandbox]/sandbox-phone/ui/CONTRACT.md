# sandbox-phone NUI contract

Extracted from `client/*.lua` and `client/apps/*.lua` (the Lua is the source of
truth). `<NuiBridge>` dispatches every `SendNUIMessage({ type, data })` as a
Redux action `{ type, payload: data }`; the reducers under `src/features/`
keep these type names and payload fields verbatim.

## Focus

* `Phone:Open()` / `OpenLimited()` / `OpenPayphone()` → `SetNuiFocus(true, true)` then
  `PHONE_VISIBLE` or `PHONE_VISIBLE_LIMITED`.
* `Phone:Close(forced)` → `CLEAR_HISTORY` (always, via `ResetRoute`), `ALERTS_RESET`,
  `PHONE_NOT_VISIBLE_FORCED` (only when forced), then `SetNuiFocus(false, false)`.
  A non-forced close sends **no** visibility message, so the UI treats
  `CLEAR_HISTORY` as "phone closed" as well.
* The UI closes itself only through `fetchNui('ClosePhone')` (Escape / F3).
* `UI:Client:Reset` → `SetNuiFocus(false,false)` + `UI_RESET`.
* After `CLEAR_HISTORY` the UI must call `CDExpired` once it has reset its route;
  Lua blocks re-opening (`_openCd`) until then.

## Lua → UI messages

| type | payload | notes |
| --- | --- | --- |
| `PHONE_VISIBLE` | – | phone opened, full mode |
| `PHONE_VISIBLE_LIMITED` | – | payphone / limited mode: dialer + call only |
| `PHONE_NOT_VISIBLE` | – | sent on character logout |
| `PHONE_NOT_VISIBLE_FORCED` | – | forced close (death, states) |
| `CLEAR_HISTORY` | – | every close; reset route to home, then `CDExpired` |
| `ALERTS_RESET` | – | clear toast alerts |
| `UI_RESET` | – | full UI reset |
| `SET_APPS` | `{ [name]: AppDef }` | app catalogue (`server/data.lua`): `name,label,storeLabel,icon,color,params,internal[],canUninstall,store,hidden,restricted,unread` |
| `SET_TIME` | `{ hour, minute }` (`GlobalState["Sync:Time"]`) | every 15 s |
| `SET_POSITION` | `{ x, y }` | restored phone position (`PhonePosition`) |
| `SET_EXPANDED` | `{ expanded }` | saved "Expanded" setting |
| `LOAD_PERMS` | permissions table | `Phone.Permissions:Load` (never called by current Lua) |
| `SET_DATA` | `{ type, data }` | `data[type] = data`; keys: `player, onDuty, contacts, calls, emails, adverts, myDocuments, garages, jobs, workGroups, externalJobs, NamedJobPermissions, JobPermissions, JobData, tracks, tracks_pd, bankLoans` |
| `ADD_DATA` | `{ type, data, key? }` | append to list / set key on map (`calls, contacts, emails, adverts, myDocuments`) |
| `UPDATE_DATA` | `{ type, id, data, key? }` | merge into list item with `id` / map entry; `key` form used for `player.PhoneSettings.volume` |
| `REMOVE_DATA` | `{ type, id }` | remove list item / map key |
| `RESET_DATA` | – | drop all data |
| `NOTIF_ADD` | `{ notification: { id?, title, description, time, duration, app, action: { view?, accept?, cancel? }, data, show } }` | `duration -1` = persistent; `app` may be an object `{ color, label, icon }` |
| `NOTIF_UPDATE` | `{ id, title, description }` | |
| `NOTIF_HIDE` | `{ id }` | |
| `NOTIF_DISMISS_ALL` | – | |
| `ADD_UNREAD` | `{ name, count }` | app badge |
| `RECEIVE_SHARE` | `{ type: 'contacts'|'documents', data }` | QuickShare offer |
| `SET_CALL_PENDING` | `{ number }` | outgoing call dialing |
| `SET_CALL_INCOMING` | `{ number, limited }` | |
| `SET_CALL_ACTIVE` | – | |
| `END_CALL` | – | |
| `SET_MESSAGE_THREADS` | `{ threads: [{ id, owner, number, method, time, count, message, unread }] }` | after `Messages:InitLoad` |
| `UPDATE_THREAD_IF_EXISTS` | `{ thread: { id, owner, number, type, time, message } }` | |
| `RECEIVED_NEW_MESSAGE` | `{ id, owner, number, message, time, method, unread, contact }` | |
| `CHATTER_SET_GROUPS` | `{ groups: [{ id, label, icon, owner, joined_date, last_message }] }` | |
| `CHATTER_SET_INVITES` | `{ invites: { [group]: { sender, group, label, icon, timestamp } } }` | |
| `CHATTER_UPDATE_GROUP` | `{ group: { id, last_message? , label?, icon? } }` | |
| `CHATTER_RECEIVED_MESSAGE` | `{ group, author, message, timestamp }` | |
| `CHATTER_RECEIVE_INVITE` | `{ invite }` | |
| `CHATTER_CHANNEL_DELETED` | `{ group }` | |
| `RECEIVED_NEW_TWEET` | tweet `{ id, time, source, SID, author:{name,picture}, content, image:{using,link}, likes, retweet, verified }` | |
| `REMOVE_ACCOUNT_TWEETS` | `{ account, count }` | |
| `CLEAR_TWEETS` | – | |
| `DOCUMENTS_RECEIVED_SIGNATURE` | `{ id, signature: { sid, signed, signed_name } }` | |
| `DOCUMENTS_DOCUMENT_DELETED` | `{ id }` | |
| `MUSIC_END` | – | after `Music:SendRoyalties` |
| `EVENT_SPAWN` | `{ races: { [id]: Race } }` | redline |
| `ADD_PENDING_RACE` | `{ race }` | |
| `CANCEL_RACE` | `{ race, myRace }` | |
| `FINISH_RACE` | `{ id, race }` | |
| `STATE_UPDATE` | `{ race, state }` | |
| `JOIN_RACE` | `{ race, racer, racerData }` | |
| `LEAVE_RACE` | `{ race, racer }` | |
| `I_RACE` | `{ state }` | am I in a race |
| `NEW_INVITE` | `{ invite: { id, sender, event } }` | |
| `RACE_STATE_CHANGE` | `{ state }` | track creator ended |
| `DNF_START` | `{ time }` | race HUD |
| `RACE_DNF` | – | |
| `RACE_START` | `{ totalCheckpoints, totalLaps, track }` | |
| `RACE_LAP` | – | |
| `RACE_CP` | `{ cp }` | |
| `RACE_END` | – | |
| `PD_EVENT_SPAWN` | `{ races }` | blueline (police trials) |
| `PD_ADD_PENDING_RACE` | race (payload **is** the race) | |
| `PD_CANCEL_RACE` | `{ race, myRace }` | |
| `PD_FINISH_RACE` | `{ id, race }` | |
| `PD_STATE_UPDATE` | `{ race, state }` | |
| `PD_JOIN_RACE` | `{ race, racer }` | |
| `PD_LEAVE_RACE` | `{ race, racer }` | |
| `PD_I_RACE` | `{ state }` | |
| `PD_RACE_STATE_CHANGE` | `{ state }` | |

`INSTALL_USB` / `REMOVE_USB` exist only in commented-out Lua and are not handled.

## UI → Lua callbacks (`fetchNui(name, body)`)

Shell: `ClosePhone`, `CDExpired`, `Home {action,app}`, `Dock {action,app}`,
`Reorder {type,apps}`, `Phone:SavePosition {x,y}`, `UpdateSetting {type,val}`,
`TestSound {type,val}`, `UpdateAlias`, `UpdateProfile {app,name,picture}`,
`AcceptPopup {event,data}`, `CancelPopup {event,data}`, `SaveShare share`,
`ShareMyContact`.

Phone: `CreateCall {number,limited,isAnon}` → bool, `AcceptCall`, `EndCall`, `ReadCalls`.

Messages: `Messages:InitLoad` → bool (threads arrive via `SET_MESSAGE_THREADS`),
`Messages:LoadTexts {number,offset}` → messages[], `SendMessage {owner,number,method,time,message}` → id,
`ReadConvo number`, `DeleteConvo number` → bool.

Contacts: `CreateContact {name,number,avatar,color,favorite}` → id,
`UpdateContact {id,...}` → bool, `DeleteContact id` → bool.

Bank: `Banking:GetData` → `{accounts,pendingBills}`, `Banking:Transfer {account,targetType,target,amount,description}`,
`Banking:AcceptBill {bill,account}`, `Banking:DismissBill {bill}`, `Banking:Bill {fromAccount,target,description,amount}`,
`Banking:GetTransactions {account,offset,perPage}` → `{data,more}`.

Loans: `Loans:GetData` → `{creditScore,loans}`, `Loans:Payment {loan,weeks,paymentAhead}` → `{success,paidOff,paymentAmount,message}`.

Store: `Install {app,check?}`, `Uninstall {app,check?}` → bool.

Twitter: `Twitter:GetCount` → n, `Twitter:GetTweets offset` → tweets[], `SendTweet tweet` → bool.

Chatter: `Chatter:GetMessageCount channel`, `Chatter:LoadMessages {channel,offset}`, `Chatter:SendMessage {channel,message}`,
`Chatter:CreateGroup {label}` → `{id,create_date}`, `Chatter:DeleteGroup id`, `Chatter:LeaveGroup id`,
`Chatter:UpdateGroup {channel,data:{label,icon}}`, `Chatter:Invite:Send {channel,sid}`, `Chatter:Invite:Accept id` → group,
`Chatter:Invite:Decline id`.

Email: `ReadEmail id`, `DeleteEmail id`, `GPSRoute {id,location}`, `Hyperlink {id,hyperlink}`.

Adverts: `CreateAdvert advert`, `UpdateAdvert advert`, `DeleteAdvert`.

Documents: `CreateDocument {title,content}` → doc, `EditDocument {id,data}` → bool, `DeleteDocument {id}` → bool,
`ShareDocument {type,target,nearby,document}` → bool, `SignDocument id` → bool, `Documents:GetSignatures id` → signers[].

Garage: `Garage:GetCars` → vehicles[], `Garage:TrackVehicle vin` → bool.

Properties: `Home:GetMyProperties` → `{properties,upgrades}`, `Home:LockProperty {id}`, `Home:CreateDigiKey {updating,id,target,permissions}` → `{error,code}`,
`Home:RevokeDigiKey {id,target}`, `Home:RemoveMyKey {id}`, `Home:EditMode`, `Home:GetCurrentFurniture {property}` → `{success,furniture,catalog,categories,err}`,
`Home:PlaceFurniture {model,category}`, `Home:EditFurniture {id}`, `Home:DeleteFurniture {id}`, `Home:HighlightFurniture {id}`,
`Home:StartPlacement` (always false), `PurchasePropertyInterior {int,id}`, `PurchasePropertyUpgrade {upgrade,id}`, `PreviewPropertyInterior {int}`.

Labor: `GetLaborDetails` → `{jobs,groups,reputations}`, `CreateWorkgroup`, `JoinWorkgroup group`, `DisbandWorkgroup`, `LeaveWorkgroup group`,
`StartLaborJob {job,isWorkgroup}`, `QuitLaborJob job`.

Crypto: `GetCryptoCoins` → coins[], `BuyCrypto {Short,Quantity}`, `SellCrypto {Short,Quantity}`, `TransferCrypto {Short,Quantity,Target}`.

Dyn8: `Dyn8:SearchProperty term` → properties[], `Dyn8:MarkProperty id`, `Dyn8:SellProperty`, `Dyn8:CheckCredit` (both stubs: cb('OK')).

Services: `Services:GetServices` → services[], `Services:SetGPS {location,jobName}`.
Media: `Media:GetMedia` → photos[], `Media:DeleteMedia {id}`.
PingEm: `PingEm:Send {target,type}` → bool.
Chopper: `GetChopperDetails` → `{banned,chopList,reputations}`.
Music: `Music:SendRoyalties {label_name,title,id}`.

CoManager: `QuitJob {JobId}`, `FetchRoster {ReqUpdate?}` → `{rosterData,jobData?}`, `FetchTimeWorked jobId`, `RenameCompany name`,
`HireEmployee {SID,Job}`, `FireEmployee employee`, `UpdateEmployee employee`, `EditWorkplace {JobId,WorkplaceId,NewName}`,
`CreateGrade / EditGrade / DeleteGrade grade`, `PurchaseUpgrade`, `DisbandCompany`, `TransferCompany {target}`.
All return `{success, code}`.

Redline: `CreateRace state` → race|`{failed,message}`, `CancelRace id`, `PracticeTrack id`, `JoinRace id`, `LeaveRace id`,
`CreateTrack`, `FinishCreator {name,type}`, `DeleteTrack id`, `ResetTrackHistory id`, `StopCreator`, `StartRace`, `EndRace id`,
`SendInvite {id,alias}`, `AcceptInvite id`, `DeclineInvite id`, `RemoveFromRace {id,alias}`, `LapDetails`.
Blueline: the same with a `PD` suffix (`CreateRacePD` … `EndRacePD`).

## Store shape (`src/store.js`)

```
phone         visible, limited, apps, time, position, expanded, locked, closing, permissions
data          { player, onDuty, contacts, calls, emails, adverts, myDocuments, garages, jobs, workGroups,
                externalJobs, NamedJobPermissions, JobPermissions, JobData, tracks, tracks_pd, bankLoans, … }
notifications list
alerts        list (toasts)
share         sharing, open
call          call: null | { state: 0 pending | 1 incoming | 2 active, number, limited, start }
messages      loaded, threads
chatter       groups, invites
race          races, invites, inRace, creator
pdRace        races, inRace, creator
track         race HUD (show, lap, checkpoint, dnf…)
music         playing song / popup state
```
