# sandbox-inventory NUI contract

Source of truth: `client/*.lua` (every `SendNUIMessage` and `RegisterNUICallback`
in this resource) and the server handlers they call. Every message below is
routed by `ui/src/bridge.js` into the rune state modules under `ui/src/state`.
Messages are `{ type, data }`; Lua arrays may arrive as objects with numeric
keys, so the UI reads them with `Object.values()`.

## Screens

- **Inventory** (`APP_SHOW` .. `APP_HIDE`): the player grid on the left, the
  secondary inventory (ground, trunk, glovebox, stash, shop, player shop) or the
  crafting bench on the right, and the selected item, amount field and actions
  between them.
- **Hotbar** (`HOTBAR_SHOW`): slots 1 to 5 at the bottom centre for 5 seconds,
  plus the equipped weapon when it sits outside slots 1 to 5.
- **Item changes** (`ADD_ALERT`): short notices above the bottom right of the
  screen ("Added 2", "Removed 1", "Used", "Equipped", "Holstered").
- **Static tooltip** (`OPEN_STATIC_TOOLTIP`): an item tooltip on the right edge
  while the inventory is closed (gem tables in sandbox-businesses).

## Focus

Lua owns focus. `Inventory:Client:Open` calls `SetNuiFocus(true, true)` after
`APP_SHOW`; `Inventory.Close:All()` sends `APP_HIDE` and calls
`SetNuiFocus(false, false)`. The UI never calls `SetNuiFocus`. Escape and F2
call `Close` while the inventory is open (and are declined otherwise). No key
hints are shown anywhere.

## Lua -> UI messages

| type | data | Sent from | UI effect |
| --- | --- | --- | --- |
| `ITEMS_UNLOADED` | `{}` | startup.lua `LoadItems`, inventory.lua `DoItemLoad` | item list marked as not loaded; the inventory shows "Loading items" |
| `RESET_ITEMS` | `{}` | same | clears every item definition |
| `SET_ITEMS` | `{ items: { [name]: ItemDef } }` | inventory.lua `DoItemLoad` | replaces the item definitions |
| `ADD_ITEM` | `{ id: name, item: ItemDef }` | startup.lua `LoadItems`, `Inventory:Client:NewItemCreated` | adds or replaces one definition |
| `ITEMS_LOADED` | none | startup.lua, inventory.lua | item list ready |
| `SET_SCHEMS` | `{ [schematicId]: { result: { name, count }, items: [{ name, count }] } }` (the map itself is `data`) | `Characters:Client:Spawn` | used by tooltips of schematic items ("Teaches") |
| `UPDATE_SETTINGS` | `{ settings: { muted: boolean, useBank: boolean } }` | spawn, `Characters:Client:Updated` | merges settings; `muted` silences the drag sound |
| `SET_MODE` | `{ mode: 'inventory' \| 'crafting' }` | `Inventory:Client:Open` | right-hand side shows the secondary inventory or the bench |
| `SET_BENCH` | `{ bench: string, cooldowns: { [recipeId]: expiresMs } \| null, recipes: Recipe[] }` | `Inventory:Client:Open` (crafting) | crafting table |
| `APP_SHOW` | none | `Inventory:Client:Open` | shows the inventory |
| `APP_HIDE` | none | `Inventory.Close:All()` | hides it, drops the selection and any held item, hides the secondary, resets the mode to `inventory` |
| `SET_PLAYER_INVENTORY` | `PlayerInventory` (below) | `Inventory.Set.Player:Inventory` | merged into the player inventory; `invType` forced to 1; slot locks kept |
| `SET_SECONDARY_INVENTORY` | `SecondaryInventory` (below) | `Inventory.Set.Secondary:Inventory` | replaces the secondary; slot locks kept only when owner and invType match |
| `SHOW_SECONDARY_INVENTORY` | none | `Inventory.Open:Secondary` | shows the right-hand panel |
| `SET_INVENTORIES` | `{ player?: { inventory }, secondary?: { inventory } }` | `StoreFailedPurchase` | merges both (rolls back an optimistic purchase) |
| `SET_PLAYER_SLOT` | `{ slot: number \| SlotRecord }` | `Inventory:Client:SetSlot` | unlocks that player slot (the server sometimes sends the whole slot record; the UI reads `.Slot`) |
| `SET_SECONDARY_SLOT` | `{ slot: number }` | same | unlocks that secondary slot |
| `USE_ITEM_PLAYER` | `{ originSlot: number }` | hotkeys 1 to 5, throwables (weapons.lua) | locks the player slot while it is used |
| `SLOT_NOT_USED` | `{ originSlot: number }` | same | unlocks it |
| `USE_IN_PROGRESS` | `{ state: boolean }` | `Inventory:Client:InUse` | Use is unavailable while true ("You are using an item") |
| `SET_EQUIPPED` | `{ item: SlotRecord \| null }` | weapons.lua | equipped weapon (hotbar marker, attachment fit in tooltips) |
| `HOTBAR_SHOW` | `{ items: SlotRecord[], equipped: SlotRecord \| null }` | hotbar.lua `OpenHotBar` | shows the hotbar for 5 seconds (not in crafting mode) |
| `HOTBAR_HIDE` | none | hotbar.lua `CloseHotBar` (not called today) | hides it |
| `ADD_ALERT` | `{ alert: { id, type: 'add' \| 'removed' \| 'used' \| 'Equipped' \| 'Holstered', item: name, count } }` | `Inventory:Client:Changed` | item-change notice for 3 seconds, at most 5 |
| `OPEN_STATIC_TOOLTIP` | `{ item: SlotRecord }` | `Inventory.StaticTooltip:Open` | tooltip on the right edge |
| `CLOSE_STATIC_TOOLTIP` | none | `Inventory.StaticTooltip:Close` | hides it |
| `RESET_INVENTORY` | none | only in a commented-out line in hotbar.lua | handled anyway: player and secondary back to empty, locks kept |

