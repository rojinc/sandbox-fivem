# sandbox-hud NUI contract

Source of truth: `client/*.lua`. Every `SendNUIMessage({ type, data })` below is
routed by `ui/src/bridge.js` straight into the rune state modules under
`ui/src/state`. The in-world HUD follows the minimal-hud layout (status bars
under the minimap, speedometer bottom right, compass pills top centre); menus,
dialogs, prompts and notifications use the GOLD page chrome from `@sandbox/ui-kit`.

## Layout notes

- `client/hud.lua` positions the minimap 0.04 higher than stock (minimap, mask
  and blur components, and `GetMinimapAnchor`) so the status row fits between
  the map and the bottom edge. The anchor is sent with `UPDATE_MM_POS`,
  `SHIFT_LOCATION` and `SHOW_VEHICLE` as normalised `leftX/rightX/topY/bottomY/width/height`.
- The HUD root scales with the viewport (`font-size: 0.8333vw`, 16px at 1920),
  so 1440p and 4K keep the 1080p proportions.
- Speed arrives in mph; the UI converts when `config.speedUnit === 'kph'`.

## Per-character config (`SET_CONFIG`, saved with `SaveConfig`)

| Key | Default | Meaning |
| --- | --- | --- |
| `compassLocation` | `top` | `top`, `bottom` or `hidden` |
| `compassAlways` | `true` | `false` shows the compass only in vehicles |
| `hideCrossStreet` | `false` | drop the cross street from the street pill |
| `hideCompassBg` | `false` | no boxes behind the compass text |
| `maskRadio` | `false` | hide the radio channel (also read by sandbox-radio) |
| `speedUnit` | `mph` | `mph` or `kph` |
| `showRPM` | `true` | RPM arc on the speedometer |
| `showGears` | `true` | gear ticks and current gear |
| `skewed` | `false` | perspective tilt on the two clusters |
| `skewAmount` | `15` | tilt in degrees (0–35) |

`server/server.lua` seeds this object on character creation; unknown keys from
older saves are ignored and missing keys fall back to the defaults above.

## Lua → UI

| Type | Payload | State |
| --- | --- | --- |
| `SHOW_HUD` / `HIDE_HUD` / `TOGGLE_HUD` | `{ hp, maxHp, armor, fuel? }` on show | hud, status, vehicle |
| `SET_CONFIG` | `{ config }` | hud |
| `UPDATE_MM_POS` / `SHIFT_LOCATION` | `{ position }`, `{ shift, position }` | hud |
| `SET_VOIP_LEVEL` | `{ level 1..3, talking 0/1/2, icon? }` | hud |
| `TOGGLE_SETTINGS` | `{ state }` | hud |
| `UPDATE_HP` | `{ hp, maxHp, armor }` | status |
| `SET_DEAD` | `{ state }` | status |
| `REGISTER_STATUS` / `UPDATE_STATUS` | `{ status: { name, max, value, icon, color, flash, options } }` | status |
| `UPDATE_STATUS_VALUE` | `{ name, value }` | status |
| `RESET_STATUSES` | – | status |
| `REGISTER_BUFF` | `{ id, data: { icon, color, duration, type } }` | status |
| `BUFF_APPLIED` / `BUFF_APPLIED_UNIQUE` | `{ instance: { buff, override, val, options, startTime } }` | status |
| `BUFF_UPDATED` | `{ buff, val?, override? }` | status |
| `REMOVE_BUFF_BY_TYPE` | `{ type }` | status |
| `UPDATE_LOCATION` | `{ location: { main, cross, area, direction } }` | location |
| `SHOW_VEHICLE` / `HIDE_VEHICLE` / `TOGGLE_VEHICLE` | – | vehicle |
| `UPDATE_SPEED` | `{ speed (mph), gear (false or 0..n), gears, headlights 0/1/2 }` | vehicle |
| `UPDATE_IGNITION` `UPDATE_RPM` `UPDATE_FUEL` `UPDATE_NOS` `UPDATE_SEATBELT` `UPDATE_CRUISE` `UPDATE_ENGINELIGHT` | `{ ignition }` `{ rpm 0..1 }` `{ fuel, fuelHide }` `{ nos }` `{ seatbelt }` `{ cruise }` `{ checkEngine }` | vehicle |
| `SHOW_SEATBELT` / `HIDE_SEATBELT` | – | vehicle |
| `ADD_ALERT` | `{ notification: { _id?, type, message, duration, icon } }` | ui.notifications |
| `HIDE_ALERT` | `{ id }` | ui.notifications |
| `CLEAR_ALERTS` | – | ui.notifications |
| `ADD_ACTION` / `REMOVE_ACTION` / `REMOVE_ALL_ACTIONS` | `{ id, message }` / `{ id }` / – | ui.actions |
| `START_PROGRESS` / `CANCEL_PROGRESS` / `FAIL_PROGRESS` | `{ duration, label }` / – / – | ui.progress |
| `SET_LIST_MENU` / `CLOSE_LIST_MENU` | `{ menus }` / – | ui.list |
| `SHOW_INPUT` / `CLOSE_INPUT` | `{ title, label, inputs, event, data }` / – | ui.input |
| `SHOW_CONFIRM` / `CLOSE_CONFIRM` | `{ title, yes, no, description, data, denyLabel, acceptLabel }` / – | ui.confirm |
| `SHOW_INTERACTION_MENU` / `SET_INTERACTION_LAYER` / `SET_INTERACTION_MENU_ITEMS` | `{ toggle }` / `{ layer }` / `{ items }` | ui.interaction |
| `SHOW_EYE` / `HIDE_EYE` / `OPEN_MENU` / `CLOSE_MENU` | `{ icon }` / – / `{ menu }` / – | ui.thirdEye |
| `OPEN_METH` / `CLOSE_METH` | `{ config: { ingredients, cookTimeMax, tableId } }` / – | ui.meth |
| `SHOW_INFO_OVERLAY` / `CLOSE_INFO_OVERLAY` | `{ info: { label, description } }` / – | ui.infoOverlay |
| `SHOW_OVERLAY` / `HIDE_OVERLAY` | `[ item ]` / – | ui.overlay |
| `SHOW_GEM_TABLE` / `CLOSE_GEM_TABLE` | `{ info }` / – | ui.gemTable |
| `DO_DEATH_TEXT` / `DO_DEATH_RELEASING` / `HIDE_DEATH_TEXT` | `{ type, deathTime, timer, key, f1Key, medicalPrice }` / – / – | ui.death |
| `SET_BLINDFOLD` | `{ state }` | ui |
| `SET_FLASHBANGED` / `CLEAR_FLASHBANGED` | `{ duration, strength }` / – | ui |
| `UI_RESET` | `{ manual }` | every transient surface |

Status `options` honoured: `order`, `hideZero`, `hideHigh`, `visibleWhileDead`,
`customMax`, `force: 'numbers'` (rendered as an icon + value pill instead of a bar).

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
close callback so Lua can drop focus; the UI never calls SetNuiFocus.

## Previews

`node scripts/preview.mjs --ui sandbox-hud` renders every `ui/preview/*.json`
scenario to `.preview/sandbox-hud/`. Scenarios post the messages above verbatim.
