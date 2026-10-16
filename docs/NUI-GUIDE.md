# NUI development guide

Every in-game interface in this server is a small React app ("NUI") that
lives inside its resource at `server/resources/[sandbox]/<resource>/ui`.
All of them are built from one workspace at the repository root and share
one design system, `@sandbox/ui-kit` (see `ui-kit/`).

This document is the contract. Follow it for every new or rebuilt UI.

## 1. Commands

```bash
npm install                         # once, at the repo root (Node 20.19+ / 22+)
npm run build                       # build every UI into <resource>/ui/dist
npm run build -- hud phone          # only packages whose name contains these
npm run dev --workspace sandbox-hud-ui   # Vite dev server in a browser
node scripts/preview.mjs --ui sandbox-hud   # headless render + screenshots
```

Never run `npm install` inside a UI folder; dependencies are hoisted to the
root `node_modules`. If a UI needs a package that is not installed, add it to
that UI's `package.json` **and** run `npm install` at the root.

## 2. Package layout

```
<resource>/ui/
  package.json        name "<resource>-ui", scripts dev/build, deps on @sandbox/ui-kit
  vite.config.js      export default nuiViteConfig({ root: import.meta.dirname, port })
  index.html          <div id="app"> + <script type="module" src="/src/main.jsx">
  preview/*.json      scenarios for scripts/preview.mjs (fake Lua messages)
  src/
    main.jsx          createRoot → Provider → NuiBridge → AppRoot → App
    App.jsx           composes the screens / overlays
    store.js          createNuiStore({ ...reducers })
    features/<x>/     reducer.js (+ selectors) per NUI message family
    components/       presentational components (.jsx)
    assets/           images (webp), sounds, local fonts
  dist/               build output, committed, referenced by fxmanifest.lua
```

`fxmanifest.lua` must reference the build:

```lua
ui_page 'ui/dist/index.html'
files {
    'ui/dist/index.html',
    'ui/dist/assets/*',
}
```

JSX only goes in `.jsx` files. Vite 8 does not parse JSX inside `.js`.

## 3. The Lua ↔ UI contract

The Lua client is the source of truth. Before touching a UI, extract its
contract from `<resource>/client/*.lua`:

* **Lua → UI**: every `SendNUIMessage({ type = "X", data = {...} })`.
  `<NuiBridge>` dispatches each one as a Redux action `{ type: "X", payload: {...data} }`.
  Reducers are therefore the contract: keep the message `type` names and the
  payload field names exactly as Lua sends them.
* **UI → Lua**: every `RegisterNUICallback("Name", ...)`. Call it with
  `fetchNui('Name', body)` from `@sandbox/ui-kit`. Keep callback names and
  the body shape Lua reads (`data.event`, `data.values`, …).
* Focus is owned by Lua (`SetNuiFocus`). A UI never assumes it has focus;
  it closes by calling the resource's close callback, and Lua drops focus.
* Escape must always lead somewhere: `useEscape('CloseCallback')` or an
  explicit `useKey('Escape', …)`.

A `grep` recipe that lists both sides:

```bash
grep -rhoE 'type\s*=\s*"[A-Za-z_]+"' <resource>/client | sort -u
grep -rhoE 'RegisterNUICallback\(\s*"[^"]+"' <resource>/client | sort -u
```

Anything the old UI did that Lua never triggers is dead and is not ported.

## 4. The kit (`@sandbox/ui-kit`)

```js
import {
  AppRoot,                      // ThemeProvider + CssBaseline + fonts + icons + tokens.css
  createNuiStore, NuiBridge,    // Redux Toolkit store + window 'message' forwarder
  fetchNui, useNuiEvent, useKey, useEscape, isEnvBrowser, debugData, mockNui, emulateNui,
  Icon,                         // tolerant FontAwesome wrapper: ['fas','house'] | 'house' | 'fa-solid fa-house'
  Panel, PanelHeader, SectionTitle, Button, IconButton, Kbd, Tag, ProgressBar, Stat,
  EmptyState, IconTile, Divider, RichText, sanitizeHtml,
  colors, radius, space, shadow, motion, fonts, semanticColor, semanticSoft,
  createSandboxTheme,
} from '@sandbox/ui-kit';
import { nuiViteConfig } from '@sandbox/ui-kit/vite';
import { registerBrandIcons } from '@sandbox/ui-kit/icons-brands'; // only if brand logos are needed
```

