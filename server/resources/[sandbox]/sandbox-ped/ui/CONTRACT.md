# sandbox-ped: Lua and NUI contract

Extracted from `client/*.lua` (the source of truth). Message `type` names and
payload fields are used verbatim by `src/bridge.js`; callback bodies are built
in `src/state/*.svelte.js`.

## Modes

`SET_STATE.state` is one of:

| state     | Opened by                                    | Price key | Eyebrow        | Cancel |
|-----------|----------------------------------------------|-----------|----------------|--------|
| `CREATOR` | `Ped.Creator:Start` (first spawn, no ped)    | CREATOR   | New character  | no, Save is the only way out |
| `SHOP`    | clothing store zone                          | SHOP      | Clothing store | yes |
| `BARBER`  | barber zone                                  | BARBER    | Barber         | yes |
| `TATTOO`  | tattoo parlour zone                          | TATTOO    | Tattoo parlour | yes |
| `SURGERY` | plastic surgeon (sends `SET_WL_PEDS` first)  | SURGERY   | Surgery        | yes |

Sections per mode (`src/data/sections.js`):

- CREATOR: Heritage, Features, Skin, Makeup, Haircut, Brows and beard, Chest hair, Tops, Legs and feet, Accessories, Masks and bags, Blemishes (body), Ped model, Tattoos (all six zones).
- SHOP: Tops (top, undershirt, vest, arms and gloves), Legs and feet, Accessories (props), Masks and bags (mask, bag, neck, badge).
- BARBER: Haircut, Brows and beard, Chest hair, Makeup.
- TATTOO: one section per zone (Torso, Head, Left arm, Right arm, Left leg, Right leg).
- SURGERY: Heritage, Features, Skin, Makeup, Haircut, Brows and beard, Chest hair, Arms, Blemishes, Ped model.

Open sequence (`client/ped.lua`): `SetNuiFocus(true, true)`, (SURGERY: `SET_WL_PEDS`), `SET_STATE`, `APP_SHOW`.
There is no hide message: the UI hides itself when `Save` answers truthy or
when the player confirms Cancel; Lua drops focus in `Ped.Customization:Hide()`
or `Ped.Creator:End()`.

## Lua to UI (SendNUIMessage)

| type | data | when |
|------|------|------|
| `APP_SHOW` | none | after `SET_STATE`; ignored when no valid mode is set |
| `SET_STATE` | `{ state }` | see modes; resets section, camera, undress, dialogs, error |
| `SET_PED_DATA` | `{ ped: { model, customization }, gender: 0 or 1 }` | `Characters:Client:Updated` (Ped / GangChain) and after `Cancel` |
| `SET_PRICING` | `{ pricing: { CREATOR, BARBER, SHOP, TATTOO, SURGERY } }` | character spawn (`GlobalState["Ped:Pricing"]`) |
| `SET_TATTOOS_DATA` | `{ data: [ { Collection, Name, HashNameMale, HashNameFemale, Zone } ] }` | spawn, `UI:Client:Reset`, creator start (`tattoos.lua`) |
| `SET_WL_PEDS` | `{ data: [ { model, label } ] }` | SURGERY only, before `SET_STATE` (`whitelisted_peds` rows) |
| `SET_HAIR_COLORS_MAX` | `{ max, maxOverlays }` | reply to `GetNumHairColors` |
| `SET_HAIR_COLOR_RGB` | `{ type, name, rgb: "rgb(r, g, b)" }` | reply to `GetPedHairRgbColor`; `type` and `name` are echoed |
| `SET_MAX_DRAWABLE` | `{ id: componentId, type: "components" or "props", max: number[] }` | reply to `GetNumberOf(Prop)DrawableVariations`; `max` lists the drawable ids the store sells |
| `SET_MAX_TEXTURE` | `{ id: componentId, textureId, type, max: number }` | reply to `GetNumberOf(Prop)TextureVariations`; `max` is the texture count of the asked drawable (`textureId` is an echo the UI does not send or read) |
| `UI_RESET` | `{}` | `UI:Client:Reset` (Lua also drops focus); clears every state module |
| `CLOSE_LIST_MENU` | none | sent by `Wardrobe:Close` for sandbox-base's list menu. Not for this UI: no handler. |

