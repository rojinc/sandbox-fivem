# sandbox-ped — Lua ↔ NUI contract

Extracted from `client/*.lua` (source of truth). Message `type` names and
payload field names are used verbatim by the reducers in `src/features/*`.

## Modes

`SET_STATE.state` is one of:

| state     | Opened by                                   | Price key | Cancel? |
|-----------|---------------------------------------------|-----------|---------|
| `CREATOR` | `Ped.Creator:Start` (first spawn, no ped)   | CREATOR   | no — the only way out is Save |
| `SHOP`    | clothing-store zone, primary action         | SHOP      | yes |
| `BARBER`  | barber zone                                 | BARBER    | yes |
| `TATTOO`  | tattoo-shop zone                            | TATTOO    | yes |
| `SURGERY` | plastic-surgery zone (also sends `SET_WL_PEDS` first) | SURGERY | yes |

Open sequence (`client/ped.lua`): `SetNuiFocus(true, true)` → *(SURGERY: `SET_WL_PEDS`)* → `SET_STATE` → `APP_SHOW`.
There is **no hide message**: the UI hides itself when the `Save` callback resolves truthy
or when it calls `Cancel`; Lua drops focus in `Ped.Customization:Hide()` / `Ped.Creator:End()`.

## Lua → UI (SendNUIMessage)

| type | data | when |
|------|------|------|
| `APP_SHOW` | — | after `SET_STATE` |
| `SET_STATE` | `{ state }` | see modes |
| `SET_PED_DATA` | `{ ped: { model, customization }, gender: 0\|1 }` | `Characters:Client:Updated` (Ped / GangChain) and after `Cancel` |
| `SET_PRICING` | `{ pricing: { CREATOR, BARBER, SHOP, TATTOO, SURGERY } }` | character spawn (`GlobalState["Ped:Pricing"]`) |
| `SET_TATTOOS_DATA` | `{ data: [ { Collection, Name, HashNameMale, HashNameFemale, Zone } ] }` | spawn, UI reset, creator start (`tattoos.lua`, 435 designs, zones `ZONE_TORSO/HEAD/LEFT_ARM/RIGHT_ARM/LEFT_LEG/RIGHT_LEG`) |
| `SET_WL_PEDS` | `{ data: [ { model, label } ] }` | SURGERY only, before `SET_STATE` |
| `SET_HAIR_COLORS_MAX` | `{ max, maxOverlays }` | reply to `GetNumHairColors` |
| `SET_HAIR_COLOR_RGB` | `{ type, name, rgb: "rgb(r, g, b)" }` | reply to `GetPedHairRgbColor`; `type`/`name` are echoed from the request |
| `SET_MAX_DRAWABLE` | `{ id: componentId, type: "components"\|"props", max: number[] }` | reply to `GetNumberOfPed(Prop)DrawableVariations`; `max` is the list of drawable ids allowed in the store |
| `SET_MAX_TEXTURE` | `{ id: componentId, textureId, type: "components"\|"props", max: number }` | reply to `GetNumberOfPed(Prop)TextureVariations`; `max` = texture count of the requested drawable |
| `UI_RESET` | `{}` | `UI:Client:Reset` (also drops focus) |
| `CLOSE_LIST_MENU` | — | sent by `Wardrobe:Close` (`client/wardrobe.lua`) but it targets sandbox-base's list menu; the old UI had no reducer for it. **Dead for this NUI, ignored.** |

### `ped.customization` shape (server/ped.lua TemplateData)

```
face:       face1/face2/face3 { index, texture, mix }, features[0..19] (-100..100)
eyeColor:   0..28
overlay:    blemish(0) facialhair(1) eyebrows(2) ageing(3) makeup(4) blush(5) complexion(6)
            sundamage(7) lipstick(8) freckles(9) chesthair(10) bodyblemish(11) addbodyblemish(12)
            each { id, index, opacity 0..100, disabled, color1?, color2? }
colors:     hair / facialhair / eyebrows / chesthair { color1 {index, rgb}, color2 {index, rgb} }
components: face(0) mask(1) hair(2) torso(3) leg(4) bag(5) shoes(6) accessory(7) undershirt(8)
            kevlar(9) badge(10) torso2(11)  { componentId, drawableId, textureId, paletteId }
props:      hat(0) glass(1) ear(2) watch(6) bracelet(7) { componentId, drawableId, textureId, disabled }
tattoos:    [ { Name, Collection, Hash, Zone, HashNameMale?, HashNameFemale? } ] (max 25, Name "" = empty slot)
hairOverlay: optional, -1 auto / 0 none / 1..n index into Config.CustomHairOverlays
model:      ped model name ("" = freemode by gender)
```