Styling: MUI `sx` / `styled` from `@mui/material/styles`, plus the CSS
variables from `tokens.css` (`var(--sb-accent)`, `var(--sb-surface)`, …).
Theme values are also available via `useTheme()`.

Icons: Pro icon names and prefixes (`fad`, `fal`, …) are mapped to the free
sets by `Icon`. If a preview logs "Icon not found", add an alias in
`ui-kit/src/icons.jsx` rather than working around it locally.

## 5. Design language

One dark theme, built to be read over a moving game scene.

* **Surfaces**: glass (`Panel`, `.sb-glass`) for anything floating over the
  world; `strong` glass for dialogs and full-screen apps. 1px hairline
  borders (`--sb-border`), radius 10/14/20, shadows from tokens. No flat
  grey boxes, no 4px coloured left borders as the only accent.
* **Type**: Inter for UI, JetBrains Mono (`.sb-mono`) for numbers, plates,
  timers, frequencies. Minimum 12px. Headings 600 weight, never uppercase
  body text (overline/section labels only).
* **Colour**: accent gold `--sb-accent` for primary actions and highlights,
  semantic green/amber/red/blue for status. Text `--sb-text` / `--sb-text-2`
  / `--sb-text-3`. Never pure white on pure black.
* **Spacing**: 4px scale (`space(n)`), 16px panel padding, 8px between
  related controls, 12–16px between groups.
* **Motion**: 120ms micro, 200ms standard, 320ms panels; easing
  `--sb-ease`. Use MUI `Fade`/`Slide`/`Grow` or the `.sb-anim-*` classes.
  Nothing bounces.
* **Over-world text** (HUD, prompts): add `.sb-overworld` text-shadow.
* **Pointer events**: full-screen HUD layers are `pointer-events: none`;
  re-enable only on interactive panels so clicks fall through to nothing
  while Lua has focus.
* **Density**: HUD elements are compact (icon 12–14px, bars 4–6px); apps
  (phone, laptop, MDT) use 14px body text and 36–40px row heights.
* Design for 1920×1080 in px; use the normalised anchors Lua sends (vw/vh)
  only for positioning relative to the minimap.

## 6. Not allowed

* `@mui/styles` (`makeStyles`/`withStyles`), `styled-components`,
  `@material-ui/*`, `react-pie-menu`, `react-moment`, `moment`,
  `react-html-parser`, `html-react-parser`, `@babel/polyfill`, `ifdef-loader`,
  `react-use-keypress`, `react-useinterval`, CKEditor, Font Awesome Pro.
* Loading anything from the internet (Google Fonts, CDNs, external images).
  Bundle it. The game may have no connectivity for NUI.
* `process.env.REACT_RESOURCE_NAME` or a hard-coded resource name in
  `fetch()` URLs: use `fetchNui`, which asks the game for the resource name.
* `dangerouslySetInnerHTML` without `sanitizeHtml`.
* Side effects inside reducers (the old progress reducer called the game
  from a reducer; do it in the component instead).

## 7. Verification (definition of done)

1. `npm run build -- <resource>` succeeds with no warnings about missing exports.
2. `ui/preview/*.json` contains at least one scenario per major screen,
   driven only by real message types from the Lua contract.
3. `node scripts/preview.mjs --ui <resource>` renders every scenario with
   zero `pageerror`/console errors and the screenshots look finished.
4. `fxmanifest.lua` lists `ui/dist/index.html` and `ui/dist/assets/*`.
5. The old `ui/src`, webpack configs, `.babelrc`, `.env*`, `package-lock.json`
   and the old `dist` are deleted; nothing references them.
