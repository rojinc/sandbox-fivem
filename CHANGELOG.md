# Changelog

## Unreleased: cleanup and interface rebuild

### Removed
- The obfuscated "event scrambler" runtime that was injected into 68 resources
  (identical 212 KB blobs) and the obfuscated `sandbox-voip/Z.lua`. Nothing
  referenced their globals; every manifest entry pointing at them is gone.
- A committed TLS private key and certificate in `sandbox-ws`; the resource now
  generates its own signing key at start and reads TLS/CORS/port settings from
  convars.
- The 86 MB legacy loading screen under `[standalone]/loadscreen`, unused
  `[cfx-default]` resources and dead `ensure` lines in `resources.cfg`.
- Every React/MUI interface, FontAwesome Pro dependency and `ui.legacy` folder.

### Changed
- Lua modernised: `Citizen.*` wrappers, `GetPlayerPed(-1)`, `RegisterServerEvent`
  and distance natives replaced by their current equivalents; four syntax
  errors fixed; every file passes a Lua 5.4 parse (`npm run luacheck`).
- Server handlers validate client input: weapon ammo and item ownership,
  inventory settings, crafting quantities, vehicle repairs by distance, race
  finishes, bicycle purchases (price and model resolved server-side), roulette
  totals. The never-triggered key-theft handler was removed.
- Phone adverts are rebuilt on the server: author, number, id and time come
  from the character and server clock, not the client. `/resetphonepos` docks
  the phone again, and Dynasty 8 is restricted to the real estate job again.
- Radar settings are validated before they are saved; the cross street bug and
  flagged-plate flag were fixed. Taxi and chat dependency names fixed; chat
  releases NUI focus on logout.

### Added
- `/ui-kit`: a Svelte 5 design system with one dark theme (#181a1d) in
  Roboto, Tabler outline icons (Font Awesome names from Lua are mapped
  automatically, `npm run icons`), the NUI runtime and formatters.
- `sandbox-hud` rebuilt in Svelte on the minimal-hud layout (status bars under
  the minimap, 240° RPM speedometer with gears, compass pills) with dark
  menus and dialogs, colour-filled notifications and panel-free prompts; `client/hud.lua` lifts the minimap
  and reports gear and headlight state.
- Every other interface rebuilt in Svelte on the kit, each with a
  `ui/CONTRACT.md` and preview scenarios: loading screen, character select
  (docked panel so the peds stay in view), chat, taxi meter, police radar,
  radio (drawn inside the handset), bank and ATM, minigames, clothing and
  barber stores, staff admin console, police MDT and alerts, the generic
  list menu, the inventory with shops and the crafting bench, and the phone
  (drawn inside the player's case, 21 apps; Dyn8, Properties, Redline,
  Blueline and Music say they are not available yet).
- The laptop rebuilt in Svelte: desktop, windows and taskbar inside the
  laptop lid, LS UNDG (boosting, market, chop lists, reputation), Teams,
  every BizWiz page and Settings. Deleting a BizWiz document or receipt
  works again (the id never reached the server). Wallpapers are re-encoded
  as WebP; the largest went from 8.5 MB to 220 KB.
- Key hints and keyboard guides are gone from every screen, and from the
  Lua notices that only listed keys: customs camera, scene placement, selfie
  and evidence cameras, fishing, bike carry and emote effects. Interaction
  prompts ("E Open bank") and the respawn line still show their key.
- Escape closes interfaces on key-up, so the release no longer opens the
  pause menu after focus returns to the game.
- `scripts/build-all.mjs`, `scripts/preview.mjs` (headless Chromium renders of
  scenario files; `$now` tokens work in messages and mocks), `scripts/luacheck.py`, `DESIGN.md`, `docs/NUI-GUIDE.md`.