### `ped.customization` (server/ped.lua TemplateData)

```
face:        face1 / face2 / face3 { index, texture, mix 0..100 }, features (see below)
eyeColor:    0..28
overlay:     blemish(0) facialhair(1) eyebrows(2) ageing(3) makeup(4) blush(5) complexion(6) sundamage(7)
             lipstick(8) freckles(9) chesthair(10) bodyblemish(11) addbodyblemish(12)
             each { id, index, opacity 0..100, disabled, color1?, color2? }
colors:      hair / facialhair / eyebrows / chesthair { color1 { index, rgb }, color2 { index, rgb } }
components:  face(0) mask(1) hair(2) torso(3) leg(4) bag(5) shoes(6) accessory(7) undershirt(8) kevlar(9)
             badge(10) torso2(11)  { componentId, drawableId, textureId, paletteId }
props:       hat(0) glass(1) ear(2) watch(6) bracelet(7)  { componentId, drawableId, textureId, disabled }
tattoos:     [ { Name, Collection, Zone, HashNameMale?, HashNameFemale?, Hash? } ]  (Name "" = empty slot)
hairOverlay: optional; -1 or missing follows the haircut, 0 none, 1..n = Config.CustomHairOverlays[n]
model:       ped model name ("" = freemode by gender)
```

Face features are keyed by feature number: `SetPedFaceFeature` stores
`features[index]` and `ApplyToPed` reads `features[i]` or `features[tostring(i)]`.
A table that is a plain Lua sequence (the template, keys 1..20) arrives as a JSON
array whose first element is Lua key 1, so `normalisePed` maps array position
k to feature k + 1; an object with string keys maps "n" to feature n.

`SET_PED_DATA` is merged over the template so every key the editor binds to exists.

## UI to Lua (RegisterNUICallback)

