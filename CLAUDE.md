# SandboxRP server: working notes

A FiveM roleplay server derived from the Mythic Framework. Lua resources live
under `server/resources/[sandbox]` (the framework) and `server/resources/[cfx-default]`
(the few stock Cfx resources still needed). Every interface is a Svelte 5 NUI
sharing `/ui-kit`; the look is the GOLD design system (Australian Government
Design System) in Roboto, documented in `/DESIGN.md` and `/docs/NUI-GUIDE.md`.

## Layout

- `server/config/*.cfg`: server configs; `resources.cfg` lists what is ensured.
- `server/resources/[sandbox]/sandbox-base`: component registry
  (`exports["sandbox-base"]:RegisterComponent/FetchComponent`), callbacks,
  middleware. Most resources start by fetching their dependencies from it.
- `server/resources/[sandbox]/<name>/{client,server,shared,config}`: Lua.
  `fxmanifest.lua` uses `fx_version 'cerulean'`, `game 'gta5'`, `lua54 'yes'`.
- `server/resources/[sandbox]/<name>/ui`: the NUI (see the guide).
- `ui-kit`: tokens, base CSS, components, NUI runtime, icon registry.
- `scripts/build-all.mjs`, `scripts/preview.mjs`, `scripts/luacheck.py`.

## Commands

```
npm install                       # root, once
npm run build                     # build every ui/dist
node scripts/preview.mjs --ui <resource>   # headless screenshots of ui/preview/*.json
npm run luacheck                  # Lua 5.4 syntax check (pip install lupa)
```

## Rules

- Lua: `CreateThread`/`Wait`/`SetTimeout` (not `Citizen.*`), `RegisterNetEvent`,
  `PlayerPedId()`, vector maths (`#(a - b)`) over distance natives. Server
  handlers validate everything that arrives from a client (ids, amounts,
  distances) and never trust prices or models from the UI.
- NUI: Lua owns focus; the UI never calls `SetNuiFocus`. Messages are
  `{ type, data }`; callbacks answer through `cb`. Sanitise HTML from Lua.
  Every UI keeps a `CONTRACT.md` and preview scenarios; a UI is done when every
  scenario renders `ok` and the screenshots have been looked at.
- Never add obfuscated or minified-only code, private keys, or binaries that
  cannot be rebuilt from source. `ui/dist` is the one generated folder that is
  committed, because FiveM serves it directly.
- `sandbox-ws` reads its settings from convars (`WS_PORT`, `WS_CORS_ORIGIN`,
  `WS_TLS_KEY`, `WS_TLS_CERT`, `WS_PRINT_TOKEN`) and generates its signing key
  at start; no key material belongs in the repository.