### Shapes

```
PlayerInventory = {
  size, name, invType: 1, capacity, owner (SID), loaded: boolean,
  inventory: SlotRecord[], isWeaponEligble: boolean (sic), qualifications: string[]
}
SecondaryInventory = {
  size, name, invType, owner, capacity, loaded, inventory: SlotRecord[],
  class, model, shop, free, playerShop, modifyShop,
  action: { icon, text, event } | false, slotOverride, capacityOverride
}
SlotRecord = { id?, Name, Slot, Count, CreateDate (unix s), Price?, Quality?, Owner, invType,
               MetaData: object | JSON string }
ItemDef = { name, label, description?, price, isUsable, isStackable: number | false, type, rarity,
            weight, durability? (s), isDestroyed?, iconOverride?, staticMetadata?, requiresLicense?,
            qualification?, schematic? (key of SET_SCHEMS), component? ({ strings: { [weapon]: hash } }),
            weapon?, container? }
Recipe = { id, result: { name, count }, items: [{ name, count }], cooldown? (ms), time? }
```

Item types (`type`) and rarities (`rarity`) are labelled as before: 1 Consumable,
2 Weapon, 3 Tool, 4 Crafting ingredient, 5 Collectable, 6 Junk, 7 Unknown,
8 Evidence, 9 Ammunition, 10 Container, 11 Gem, 12 Paraphernalia, 13 Wearable,
14 Contraband, 15 Gang chain, 16 Weapon attachment, 17 Crafting schematic,
18 Device, 19 Explosive device; rarity 1 Common, 2 Uncommon, 3 Rare, 4 Epic,
5 Objective, 6 Legendary, 7 Exotic.

Item images: `metadata.CustomItemImage`, then `staticMetadata.CustomItemImage`,
then `ui/images/items/<iconOverride or name>.webp` (served by the manifest
entry `ui/images/items/*.webp`, requested as
`https://cfx-nui-<resource>/ui/images/items/...`, the same URL the old relative
path resolved to). A missing image falls back to `ph.webp`, then to the item
name written in the cell.