## UI → Lua (RegisterNUICallback) — 27 callbacks, all used

| callback | body read by Lua | reply |
|----------|------------------|-------|
| `Save` | — | `true`/`false` (payment + `Ped:SavePed`; Lua hides on success) |
| `Cancel` | — | `true` (reverts, sends `SET_PED_DATA`, hides) |
| `FrontEndSound` | `{ sound: "SELECT"\|"BACK"\|"UPDOWN"\|"DISABLED" }` | `"ok"` |
| `ToggleNekked` | raw boolean body | `"ok"` |
| `ChangeCamera` | raw number body `0` standard, `1` head, `2` body, `3` legs | `"ok"` |
| `RotateLeft` / `RotateRight` | — | `"ok"` (±5° heading) |
| `Zoom` | `{ zoom: number }` (added to camera radius) | `"ok"` |
| `Animation` | — | `"ok"` (toggles idle pose) |
| `SetPedHeadBlendData` | `{ face: "face1"\|"face2"\|"face3", type: "index"\|"texture"\|"mix", value }` | `"OK"` |
| `SetPedFaceFeature` | `{ index: 0..19, value: -100..100 }` | `"OK"` |
| `SetPedHeadOverlay` | `{ type: overlayKey, extraType: "index"\|"opacity"\|"disabled"\|"color1"\|"color2", value }` | `"OK"` |
| `SetPedComponentVariation` | `{ name: componentKey, type: "drawableId"\|"textureId", value }` | `"OK"` |
| `SetPedPropIndex` | `{ name: propKey, type: "drawableId"\|"textureId"\|"disabled", value }` | `"OK"` |
| `SetPedHairColor` | `{ name: "hair"\|"facialhair"\|"eyebrows", type: "color1"\|"color2", value: colorId }` | `"OK"` |
| `SetPedHairOverlay` | `{ value }` | `"OK"` |
| `SetPedEyeColor` | `{ value }` | `"OK"` |
| `SetPed` | `{ value: modelName }` | `true` once loaded / `false` on timeout |
| `AddPedTattoo` | `{ type: zone }` | `"OK"` |
| `RemovePedTattoo` | `{ index }` (0-based) | `"OK"` |
| `SetPedTattoo` | `{ index, data: tattooObject }` (0-based) | `"OK"` |
| `GetNumHairColors` | — | → `SET_HAIR_COLORS_MAX` |
| `GetPedHairRgbColor` | `{ colorId, type, name }` | → `SET_HAIR_COLOR_RGB` (echoes `type`, `name`) |
| `GetNumberOfPedDrawableVariations` | `{ componentId }` | → `SET_MAX_DRAWABLE` (type components) |
| `GetNumberOfPedTextureVariations` | `{ componentId, drawableId }` | → `SET_MAX_TEXTURE` (type components) |
| `GetNumberOfPedPropDrawableVariations` | `{ componentId }` | → `SET_MAX_DRAWABLE` (type props) |
| `GetNumberOfPedPropTextureVariations` | `{ componentId, drawableId }` | → `SET_MAX_TEXTURE` (type props) |

Hair palette: the UI calls `GetPedHairRgbColor` once per colour id with
`name: "palette", type: <colorId>`; because Lua echoes both fields, the replies
build `catalog.palette[colorId] = rgb` for the swatch picker.

## Focus

Lua owns focus: `SetNuiFocus(true, true)` in `Ped.Creator:Start` and
`Ped.Customization:Show`; `SetNuiFocus(false, false)` in `Ped.Customization:Hide`,
`Spawn:PlacePedIntoWorld`, `UI:Client:Reset` and `Wardrobe:Close`.
Keys handled in the UI while focused: `Q`/`E` rotate, `R` pose, mouse wheel
zoom (outside the panel), `Esc` → cancel confirmation (or save confirmation in
CREATOR, which has no cancel path).

## Dropped from the old UI (never triggered by Lua)

* `SET_LOADING` / `Loader` — no Lua sender.
* `APP_HIDE`, `SET_CAM`, `SET_NEKKED`, `FORCE_NEKKED`, `UPDATE_*` — internal
  redux actions of the old UI, replaced by `ui/*` and `ped/*` local actions.
* `SetPedHeadOverlayColor` action creator — no such callback registered.
* The old "Body" category in SHOP only held the Arms slot; it is now a row in Clothes.
