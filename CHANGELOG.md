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
- Radar settings are validated before they are saved; the cross street bug and
  flagged-plate flag were fixed. Taxi and chat dependency names fixed; chat
  releases NUI focus on logout.

### Added
- `/ui-kit`: a Svelte 5 design system on the GOLD (Australian Government
  Design System) tokens in Roboto, with the NUI runtime, Font Awesome Free
  registry (Pro names aliased) and formatters.
- `sandbox-hud` rebuilt in Svelte on the minimal-hud layout (status bars under
  the minimap, 240° RPM speedometer with gears, compass pills) with gov-style
  menus, dialogs, prompts and notifications; `client/hud.lua` lifts the minimap
  and reports gear and headlight state.
- `scripts/build-all.mjs`, `scripts/preview.mjs` (headless Chromium renders of
  scenario files), `scripts/luacheck.py`, `DESIGN.md`, `docs/NUI-GUIDE.md`.
