# sandbox-phone NUI contract

Svelte 5 port. `client/*.lua` and `client/apps/*.lua` are the source of truth;
`src/bridge.js` routes every `SendNUIMessage({ type, data })` below into the
rune stores under `src/state/`. Nothing renders until `SET_DATA player` arrives
(as before).

## Focus and visibility

* `Phone:Open()` / `OpenLimited()` / `OpenPayphone()` call `SetNuiFocus(true, true)` and send
  `PHONE_VISIBLE` or `PHONE_VISIBLE_LIMITED` (payphone and limited share one message; the UI shows
  the keypad and call screen only, status bar "Calls only").
* The UI never calls `SetNuiFocus`. Escape (kit `onKey`, fires on key-up) or F3 (key-down):
  closes the top in-phone dialog if one is open, else leaves move mode, else hides the phone and
  sends `ClosePhone`.
* `Phone:Close(forced)` sends `CLEAR_HISTORY` (always), `PHONE_NOT_VISIBLE_FORCED` when forced,
  `ALERTS_RESET`, then drops focus. A normal close sends no visibility message, so `CLEAR_HISTORY`
  also hides the phone. 2000 ms later (the old timing) the UI resets the route to the home screen,
  closes dialogs and sends `CDExpired`; Lua keeps `_openCd` set until then. If `PHONE_VISIBLE`
  arrives first, the reset and `CDExpired` run at once.
* `PHONE_NOT_VISIBLE` (logout): hide, and send `ClosePhone` if the phone was showing, as the old
  reducer did, so Lua drops focus (its logout handler does not call `Phone:Close` itself).
* `UI_RESET`: hide, home, clear the call, message threads, alerts and share offer.
* While closed the device sinks below the bottom-right edge and shows a lock screen (wallpaper,
  clock); it rises only far enough to show new notifications, as the old peeking phone did.

## Size and position

* The device is the player's frame image (`player.PhoneCase`: default, blue, gold, pink, white;
  `src/assets/frames`, 500x1000) at 1:2, laid out at 384x768 for 1920x1080 and scaled by
  `min(innerWidth / 1920, innerHeight / 1080)`.
* `SET_EXPANDED { expanded }` (saved setting `Expanded`): "Larger" phone, 15% bigger. Settings >
  Phone size changes it and sends `UpdateSetting { type: 'Expanded', val }` (the old
  `TOGGLE_EXPANDED`). `PhoneSettings.zoom` (old 75 to 100 slider) is no longer read: the base size
  is fixed so text stays at 16px or more; Expanded replaces it.
* `SET_POSITION { x, y }`: top-left of the device in 1920x1080 reference pixels, clamped to the
  screen. `{ x: 1000, y: 250 }` is what the server stores for a phone nobody moved (server/main.lua)
  and means "docked bottom right" (24px margins, scaled). Settings > Move phone enters move mode
  (drag anywhere on the device); "Save position" sends `Phone:SavePosition { x, y }`, "Dock bottom
  right" sends `{ x: 1000, y: 250 }`. `/resetphonepos` stores `{ 25, 25 }`, which now shows top left.

## Lua -> UI messages

