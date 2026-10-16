# sandbox-characters: Lua and NUI contract

Extracted from `client/nui.lua`, `client/spawn.lua`, `client/component.lua`
and the server callbacks they call (`server/callbacks.lua`). The Lua side is
the source of truth; `src/bridge.js` routes every message below into the rune
state modules in `src/state/*.svelte.js`, and `src/lib/flows.js` makes every
callback.

## Lua to UI (`SendNUIMessage`)

| `type`             | `data` payload                                              | Sent from                                                                 |
| ------------------ | ----------------------------------------------------------- | ------------------------------------------------------------------------- |
| `APP_SHOW`         | none                                                        | `nui.lua` once the loading screen ends; `spawn.lua` `Spawn:Init` (after focus) |
| `APP_HIDE`         | none                                                        | `nui.lua` on `Characters:Client:Spawned`                                   |
| `APP_RESET`        | none                                                        | `component.lua` `CHARACTERS:Logout` (back to the welcome page, then `Spawn:Init`) |
| `LOADING_SHOW`     | `{ message: string }`                                       | `nui.lua` `GetData` ("Getting character data")                             |
| `LOADING_HIDE`     | none                                                        | `GetData`, `CreateCharacter`, `DeleteCharacter`, `SelectCharacter`, `Spawned` |
| `SET_DATA`         | `{ changelog, motd, serverName, characters: Character[], characterLimit: number }` | `nui.lua` `GetData` after `Characters:GetCharacters` |
| `SET_STATE`        | `{ state: "STATE_CHARACTERS" \| "STATE_SPAWN" }`             | `GetData`, `CreateCharacter` (always back to characters), `SelectCharacter` |
| `CREATE_CHARACTER` | `{ character: CharacterDoc }`                               | `nui.lua` `CreateCharacter` when the server returned a document            |
| `DELETE_CHARACTER` | `{ id: string }`                                            | `nui.lua` `DeleteCharacter` when the server confirmed                      |
| `SET_SPAWNS`       | `{ spawns: Spawn[] }`                                       | `nui.lua` `SelectCharacter` when spawn points were returned                |

10 message types. The UI also shows `LOADING_SHOW`-style waits itself
("Loading server data", "Getting spawn points", "Creating character",
"Deleting character", "Entering Los Santos"); Lua always ends them with
`LOADING_HIDE`. A request that ends with `LOADING_HIDE` but no success
message (`CREATE_CHARACTER`, `DELETE_CHARACTER`, `SET_SPAWNS`) shows an error
notice above the table.

### Shapes

`Character` (list entry built in `Characters:GetCharacters`):

```js
{
  ID: string,            // Mongo _id
  SID: number,           // state id
  First: string, Last: string,
  Phone: string,         // "555-0142"
  DOB: string,           // ISO 8601, e.g. "1991-01-01T12:00:00.000Z"
  Gender: number|string, // 0 = male, 1 = female (Lua does tonumber)
  LastPlayed: number,    // ms epoch, or -1 when never played
  Cash: number|null,     // wallet cash; the table shows "—" when missing
  Jobs: Job[]|{}|null,   // [{ Id, Name, Workplace: false|{ Id, Name }, Grade?: { Id, Name, Level } }]
  GangChain: any,
  Preview: object|false, // ped appearance for the 3D preview, unused by the UI
}
```

`CharacterDoc` (from `CREATE_CHARACTER`) is the inserted document: the same
fields plus `User`, `Bio`, `Origin`, `New`, `Licenses`, … with
`LastPlayed = -1`, `Jobs = {}` and `Cash = 1000`.

`Spawn`:

```js
{
  id: number|string,     // not unique (Config.DefaultSpawns share id 1), so the UI selects by index
  ID?: number,           // added by Middleware:TriggerEventWithData
  label: string,
  location: { x, y, z, h },
  icon?: string,         // Font Awesome name; not rendered (no icon in front of every row)
  event?: string,        // server callback run after spawning, e.g. "Characters:GlobalSpawn"
}
```

The Type column is derived from `id` / `event`: `LastLocation` = Last
location, `Jail:SpawnJailed` = Prison, `Hospital:SpawnICU` = Hospital,
`Apartment:SpawnInside` = Apartment, `Properties:SpawnInside` = Property,
`JobSpawn:*` = Work, a "Character Creation" label = New character, anything
else = Public.

`serverName` is the `sv_projectName` convar (default "SandboxRP"); FiveM
colour codes (`^1`) are stripped and the UI falls back to "SandboxRP".
`motd` is the `motd` convar and may carry inline HTML, rendered through the
kit sanitiser (RichText). `changelog` is the newest document of the
`changelogs` collection; its shape is not defined in this repository, so the
UI tries the usual names (`title`/`name`/`version`, `date`,
`changes`/`content`/`body`/`notes` as a string or list) and renders nothing
when none match.

## UI to Lua (`RegisterNUICallback`)