Weights are shown in kg (one constant, `WEIGHT_UNIT` in `src/lib/item.js`); the
old UI labelled the same numbers lbs and the Lua defines no unit.

## UI -> Lua callbacks

| Callback | Body | Answer | Notes |
| --- | --- | --- | --- |
| `MoveSlot` | `{ ownerFrom, ownerTo, slotFrom, slotTo, name, countFrom, countTo, invTypeFrom, invTypeTo, vehClassFrom, vehClassTo, vehModelFrom, vehModelTo, slotOverrideFrom, slotOverrideTo, capacityOverrideFrom, capacityOverrideTo, isSplit }` | `"OK"` | Lua adds `class`, `model`, `inventory` from `SecondInventory`; the server reads owner/slot/invType from and to, `name`, `countTo`, `isSplit`. Buying from a shop is a move out of the shop. |
| `SwapSlot` | same without `isSplit` | `"OK"` | |
| `MergeSlot` | same without `isSplit` | `"OK"` | |
| `UseItem` | `{ owner, slot, invType }` | `"OK"` | player items only |
| `AddToShop` | `{ ownerFrom, invTypeFrom, slotFrom, ownerTo, invTypeTo, slotTo, price, quantity }` | `{ player: SlotRecord[], secondary: SlotRecord[] } \| false` | player shop moderators only |
| `SubmitAction` | `{ owner, invType }` | `"OK"` | the secondary's `action` button; Lua closes the inventory |
| `UpdateSettings` | `{ muted: boolean, useBank: boolean }` | `"OK"` | exactly the server whitelist (`_defInvSettings` in server/inventory.lua); the UI always sends both keys with the current values |
| `Crafting:Craft` | `{ bench, qty, result: recipeId }` | `{ inventory: SlotRecord[], cooldowns } \| false` | qty 1 to 50 (server limit) |
| `Close` | `{}` | `true` | Escape, F2 and the Close button |
| `Crashed` | `{}` | `true` | the "Close inventory" button on the crash screen |
| `FrontEndSound` | `'SELECT' \| 'DISABLED' \| 'SHOP_ADD'` (a bare string) | `"ok"` | game front-end sounds |
| `SendNotify` | `{ alert: 'success' \| 'warning' \| 'error', message, time }` | `"OK"` | kept in Lua; the UI shows its own messages inline and does not call it |
| `BrokeShit` | `{}` | `true` | kept in Lua; never called (it was not called by the old UI either) |

Moves are optimistic, as before: the UI updates both grids at once and locks
the two slots until `SET_PLAYER_SLOT` / `SET_SECONDARY_SLOT` unlock them. A lock
also clears itself after 10 seconds so a lost reply cannot freeze a slot.

## Interaction

- Drag an item onto another slot to move, stack or swap it. Shops, full
  inventories, ineligible purchases and open containers refuse the drop with
  the `DISABLED` sound and a message between the panels.
- Click an item to select it (2px ink edge). The amount field then sets how
  many move when you drag the selected item, buy it or move it across with the
  button; Use acts on the selected player item.
- Shortcuts kept from the old UI, never advertised: Shift-click moves the
  stack across, Ctrl-drag takes half, middle click uses, right click picks up
  half the stack (Ctrl-right click one) until the next click.
- Player shop moderators drop their own items on the shop to open the
  "Add to shop" form (quantity and price per unit) between the panels.

## Dropped

- The help modal with the hotkey list and the shift-right-click split menu:
  no key hints, and the amount field replaces the split menu.
- `UNLOAD_ITEMS`, `SET_AVALIABLE_ITEMS`, `SET_EQUIPMENT`, `UPDATE_BOTH_INVS`,
  `SET_CRAFTING`, `END_CRAFTING`, `CRAFT_PROGRESS`, `RESET_SLOT`: reducer cases
  of the old UI that no Lua sends.
- Rarity colours and glows: rarity is a small Tag in the tooltip.

## Lua changes

- `client/crafting.lua` `Crafting:Craft`: the callback indexed `state.error`
  on a `nil`/`false` answer from the server and never answered the UI; it now
  answers `false` (with the error notification) in that case too.