| type | payload | handling |
| --- | --- | --- |
| `PHONE_VISIBLE` | – | show, full mode |
| `PHONE_VISIBLE_LIMITED` | – | show, keypad and calls only |
| `PHONE_NOT_VISIBLE` / `PHONE_NOT_VISIBLE_FORCED` | – | hide |
| `CLEAR_HISTORY` | – | hide; after 2 s home + `CDExpired` |
| `ALERTS_RESET` | – | clear in-phone alerts |
| `UI_RESET` | – | full reset (see above) |
| `SET_APPS` | `{ [name]: AppDef }` | catalogue: `name, label, storeLabel, icon, color, params, internal, canUninstall, store, hidden, restricted, unread`. Tiles keep `color`; icons are mapped to Tabler by app name (`src/lib/apps.js`) because several Font Awesome names have no twin |
| `SET_TIME` | `{ hour, minute }` | status bar clock |
| `SET_POSITION` | `{ x, y }` | see above |
| `SET_EXPANDED` | `{ expanded }` | see above |
| `LOAD_PERMS` | table | stored (no current Lua sender) |
| `ADD_UNREAD` | `{ name, count }` | tile badge += count; opening an app sets it to 0 |
| `SET_DATA` | `{ type, data }` | `data[type] = data` |
| `ADD_DATA` | `{ type, data, key?, first? }` | list: push (unshift if `first`); map: `[key] = data` or merge; missing: `[data]` |
| `UPDATE_DATA` | `{ type, id, data, key? }` | list: merge into items whose `key`/`_id`/`id` == id; map: `key` given: `map[id][key] = data` (used for `player.PhoneSettings.volume`), else `map[id] = data` |
| `REMOVE_DATA` | `{ type, id, key? }` | list filter / map delete |
| `RESET_DATA` | – | drop all data, chatter, feed, races, threads |
| `NOTIF_ADD` | `{ notification: { id?, title, description, time, duration, app, action: { view?, accept?, cancel? }, data } }` | same `id` replaces. `duration -1` = persistent: shows until `NOTIF_HIDE`, shrinks to its title after 5 s, and inside an app waits for the home screen (old behaviour; the status bar still shows a call). Timed ones leave after `duration` ms from arrival. `app` may be an object `{ color, label, icon }`. `action.view` opens `/apps/<app>/<view>`; `USE_SHARE` opens the QuickShare dialog |
| `NOTIF_UPDATE` | `{ id, title, description }` | update and expand |
| `NOTIF_HIDE` | `{ id }` | remove |
| `NOTIF_DISMISS_ALL` | – | remove all |
| `RECEIVE_SHARE` | `{ type: 'contacts' \| 'documents', data }` | status bar "Shared item" opens the offer |
| `SET_CALL_PENDING` | `{ number }` | call state 0 |
| `SET_CALL_INCOMING` | `{ number, limited }` | call state 1 (limited hides the caller) |
| `SET_CALL_ACTIVE` | – | state 2, timer starts |
| `END_CALL` | – | call screen shows "Call ended" for 2.5 s, then goes back |
| `SET_MESSAGE_THREADS` | `{ threads }` | threads, unread reset to 0 (old behaviour: the row's flag is not a count) |
| `UPDATE_THREAD_IF_EXISTS` | `{ thread }` | count +1, unread +1, or a new thread |
| `RECEIVED_NEW_MESSAGE` | message | appended to the open conversation for that number only (the old phone appended it to whichever was open), which is then marked read |
| `CHATTER_SET_GROUPS` / `CHATTER_SET_INVITES` / `CHATTER_UPDATE_GROUP` / `CHATTER_RECEIVED_MESSAGE` / `CHATTER_RECEIVE_INVITE` / `CHATTER_CHANNEL_DELETED` | as before | Chatter store; received messages append to the open group |
| `RECEIVED_NEW_TWEET` / `REMOVE_ACCOUNT_TWEETS { account, count }` / `CLEAR_TWEETS` | | Spammer feed |
| `DOCUMENTS_RECEIVED_SIGNATURE` | `{ id, signature }` | merged into the open document's signatures |
| `DOCUMENTS_DOCUMENT_DELETED` | `{ id }` | removed from `myDocuments` |
| `MUSIC_END` | – | stored (Music not ported) |
| `EVENT_SPAWN`, `ADD_PENDING_RACE`, `CANCEL_RACE`, `FINISH_RACE`, `STATE_UPDATE`, `JOIN_RACE`, `LEAVE_RACE`, `I_RACE`, `NEW_INVITE`, `RACE_STATE_CHANGE`, `DNF_START`, `RACE_DNF`, `RACE_START`, `RACE_LAP`, `RACE_CP`, `RACE_END` | as before | kept in `state/misc.svelte.js` (`race`) for when Redline is ported; nothing draws them yet |
| `PD_*` (Blueline) | as before | kept in `pdRace`; nothing draws them yet |

`INSTALL_USB` / `REMOVE_USB` exist only in commented-out Lua and are not handled.

### UI-only message (previews)

| type | payload | notes |
| --- | --- | --- |
| `NAVIGATE` | `{ path }` | Never sent by Lua. Pushes a route such as `/apps/messages/convo/555-301-8820`. Used by `ui/preview/*.json`. |

## Routes

`/` home, `/apps` all apps, `/apps/<app>/<segments>`; the segments keep the old router's names so
notification `view` strings resolve unchanged: `phone/call/:number`, `phone/recent`,
`contacts/view/:id`, `contacts/add/:number?`, `contacts/caller/:number`, `messages/convo/:number`,
`messages/new`, `settings/{profile,app_notifs,sounds,wallpaper}`, `email/view/:id`,
`adverts/{view/:id,add,edit}`, `documents/{view/:id,new,edit/:id}`, `garage/view/:vin`,
`bank/{view/:account,bill,transfer/:account,send-bill/:account}`, `loans/view/:id`,
`twitter/profile`, `chatter/{channel/:id,invites,join/:id,config/:id}`.

## UI -> Lua callbacks (`fetchNui(name, body)`)

Shell: `ClosePhone`, `CDExpired`, `Home { action: 'add'|'remove', app }`, `Dock { action, app }` (dock
holds 4), `Reorder { type: 'home', apps }` (Move earlier / later), `Phone:SavePosition { x, y }`,
`UpdateSetting { type, val }` (`notifications`, `appNotifications` (muted apps map to true), `volume`,
`ringtone`, `texttone`, `wallpaper` (a key or an https image link), `Expanded`), `TestSound { type, val }`,
`AcceptPopup { event, data }`, `CancelPopup { event, data }`, `SaveShare share` -> id or doc,
`ShareMyContact` -> bool, `UpdateProfile { app: 'twitter', name, picture }` -> bool.
`UpdateAlias` is registered in Lua but no ported screen calls it.

Phone: `CreateCall { number, limited, isAnon }` -> bool, `AcceptCall number`, `EndCall null`, `ReadCalls null`
(on opening Phone when there are unread calls).

Contacts: `CreateContact { name, number, avatar, favorite }` -> id, `UpdateContact { id, name, number, avatar, color, favorite }`
-> bool (colour is kept, no longer edited), `DeleteContact id` -> bool.

Messages: `Messages:InitLoad` -> bool (threads arrive as `SET_MESSAGE_THREADS`),
`Messages:LoadTexts { number, offset }` -> messages (20, newest first), `SendMessage { owner, number, method: 1, time, message }`
-> id, `ReadConvo number`, `DeleteConvo number` -> bool.

Email: `ReadEmail id`, `DeleteEmail id`, `GPSRoute { id, location }`, `Hyperlink { id, hyperlink }` (button "Accept offer"
or `hyperlink.label`). Expired emails are deleted as before.

Adverts (one per player, keyed by server id): `CreateAdvert` / `UpdateAdvert { title, price, full, short, categories, id, author, number, time }`
(`full` is simple `<p>` HTML from a plain textarea; categories keep the old values `Services`, `Want-To-Buy`,
`Want-To-Sell`, `Help Wanted`), `DeleteAdvert`. Bump ("Move to the top") after 30 min = `UpdateAdvert` with a new `time`.
The server rebuilds every advert (`server/apps/adverts.lua`): `id`, `author`, `number` and `time` come from
the character and the server clock, never the body; title, details, price and categories are length- and
whitelist-checked, and an edit or bump only moves the ad to the top once it has been up 30 minutes.

Documents: `CreateDocument { title, content }` -> doc, `EditDocument { id, data: { title, content } }` -> bool,
`DeleteDocument { id }` -> bool, `ShareDocument { type: 1 copy | 2 live | 3 live + signature, target: SID, nearby, document }`
-> bool, `SignDocument id` -> bool, `Documents:GetSignatures id` -> `[{ sid, signed, signed_name }]`.

Garage: `Garage:GetCars` -> vehicles (stored as `data.myVehicles`), `Garage:TrackVehicle vin` -> bool.

Bank: `Banking:GetData` -> `{ accounts, pendingBills }` (stored as `data.bankAccounts`),
`Banking:GetTransactions { account, offset, perPage: 15 }` -> `{ data, more }` (up to 100),
`Banking:Transfer { account, targetType: bool (true = State ID), target, amount, description }` -> bool,
`Banking:Bill { fromAccount, target, description, amount }` -> bool, `Banking:AcceptBill { bill, account }` -> bool,
`Banking:DismissBill { bill }` -> bool. Lua also sets `bankLoans` after a transfer with the accounts shape; the UI reloads instead.

Loans: `Loans:GetData` -> `{ creditScore, loans }` (stored as `data.loansData`, not `bankLoans`, which the bank transfer
callback overwrites with account data), `Loans:Payment { loan, weeks, paymentAhead }` -> `{ success, paidOff, paymentAmount, message }`.

Spammer: `Twitter:GetCount` -> n, `Twitter:GetTweets offset` -> tweets, `SendTweet { time, content, image: { using, link }, likes }`
(respam adds `author`, `retweet`, quoted content) -> bool.

Chatter: `Chatter:GetMessageCount id`, `Chatter:LoadMessages { channel, offset }` -> messages | false,
`Chatter:SendMessage { channel, message }` -> id, `Chatter:CreateGroup { label }` -> `{ id, create_date }`,
`Chatter:DeleteGroup id`, `Chatter:LeaveGroup id`, `Chatter:UpdateGroup { channel, data: { label, icon } }`,
`Chatter:Invite:Send { channel, sid }`, `Chatter:Invite:Accept group` -> group, `Chatter:Invite:Decline group`.

Store: `Install { app, check: true }` then, after a short wait, `Install { app }`; `Uninstall` the same.

Jobs: `GetLaborDetails` -> `{ jobs, groups, reputations }`, `CreateWorkgroup`, `JoinWorkgroup group`, `DisbandWorkgroup`,
`LeaveWorkgroup group`, `StartLaborJob { job, isWorkgroup }`, `QuitLaborJob job`.
Crypto: `GetCryptoCoins` -> coins, `BuyCrypto { Short, Quantity }`, `SellCrypto { Short, Quantity }` -> `{ error? }`,
`TransferCrypto { Short, Quantity, Target }`.
Services: `Services:GetServices` -> services, `Services:SetGPS { location, jobName }`.
Media: `Media:GetMedia` -> photos, `Media:DeleteMedia { id }`. FINDR: `PingEm:Send { target, type: anonymous }` (anonymous needs `PHONE_VPN`).
Chopper: `GetChopperDetails` -> `{ banned, chopList, reputations }`.

BizWiz (partial): lists `player.Jobs` (minus `externalJobs`) and `QuitJob { JobId }` -> `{ success, code }`
(`IS_OWNER` is explained). Company management is not ported.

Not ported yet (the app opens a "not available yet" page; Lua handlers untouched): Dyn8
(`Dyn8:*`), Properties (`Home:*`, `PurchaseProperty*`, `PreviewPropertyInterior`), BizWiz management (`FetchRoster`,
`FetchTimeWorked`, `RenameCompany`, `HireEmployee`, `FireEmployee`, `UpdateEmployee`, `EditWorkplace`, `CreateGrade`,
`EditGrade`, `DeleteGrade`, `PurchaseUpgrade`, `DisbandCompany`, `TransferCompany`), Redline and Blueline (race
callbacks, `*PD` variants), Music (`Music:SendRoyalties`; the old player loaded the SoundCloud widget script at runtime).

## Dropped as dead or replaced

* Accent colour setting (`PhoneSettings.colors`): the phone uses the house palette; the value is kept, not edited.
* "Angry Boi OS" about page with the 2.8 MB fireworks GIF.
* Contact colour editing (colour is still saved back unchanged).
* Inline video players in texts, ads and documents (links copy instead); `ircinvite=` links (IRC was removed server side).
* Home screen pages and drag-to-reorder: the grid scrolls, and Options > Move earlier / later sends `Reorder`.
* Wallpapers: six ship (`wallpaper`, `wallpaper2`, `wallpaper5`, `wallpaper8`, `wallpaper12`, `wallpaper25`); any other
  saved key shows the default SandboxRP wallpaper. Custom wallpapers must be https links.