| Callback          | Body the Lua side reads                                                                 | What Lua does |
| ----------------- | --------------------------------------------------------------------------------------- | ------------- |
| `GetData`         | `{}` (ignored)                                                                          | waits for `LocalPlayer.state.ID`, loads server data and characters, spawns preview peds, then `LOADING_SHOW` → `SET_DATA` → `LOADING_HIDE` → `SET_STATE STATE_CHARACTERS` |
| `CreateCharacter` | `{ first: string, last: string, gender: 0\|1, dob: ISOString, origin: { label, value }\|null, bio: string }`, forwarded verbatim to `Characters:CreateCharacter` (`data.first`, `data.last`, `tonumber(data.gender)`, `data.dob`, `data.origin`, `data.bio`) | `CREATE_CHARACTER` (if the limit allowed it) → `SET_STATE STATE_CHARACTERS` → `LOADING_HIDE` |
| `DeleteCharacter` | `{ id: string }` (`data.id`)                                                            | `DELETE_CHARACTER { id }` on success → `LOADING_HIDE` |
| `SelectCharacter` | `{ id: string }` (`data.id`)                                                            | `SET_SPAWNS` + `SET_STATE STATE_SPAWN` when spawns exist → `LOADING_HIDE` |
| `PlayCharacter`   | `{ character: Character, spawn: Spawn }` (`data.character.ID`, `data.spawn` incl. `.event` and `.location`) | fades out, loads the character, spawns; on `Characters:Client:Spawned` drops focus and sends `APP_HIDE` + `LOADING_HIDE` |

5 callbacks. `dob` is sent as `new Date(Date.UTC(y, m, d, 12)).toISOString()`
so the stored string matches the pattern other resources parse
(`(%d+)-(%d+)-(%d+)T(%d+):(%d+):(%d+)` in `sandbox-evidence`). `origin` keeps
the `{ label, value }` object the previous UI stored (`value` is the
lower-case ISO 3166-1 alpha-2 code). The form validates before sending:
names 2 to 24 letters (apostrophes and hyphens allowed, spaces stripped as
you type), a real calendar date giving an age of 18 to 100, a gender, and a
biography of up to 500 characters. The server re-checks the slot limit.

## Screens

* Welcome (the UI's own default state, and after `APP_RESET`): identity
  block and a Continue button that calls `GetData` once.
* `STATE_CHARACTERS`: characters table (name, state ID, job, last played,
  cash), the selected character's record with Delete and Play, message of
  the day and changelog in the right column. New character opens the create
  form in a modal; with no characters the form opens by itself. Delete asks
  for confirmation in a modal.
* `STATE_SPAWN`: spawn points table, the chosen place with "Spawn here", and
  the character's record in the right column. "Back to characters" returns
  to the table without telling Lua (Lua only cares about the next
  `SelectCharacter`).
* Any `LOADING_SHOW`: a spinner and the message over the page.

The page is laid out at 1920x1080 and zoomed to the window
(`min(w / 1920, h / 1080)`), so 1440p and 4K keep the same proportions.

## Focus and keys

* `spawn.lua` `Spawn:Init` → `SetNuiFocus(true, true)` right before `APP_SHOW`
  (first join and after every logout).
* `spawn.lua` `SpawnToWorld` and `nui.lua` `Characters:Client:Spawned` →
  `SetNuiFocus(false)`. The UI never touches focus.
* There is no close callback: this screen cannot be dismissed. Keys work
  without being advertised (no key hints on screen): Enter or Space continues
  on the welcome page; Arrow up/down move the selection and Enter plays or
  spawns; Escape closes a modal, or leaves the spawn picker.

## Dropped (never triggered by Lua, or removed on purpose)

* `SelectSpawn` NUI callback: the old UI sent it on every spawn click; no
  `RegisterNUICallback("SelectSpawn")` exists in `client/`.
* `STATE_CREATE` / `STATE_SPLASH` as Lua states: Lua only ever sends
  `STATE_CHARACTERS` and `STATE_SPAWN`; creation is a modal and the welcome
  page is the UI's own default state.
* `SET_CHARACTERS`, `UPDATE_PLAYED`, `SELECT_CHARACTER`, `DESELECT_CHARACTER`,
  `SELECT_SPAWN`, `DESELECT_SPAWN` were UI-internal action types; the UI keeps
  the selection locally.
* `lastPlayed: -1` in the create body: the server ignores it and sets
  `LastPlayed = -1` itself.
* Keyboard shortcuts N (new) and Delete, and Escape to clear the selection,
  from the first Svelte pass: they were only discoverable through the key
  hint footer, which the design rules remove.

## Lua changes made for this UI

* `server/callbacks.lua` `Characters:GetServerData` also returns
  `serverName = GetConvar("sv_projectName", "SandboxRP")`.
* `server/callbacks.lua` `Characters:GetCharacters` includes `Cash = v.Cash`
  in each list entry (read-only display value).
* `client/nui.lua` passes `serverName` through in `SET_DATA` and sends the
  loading message in sentence case.
