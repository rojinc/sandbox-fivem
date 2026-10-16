# sandbox-hud NUI contract

Source of truth: `client/*.lua`. Every `SendNUIMessage({ type, data })` below is
dispatched by the UI as a Redux action `{ type, payload: data }`; reducers live
in `ui/src/features`.

## Lua → UI

| Type | Payload | Reducer |
| --- | --- | --- |
| `SHOW_HUD` / `HIDE_HUD` / `TOGGLE_HUD` | `{ hp, maxHp, armor, fuel? }` on show | hud, status, vehicle |
| `SET_CONFIG` | `{ config }` (per-character HUDConfig) | hud |
| `UPDATE_MM_POS` / `SHIFT_LOCATION` | `{ position }`, `{ shift, position }` | hud, location |
| `SET_VOIP_LEVEL` | `{ level 1..3, talking 0/1/2, icon? }` | hud |
| `TOGGLE_SETTINGS` | `{ state }` | hud |
| `UPDATE_HP` | `{ hp, maxHp, armor }` | status |
| `SET_DEAD` | `{ state }` | status |
| `REGISTER_STATUS` / `UPDATE_STATUS` | `{ status: { name, max, value, icon, color, flash, options } }` | status |
| `UPDATE_STATUS_VALUE` | `{ name, value }` | status |
| `RESET_STATUSES` | – | status |
| `REGISTER_BUFF` | `{ id, data: { icon, color, duration, type } }` | status |
| `BUFF_APPLIED` / `BUFF_APPLIED_UNIQUE` | `{ instance: { buff, override, val, options, startTime } }` | status |
| `BUFF_UPDATED` | `{ buff, val? , override? }` | status |
| `REMOVE_BUFF_BY_TYPE` | `{ type }` | status |
| `UPDATE_LOCATION` | `{ location: { main, cross, area, direction } }` | location |
| `SHOW_VEHICLE` / `HIDE_VEHICLE` / `TOGGLE_VEHICLE` | – | vehicle |
| `UPDATE_IGNITION` `UPDATE_SPEED` `UPDATE_RPM` `UPDATE_FUEL` `UPDATE_NOS` `UPDATE_SEATBELT` `UPDATE_CRUISE` `UPDATE_ENGINELIGHT` | `{ ignition }` `{ speed }` `{ rpm }` `{ fuel, fuelHide }` `{ nos }` `{ seatbelt }` `{ cruise }` `{ checkEngine }` | vehicle |
| `SHOW_SEATBELT` / `HIDE_SEATBELT` | – | vehicle |
| `ADD_ALERT` | `{ notification: { _id?, type, message, duration, icon, style? } }` | notifications |
| `HIDE_ALERT` | `{ id }` | notifications |
| `CLEAR_ALERTS` | – | notifications |
| `ADD_ACTION` / `REMOVE_ACTION` / `REMOVE_ALL_ACTIONS` | `{ id, message }` / `{ id }` / – | actions |
| `START_PROGRESS` / `CANCEL_PROGRESS` / `FAIL_PROGRESS` | `{ duration, label }` / – / – | progress |
| `SET_LIST_MENU` / `CLOSE_LIST_MENU` | `{ menus }` / – | list |
| `SHOW_INPUT` / `CLOSE_INPUT` | `{ title, label, inputs, event, data }` / – | input |
| `SHOW_CONFIRM` / `CLOSE_CONFIRM` | `{ title, yes, no, description, data, denyLabel, acceptLabel }` / – | confirm |
| `SHOW_INTERACTION_MENU` / `SET_INTERACTION_LAYER` / `SET_INTERACTION_MENU_ITEMS` | `{ toggle }` / `{ layer }` / `{ items }` | interaction |
| `SHOW_EYE` / `HIDE_EYE` / `OPEN_MENU` / `CLOSE_MENU` | `{ icon }` / – / `{ menu }` / – | thirdEye |
| `OPEN_METH` / `CLOSE_METH` | `{ config: { ingredients, cookTimeMax, tableId } }` / – | meth |
| `SHOW_INFO_OVERLAY` / `CLOSE_INFO_OVERLAY` | `{ info: { label, description } }` / – | infoOverlay |
| `SHOW_OVERLAY` / `HIDE_OVERLAY` | `[ item ]` / – | overlay |
| `SHOW_GEM_TABLE` / `CLOSE_GEM_TABLE` | `{ info }` / – | gemTable |
| `DO_DEATH_TEXT` / `DO_DEATH_RELEASING` / `HIDE_DEATH_TEXT` | `{ type, deathTime, timer, key, f1Key, medicalPrice }` / – / – | app |
| `SET_BLINDFOLD` | `{ state }` | app |
| `SET_FLASHBANGED` / `CLEAR_FLASHBANGED` | `{ duration, strength }` / – | app |
| `UI_RESET` | `{ manual }` | every transient slice |

## UI → Lua (`RegisterNUICallback`)

| Callback | Body |
| --- | --- |
| `CloseUI` | – (settings closed) |
| `SaveConfig` | the config object |
| `Progress:Finish` | – |
| `ListMenu:Clicked` / `ListMenu:SubMenu` / `ListMenu:Back` / `ListMenu:Close` | `{ event, data }` / `{ submenu }` / – / – |
| `Input:Submit` / `Input:Close` | `{ event, values, data }` / `{ event, values: false, data }` |
| `Confirm:Yes` / `Confirm:No` | `{ event, data }` |
| `Interaction:Trigger` / `Interaction:Back` / `Interaction:Hide` | the item / – / – |
| `targetingAction` | `{ event, data }` or `false` |
| `Meth:Start` / `Meth:Cancel` | `{ tableId, ingredients, cookTime }` / – |

Focus is set by Lua for the list menu, input, confirm, interaction wheel,
targeting menu, meth table and settings. Escape always calls the matching
close callback so Lua can drop focus.

## Dropped as dead

`Arcade` scoreboard, `TCG` cards and the legacy `Action` (SHOW_ACTION/HIDE_ACTION)
container were never rendered by the old app or never triggered by Lua.
`SHOW_SCOPE`/`HIDE_SCOPE`/`ARMED`, `TOGGLE_LOC`, `UPDATE_STATUSES`,
`SHOW_FUEL`/`HIDE_FUEL`, `UPDATE_SPEED_MEASURE` have no sender in `client/`.
