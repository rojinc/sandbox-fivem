# sandbox-characters — Lua ↔ NUI contract

Extracted from `client/nui.lua`, `client/spawn.lua`, `client/component.lua`
and the server callbacks they call (`server/callbacks.lua`). The Lua side is
the source of truth; the reducers in `src/features/*` mirror this file.

## Lua → UI (`SendNUIMessage`)

| `type`             | `data` payload                                              | Sent from                                                                 |
| ------------------ | ----------------------------------------------------------- | ------------------------------------------------------------------------- |
| `APP_SHOW`         | —                                                           | `nui.lua` once the loading screen ends; `spawn.lua` `Spawn:Init` (after focus) |
| `APP_HIDE`         | —                                                           | `nui.lua` on `Characters:Client:Spawned`                                   |
| `APP_RESET`        | —                                                           | `component.lua` `CHARACTERS:Logout` (back to the splash, then `Spawn:Init`) |
| `LOADING_SHOW`     | `{ message: string }`                                       | `nui.lua` `GetData` ("Getting Character Data")                             |
| `LOADING_HIDE`     | —                                                           | `GetData`, `CreateCharacter`, `DeleteCharacter`, `SelectCharacter`, `Spawned` |
| `SET_DATA`         | `{ changelog, motd, characters: Character[], characterLimit: number }` | `nui.lua` `GetData` after `Characters:GetCharacters`               |
| `SET_STATE`        | `{ state: "STATE_CHARACTERS" \| "STATE_SPAWN" }`             | `GetData`, `CreateCharacter` (always back to characters), `SelectCharacter` |
| `CREATE_CHARACTER` | `{ character: CharacterDoc }`                               | `nui.lua` `CreateCharacter` when the server returned a document            |
| `DELETE_CHARACTER` | `{ id: string }`                                            | `nui.lua` `DeleteCharacter` when the server confirmed                      |
| `SET_SPAWNS`       | `{ spawns: Spawn[] }`                                       | `nui.lua` `SelectCharacter` when spawn points were returned                |

10 message types. The UI also dispatches `LOADING_SHOW` locally (same shape)
for its own waits ("Loading Server Data", "Getting Spawn Points",
"Creating Character", "Deleting Character", "Spawning") exactly as the
previous UI did; Lua always ends them with `LOADING_HIDE`.

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
  Jobs: Job[]|null,      // [{ Id, Name, Workplace: false|{ Id, Name }, Grade?: { Id, Name, Level } }]
  GangChain: any,
  Preview: object|false, // ped appearance for the 3D preview, unused by the UI
}
```

`CharacterDoc` (from `CREATE_CHARACTER`) is the inserted document: the same
fields plus `User`, `Bio`, `Origin`, `Cash`, `New`, `Licenses`, … and
`LastPlayed = -1`, `Jobs = {}`.

`Spawn`:

```js
{
  id: number|string,     // not unique (Config.DefaultSpawns share id 1) – select by index
  label: string,
  location: { x, y, z, h },
  icon?: string,         // Font Awesome name, e.g. "location-smile", "hospital", "link"
  event?: string,        // server callback run after spawning, e.g. "Characters:GlobalSpawn"
}
```

`changelog` is the newest document of the `changelogs` collection (shape not
defined anywhere in this repository); `motd` is the `motd` convar. The UI
keeps `changelog` in the store but does not render it (nothing in the old UI
did either).

## UI → Lua (`RegisterNUICallback`)

| Callback          | Body the Lua side reads                                                                 | What Lua does |
| ----------------- | --------------------------------------------------------------------------------------- | ------------- |
| `GetData`         | — (body ignored)                                                                        | waits for `LocalPlayer.state.ID`, loads server data + characters, spawns preview peds, then `LOADING_SHOW` → `SET_DATA` → `LOADING_HIDE` → `SET_STATE STATE_CHARACTERS` |
| `CreateCharacter` | `{ first: string, last: string, gender: 0\|1, dob: ISOString, origin: { label, value }\|null, bio: string }` — forwarded verbatim to `Characters:CreateCharacter`, which reads `data.first`, `data.last`, `tonumber(data.gender)`, `data.dob`, `data.origin`, `data.bio` | `CREATE_CHARACTER` (if the limit allowed it) → `SET_STATE STATE_CHARACTERS` → `LOADING_HIDE` |
| `DeleteCharacter` | `{ id: string }` (`data.id`)                                                            | `DELETE_CHARACTER { id }` on success → `LOADING_HIDE` |
| `SelectCharacter` | `{ id: string }` (`data.id`)                                                            | `SET_SPAWNS` + `SET_STATE STATE_SPAWN` when spawns exist → `LOADING_HIDE` |
| `PlayCharacter`   | `{ character: Character, spawn: Spawn }` (`data.character.ID`, `data.spawn` incl. `.event` and `.location`) | fades out, loads the character, spawns; on `Characters:Client:Spawned` drops focus and sends `APP_HIDE` + `LOADING_HIDE` |

5 callbacks. `dob` is sent as `new Date(Date.UTC(y, m, d, 12)).toISOString()`
so the stored string matches the pattern other resources parse
(`(%d+)-(%d+)-(%d+)T(%d+):(%d+):(%d+)` in `sandbox-evidence`). `origin` keeps
the `{ label, value }` object the previous UI stored (`value` is the
lower-case ISO 3166-1 alpha-2 code).

## Focus

* `spawn.lua` `Spawn:Init` → `SetNuiFocus(true, true)` right before `APP_SHOW`
  (first join and after every logout).
* `spawn.lua` `SpawnToWorld` and `nui.lua` `Characters:Client:Spawned` →
  `SetNuiFocus(false)`.
* There is no "close" callback: this screen cannot be dismissed, so Escape
  only navigates inside the UI (closes dialogs, leaves the spawn picker,
  clears the selection).

## Dropped from the old UI (never triggered by Lua)

* `SelectSpawn` NUI callback — sent on every spawn click; no
  `RegisterNUICallback("SelectSpawn")` exists in `client/`.
* `STATE_CREATE` / `STATE_SPLASH` as Lua states — Lua only ever sends
  `STATE_CHARACTERS` and `STATE_SPAWN`; creation is a dialog in the UI and the
  splash is the UI's own default state.
* `SET_CHARACTERS`, `UPDATE_PLAYED`, `SELECT_CHARACTER`, `DESELECT_CHARACTER`,
  `SELECT_SPAWN`, `DESELECT_SPAWN` were UI-internal action types; the new UI
  keeps a `selected` index locally instead.
* `lastPlayed: -1` in the create body — the server ignores it and sets
  `LastPlayed = -1` itself.
