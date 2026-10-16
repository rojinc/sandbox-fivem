# sandbox-menu NUI contract

Source of truth: `client/component.lua` (the `Menu` component other resources
build menus with), `client/nui.lua` (the callbacks) and `client/example.lua`
(`Menu:Client:Test`). Every `SendNUIMessage({ type, data })` below is routed by
`ui/src/bridge.js` into `ui/src/state/menu.svelte.js`.

The UI is one panel (420px, 2px ink frame) docked at the left middle of the
screen, scaled up with the viewport above 1920x1080. Lua's `ToggleFocusLoss`
puts the cursor back at (0.2, 0.5) of the screen, which lands on the panel.

## Lua -> UI

| Type | `data` | Effect |
| --- | --- | --- |
| `SETUP_MENU` | `{ data: Menu }` | `menu:Show(back)`. Replaces the menu and clears the back stack. Same menu id as the one showing (going back to the root) keeps the cursor. |
| `APP_SHOW` | none | Shows the panel. Lua sets focus. |
| `APP_HIDE` | none, or `{}` | Hides the panel (`Close`, `UI:Client:Reset`, logout). The next `SETUP_MENU` starts at the top. |
| `CLEAR_MENU` | none | `menu:Close()`. Empties the menu and the back stack. |
| `UPDATE_MENU` | `{ data: Menu }` | `menu.Update:Item(...)` re-sends the whole menu after changing one item. Replaces the menu with the same id (showing, or one on the back stack); with no match it replaces the showing menu, as the old UI did. |
| `SUBMENU_OPEN` | `{ data: Menu, addHistroy: bool }` | `menu:SubMenu(id, back)`. `addHistroy` (spelt so in Lua) pushes the showing menu onto the back stack. The same id as the showing menu is treated as a refresh. |

`Menu = { id, label, items: Item[], subtitle? }`. `subtitle` is optional and
not sent by any Lua today; it shows under the title when present.

`Item = { type, id, label, options, menu? }`. `options` is passed through from
the caller untouched, so every option below can be set by a resource.
`options.description` (optional, any type) shows under the list while that
item is selected. Unknown types render as `BUTTON`, as before.

