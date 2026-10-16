# NUI guide

Every interface in this server is a small Svelte 5 app under
`server/resources/[sandbox]/<resource>/ui`, built with Vite into `ui/dist` and
loaded by FiveM through `ui_page 'ui/dist/index.html'`. They all share one
design system and runtime, `@sandbox/ui-kit` (in `/ui-kit`), and one look:
the GOLD design system (the Australian Government Design System) set in
Roboto. The design brief lives in `/DESIGN.md`; read it before changing a screen.

## Layout of a UI

```
ui/
  package.json        name "<resource>-ui", scripts dev/build, depends on @sandbox/ui-kit
  vite.config.js      export default nuiViteConfig({ root: import.meta.dirname, port })
  index.html          <div id="app"> + src/main.js
  CONTRACT.md         every Lua -> UI message and UI -> Lua callback, focus rules
  preview/*.json      scenarios the preview harness replays
  src/main.js         fonts, base.css, icon registration, installBridge(), mount(App)
  src/bridge.js       onNui(type, fn) handlers that mutate the state modules
  src/state/*.svelte.js   rune state ($state) shared by the components
  src/App.svelte      layer order
  src/components/**   the screens
  dist/               the build (committed: FiveM serves it as-is)
```

## The contract with Lua

- Lua sends `SendNUIMessage({ type = 'SHOW_X', data = {...} })`. The UI
  subscribes with `onNui('SHOW_X', (data) => ...)`. `data` is what Lua put in
  `data`; a Lua array arrives as an object with numeric keys when it is not
  dense, so use `Object.values()` when in doubt.
- The UI calls Lua with `await fetchNui('Callback', payload)`; Lua answers in
  `RegisterNUICallback('Callback', function(data, cb) ... cb(result) end)`.
- Focus belongs to Lua. The UI never calls `SetNuiFocus`; Escape calls the
  matching close callback and Lua drops focus. `onKey`/`onEscape` handlers
  return `false` while their surface is closed so other inputs keep working.
- Everything the server trusts must be validated in Lua. The UI is a client.
- HTML from Lua goes through `RichText` or `sanitizeHtml`, never raw `{@html}`.

Write `ui/CONTRACT.md` for every UI: the table of message types with their
payloads, the callbacks with their bodies, and anything dropped as dead.

## The kit

`import { ... } from '@sandbox/ui-kit'`:

- Page chrome: `AppShell` (header band, main nav, aside, footer), `Header`,
  `MainNav`, `SideNav`, `Breadcrumbs`, `Tabs`, `Footer`, `Toolbar`.
- Content: `Card`, `Callout`, `PageAlert`, `Tag`, `Accordion`, `EmptyState`,
  `ProgressBar`, `Spinner`, `Kbd`, `RichText`, `Icon`.
- Forms: `Field`, `TextInput`, `Textarea`, `Select`, `Checkbox`, `Radio`, `Button`, `Modal`.
- Runtime: `fetchNui`, `onNui`, `emitNui`, `onKey`, `onEscape`, `isEnvBrowser`,
  `mockNui`, `debugData`; `registerIcons`, `resolveIcon`; `sanitizeHtml`,
  `plainText`; `uid`, `clamp`, `formatMoney`, `formatNumber`, `formatDuration`,
  `formatClock`, `timeAgo`, `formatDate`.
- CSS: `@sandbox/ui-kit/base.css` (reset, typography, `.au-table`, `.au-dl`,
  `.au-mono`, `.au-muted`, `.au-truncate`, `.au-dark`/`.au-light` palette
  switches) and `@sandbox/ui-kit/tokens.css` (every `--au-*` token).
- Fonts: `@sandbox/ui-kit/fonts` (Roboto 400/500/700, Roboto Mono).

Icons are Font Awesome Free. Register the whole solid set
(`registerIcons(fas)`) only when Lua sends icon names at runtime; otherwise
import the definitions you use and pass them to `<Icon icon={faHeart} />`.
Pro names from the old UIs resolve through the alias map in
`ui-kit/src/icon-aliases.js`.

## Look

- Full-screen apps are gov pages: navy header band, teal-underlined main nav,
  side nav, breadcrumbs, white content column, footer band. Records are
  striped tables, details are definition lists, forms put labels above fields.
- Widgets floating over the world use the dark palette (`class="au-dark"`).
- The in-world HUD (`sandbox-hud`) is the exception: it follows the
  minimal-hud layout, see its `CONTRACT.md`.
- Never: gradients, glass/blur, glow, decorative icons, emoji, Tailwind, MUI,
  React, fonts other than Roboto.

## Build and preview

```
npm install                       # once, at the repository root
npm run build                     # every UI (or: npm run build -- hud phone)
npm run clean                     # delete every ui/dist
node scripts/preview.mjs --ui sandbox-hud            # render ui/preview/*.json to .preview/sandbox-hud/
node scripts/preview.mjs --ui sandbox-hud --scenario path.json --out shot.png
npm run luacheck                  # Lua 5.4 syntax check of every resource (needs `pip install lupa`)
```

A scenario is `{ "viewport": [1920,1080], "backdrop": true, "mocks": { "Callback": {...} },
"messages": [ { "type": "X", "data": {...}, "delay": 100 } ] }`. `backdrop` paints a
dark stand-in for the game world; `"$now+90"` style tokens resolve to times;
`{ "raw": {...} }` posts an object verbatim (loading-screen events use
`eventName`). The harness fails a scenario on any page or console error, so a
UI is done only when every scenario prints `ok` and the screenshots have been
looked at.

For live development run `vite` in the ui folder (`npm run dev --prefix ...`
or `../../../../../node_modules/.bin/vite`), and feed messages with
`emitNui('TYPE', data)` from the browser console; `mockNui('Callback', value)`
answers callbacks outside the game.

## Definition of done for a UI

1. Every message in `CONTRACT.md` has a handler and every callback is called
   with the documented body.
2. `vite build` is clean, `ui/dist` is committed, `fxmanifest.lua` lists
   `ui/dist/index.html` and `ui/dist/assets/*`.
3. At least four preview scenarios cover the main screens and states, all `ok`.
4. The screenshots were looked at: nothing clipped, hierarchy clear, copy in
   plain English, empty and error states designed.
5. No React, no `ui.legacy`, no unused assets left behind.