| callback | body | reply | sent when |
|----------|------|-------|-----------|
| `Save` | `{}` | `true` / `false` | Save confirmed in the dialog. False means not enough cash (Lua also shows a notification); the editor stays open with an error above the buttons |
| `Cancel` | `{}` | `true` | discard confirmed (the UI hides first) |
| `FrontEndSound` | `{ sound: "SELECT" or "BACK" or "UPDOWN" }` | `"ok"` | steppers (UPDOWN), toggles, sections, camera (SELECT), removing a tattoo (BACK) |
| `ToggleNekked` | raw boolean | `"ok"` | the wanted undress state changes (player's Undress checkbox, or a tattoo section forcing it); only on the freemode peds |
| `ChangeCamera` | raw number: 0 full body, 1 face, 2 upper body, 3 legs | `"ok"` | view buttons; pressing the active one returns to 0 |
| `RotateLeft` / `RotateRight` | `{}` | `"ok"` | turn buttons, Q / E keys (throttled to one per 50 ms) |
| `Zoom` | `{ zoom }` (added to camera radius) | `"ok"` | zoom buttons (plus or minus 0.15), mouse wheel over the game (`deltaY / 2000`) |
| `Animation` | `{}` | `"ok"` | R key (toggles the idle pose) |
| `SetPedHeadBlendData` | `{ face: "face1" or "face2" or "face3", type: "index" or "texture" or "mix", value }` | `"OK"` | Heritage; "Mix two parents" sets face3.mix 0 (blend) or 100 (one face) |
| `SetPedFaceFeature` | `{ index: 0..19, value: -100..100 }` | `"OK"` | Features sliders (throttled while dragging) |
| `SetPedHeadOverlay` | `{ type: overlayKey, extraType: "index" or "opacity" or "disabled" or "color1" or "color2", value }` | `"OK"` | Skin, Makeup, Brows and beard, Chest hair, Blemishes |
| `SetPedComponentVariation` | `{ name: componentKey, type: "drawableId" or "textureId", value }` | `"OK"` | clothing, haircut, arms; a new style also sends textureId 0 |
| `SetPedPropIndex` | `{ name: propKey, type: "drawableId" or "textureId" or "disabled", value }` | `"OK"` | Accessories |
| `SetPedHairColor` | `{ name: "hair" or "facialhair" or "eyebrows", type: "color1" or "color2", value }` | `"OK"` | hair colour steppers and swatches |
| `SetPedHairOverlay` | `{ value }` | `"OK"` | Haircut, Hairline fade select |
| `SetPedEyeColor` | `{ value }` | `"OK"` | Features, eye colour select |
| `SetPed` | `{ value: modelName }` | `true` once loaded, `false` on timeout | Ped model; on true the UI stores the model and asks for every range again |
| `AddPedTattoo` | `{ type: zone }` | `"OK"` | Add tattoo (only while fewer than 25 slots) |
| `RemovePedTattoo` | `{ index }` (0-based in the whole list) | `"OK"` | Remove |
| `SetPedTattoo` | `{ index, data: { Collection, Name, HashNameMale, HashNameFemale, Zone } }` | `"OK"` | design select or stepper |
| `GetNumHairColors` | `{}` | then `SET_HAIR_COLORS_MAX` | first `APP_SHOW` of a session |
| `GetPedHairRgbColor` | `{ colorId, type: colorId, name: "palette" }` | then `SET_HAIR_COLOR_RGB` | once per colour after `SET_HAIR_COLORS_MAX`; the echoed `type` and `name` build the swatch palette |
| `GetNumberOfPedDrawableVariations` | `{ componentId }` | then `SET_MAX_DRAWABLE` | once per slot per ped model |
| `GetNumberOfPedTextureVariations` | `{ componentId, drawableId }` | then `SET_MAX_TEXTURE` | whenever a slot's drawable changes |
| `GetNumberOfPedPropDrawableVariations` | `{ componentId }` | then `SET_MAX_DRAWABLE` | once per prop slot per ped model |
| `GetNumberOfPedPropTextureVariations` | `{ componentId, drawableId }` | then `SET_MAX_TEXTURE` | while the prop is worn and its drawable changes |

`FrontEndSound` "DISABLED" exists in Lua but the editor never needs it.

## Focus and keys

Lua owns focus: `SetNuiFocus(true, true)` in `Ped.Creator:Start` and
`Ped.Customization:Show`; `SetNuiFocus(false, false)` in `Ped.Customization:Hide`,
`Spawn:PlacePedIntoWorld`, `UI:Client:Reset` and `Wardrobe:Close`. The UI never
calls `SetNuiFocus`.

Keys while the editor is open and no dialog shows: Q / E turn the ped, R toggles
the idle pose, Escape opens the discard dialog (not in CREATOR, which has no
way out but Save). Inside a dialog Escape closes it. No key hints are shown.

## Preview harness only

`scripts/preview.mjs` can post `{ "raw": { "previewSection": "<id>", "previewDialog": "save" or "cancel",
"previewError": "payment" or "save", "previewNaked": true } }`. These objects have no
`type`, so the NUI router ignores them and Lua never sends them; `src/bridge.js`
reads them to open a section, a dialog or the error state for screenshots.

## Dropped from the old UI

- `SET_LOADING`, `APP_HIDE`, `SET_CAM`, `SET_NEKKED`, `FORCE_NEKKED`, `UPDATE_*`: internal actions of the old UI, not sent by Lua.
- `SetPedHeadOverlayColor`: no such callback is registered.
- Key hint footers and the "Tip" overlay: removed by design rule.