| Type | Lua builder | Options read | `Selected` body | Sound |
| --- | --- | --- | --- | --- |
| `BUTTON` | `Add:Button(label, options, cb)` | `disabled`, `success` (green tick after the label), `error` (label in red) | `{ id }` | `SELECT` |
| `ADVANCED` | `Add:AdvButton(label, options, cb)` | `secondaryLabel` (required, shown on the right), `disabled` | `{ id }` | `SELECT` |
| `CHECKBOX` | `Add:CheckBox(label, options, cb)` | `selected` (required; `checked` is accepted too), `disabled` | `{ id, data: { selected } }` | `SELECT` |
| `SLIDER` | `Add:Slider(label, options, cb)` | `min`, `max`, `current` (required), `step` (default 1, decimals allowed), `disabled` | `{ id, data: { value: number } }` when the drag or the arrow key is released | `SELECT` |
| `TICKER` | `Add:Ticker(label, options, cb)` | `min`, `max`, `current` (required), `disabled` | `{ id, data: { value: integer } }` on every step; wraps max to min and min to max | `UPDOWN` |
| `SELECT` | `Add:Select(label, options, cb)` | `current`, `list: [{ label, value }]` (required), `disabled`. Values may be numbers, strings or booleans | `{ id, data: { value } }` on every change | `UPDOWN` (stepping), `SELECT` (picked from the list) |
| `INPUT` | `Add:Input(label, options, cb)` | `max` (required, max length), `current`, `disabled` | `{ id, data: { value: string } }` on every keystroke | none |
| `NUMBER` | `Add:Number(label, options, cb)` | `current`, `min`, `max`, `disabled` | `{ id, data: { value: string } }` on every keystroke (callers `tonumber()` it) | none |
| `COLORPICKER` | `Add:ColorPicker(options, cb)` (no label) | `current: { r, g, b }` (required), `label` (default "Colour"), `disabled` | `{ id, data: { color: { r, g, b } } }` on "Save colour" | `SELECT` |
| `COLORLIST` | `Add:ColorList(options, cb)` (no label) | `current` (0-based index into `colors`, or the colour object Lua's `UpdateValue` stores), `colors: [{ label, hex?, rgb?: { r, g, b } }]` (required), `label` (default "Colour"), `disabled` | `{ id, data: { color: <the colors entry> } }` | `UPDOWN` |
| `TEXT` | `Add:Text(text, classes)` | `label` is HTML (sanitised); `options.classes` below | not selectable | none |
| `SUBMENU` | `Add:SubMenu(label, menu, options, openCb, closeCb)` | `disabled`; `id` is the submenu's id | `MenuOpen { id }` instead of `Selected` | `SELECT` |
| `GOBACK` | `Add:SubMenuBack(label, options, cb)` | `disabled` | `{ id }`, then the back step below | `BACK` |

Text classes: `heading` (bold, 18px, space above), `bold`, `pad` (more space),
`textLarge` (18px), `textExtraLarge` (22px), `textSmall` and `textMedium`
(16px, the minimum), `colorSuccess` / `colorWarning` / `colorError` (state
colour), `colorPrimary` (ink). `center`, `right` and `code` are ignored on
purpose: text is left-aligned and Roboto Mono is kept for live numbers.

A disabled item stays reachable with the arrow keys; activating it plays
`DISABLED` and sends nothing. The old UI ignored `disabled` on `ADVANCED` and
`CHECKBOX`; it is honoured on every type now.

## UI -> Lua (`RegisterNUICallback`)

| Callback | Body | When |
| --- | --- | --- |
| `Close` | `{}` | Escape, the close button, or going back from the root menu. Lua hides the panel, drops focus and runs every `-close` callback. The UI clears the menu itself (old `CLEAR_MENU` dispatch). |
| `MenuOpen` | `{ id }` or `{ id, back: true }` | A `SUBMENU` row, or going back (the menu being returned to). Lua answers with `SUBMENU_OPEN` or `SETUP_MENU`. |
| `MenuClose` | `{ id }` | The menu being left when going back. |
| `Selected` | `{ id, data? }` | Per type, table above. |
| `FrontEndSound` | `{ sound: 'SELECT' \| 'BACK' \| 'UPDOWN' \| 'DISABLED' }` | Moving the cursor with the keyboard plays `UPDOWN`; the rest per type. |
| `ToggleFocusLoss` | `{}` | Shift released while no text field has focus. Lua drops focus when the menu was created with `canFocusBeLost` and takes it back when Shift is released in game. |

Every callback answers `"OK"`/`"ok"`; the UI does not read the answers.

### Going back

A `GOBACK` row sends `Selected { id }` first; Backspace and the empty-state
button skip that. A back row and Backspace play `BACK`. Then: `MenuClose { id: <showing menu> }`, and either
`MenuOpen { id: <previous menu>, back: true }` (the previous menu is shown at
once with its cursor where it was, and Lua's `SUBMENU_OPEN`/`SETUP_MENU` answer
refreshes it), or, at the root, `Close {}`.

## Keyboard and focus

Lua owns focus (`menu:Show()` sets it, `Close` drops it); the UI never calls
`SetNuiFocus`. The old React app was mouse driven: Escape (keyup) closed and
Shift (keyup) sent `ToggleFocusLoss`. Both are kept, and the keyboard now drives
the whole menu. Handlers return `false` while the panel is hidden.

| Key | Effect |
| --- | --- |
| Up, Down | Move the cursor over every row except `TEXT`, wrapping. |
| Left, Right | Step a `TICKER`, `SELECT`, `SLIDER` or `COLORLIST`. |
| Enter | Activate: buttons, checkbox, submenu, back row; open the editor of `INPUT`/`NUMBER` (text field), `TICKER` (type a number), `SELECT` (list of every option) and `COLORPICKER` (red, green and blue). In an editor Enter saves. |
| Backspace | Back one menu (at the root: close). Closes an open list or colour editor without saving. |
| Escape | Leave the editor (a typed ticker number or colour is not saved), otherwise `Close`. |
| Shift (released) | `ToggleFocusLoss`, unless typing in a field. |

The mouse does the same: hover moves the cursor, a click activates, the chevrons
step, the tracks drag, the swatches pick.

## Dropped or changed, and why

- The drag handle (react-draggable), the logo watermark (`logo.png`) and the
  Pricedown font: the panel is docked and uses the kit look.
- The Material UI colour dialog (react-color): an inline red, green and blue
  editor. The colour sent no longer carries `a: 1`; no caller reads it.
- `TICKER`: the old left arrow wrapped from 0 to `max` and could not reach a
  negative `min` (customs use `min = -1` for stock parts), and sent a different
  value from the one it showed at `min`. It now steps over `min..max` and sends
  what it shows. The typed entry clamps to `min..max` (the old one turned values
  under `min` into `max`).
- `SLIDER`: the old UI needed a click on a tick icon to send; it now sends when
  the drag or the arrow key is released.
- `INPUT` is a single-line field (it was a multi-line text area); Enter finishes.
- `client/example.lua` passes `checked` to a checkbox and an `options` label list
  to a ticker without `max`/`current`. `ValidateOptions` rejects both, so neither
  reaches the UI.

## Development only

`PREVIEW_KEYS { keys: ['ArrowDown', 'Enter', ...] }` replays key presses so the
preview scenarios can show the cursor and the editors. It is only listened for
when the page is served from `localhost`/`127.0.0.1` (the preview harness and
`vite` on port 3022), never in game.

## Previews

`node scripts/preview.mjs --ui sandbox-menu` renders every `ui/preview/*.json`
to `.preview/sandbox-menu/`. Scenarios post the messages above verbatim.
