# sandbox-games NUI contract

Extracted from `client/minigame.lua`. It is the only client file that talks to
the NUI: `client/drill.lua` draws the Fleeca drill with a scaleform and never
touches the UI, and `client/scaleform.lua` is a scaleform helper.

The Lua side exposes the `Minigame` component. Every `Minigame.Play:<Game>()`
call builds a `params` table and hands it to `_playGame`, which sends it to
the UI unchanged as `SHOW_GAME`. The UI therefore sees exactly the fields
listed below, named as Lua names them (many of them are reused with a
different meaning per game: `timer`, `total`, `difficulty`, ...).

## Lua -> UI (`SendNUIMessage`)

| `type`      | `data`              | Sent by |
| ----------- | ------------------- | ------- |
| `SHOW_GAME` | `{ game = params }` | `_playGame` for every `Minigame.Play:*` call |
| `FAIL_GAME` | none                | `Minigame:Cancel` (player died while playing, or `action.vehicle` and the player left the vehicle). Lua has already called `Minigame:End()` and dropped focus when this arrives; it fires the `onFail` event itself. |

### Fields shared by every `game`

| Field        | Meaning |
| ------------ | ------- |
| `type`       | one of the game types below |
| `events`     | `{ onSuccess, onFail, onPerfect }`: event names (strings) or Lua functions. The UI only tests whether `onPerfect` exists to decide if a "perfect" result (`state = 2`) may be reported. |
| `data`       | opaque table from the caller; Lua merges it with the `Minigame:Finish` body and hands it to the event. The UI never reads it (except the Keypad, which also receives the code as `data.code`). |
| `needsMouse` | `false` for skillbar / round / scanner (focus with `SetNuiFocusKeepInput(true)`), `true` for everything else (cursor shown). |

### Per game (`Minigame.Play:<Name>(...)` -> `params`)

| `type`      | Lua call | Fields |
| ----------- | -------- | ------ |
| `skillbar`  | `Skillbar(timer, difficulty, events, action, data)` | `timer` ms the bar takes to fill; `difficulty` width of the target window in % (window starts at a random 35..35+difficulty %). Key is always `E`. |
| `round`     | `RoundSkillbar(rate, difficulty, events, action, data)` | `rate` degrees the needle advances per 10 ms tick; `difficulty` (clamped to >= 2) arc length of the window in tenths of a radian; `randomKey = true` -> key is a random one of `1` `2` `3`. Pressing any other key of `E Q R 1 2 3 4` fails. |
| `scanner`   | `Scanner(countdown, timer, limit, total, difficulty, randomKey, events, action, data)` | `countdown` s; `timer` ms between bar steps; `limit` ms before timeout; `total` bars; `difficulty` bars on each side of the centre bar that still count; `randomKey` -> key from `E Q R 1 2 3 4`, else `E`. |
| `sequencer` | `Sequencer(countdown, flash, timer, difficulty, isMasked, events, action, data)` | `countdown` s; `timer` = flash ms per key of the preview; `limit` = total ms allowed for the input phase; `difficulty` sequence length (keys 1..12, no two equal in a row); `mask` hides the entered digits. Perfect when correct within 25 % of `limit`. |
| `keypad`    | `Keypad(code, countdown, timer, isMasked, events, action, data)` | `total` = the code (string); `countdown` s or `false` (no countdown); `limit` ms or `false`; `mask`; `data.code` = code. `difficulty` is sent as `nil` (Lua reads an undefined global); the UI caps the input at the code length. |
| `scrambler` | `Scrambler(countdown, change, timer, strikes, numbers, events, action, data)` | `countdown` s; `timer` = ms before the key layout reshuffles; `limit` ms; `total` = strikes allowed before the next wrong press fails; `difficulty` = how many numbers (grid of 4 columns). `mask` is always `nil` (undefined global). Perfect with zero strikes. |
| `memory`    | `Memory(countdown, preview, timer, columns, rows, numActive, strikes, events, action, data)` | `countdown` s; `timer` = preview ms; `limit` ms; `cols`, `rows`; `errors` = strikes that end the game; `difficulty` = active cells; `total` = cols*rows. Perfect with zero wrong cells. |
| `aim`       | `Aim(countdown, limit, timer, startSize, maxSize, growthRate, accuracy, isMoving, events, action, data)` | `countdown` s; `limit` ms of play; `timer` ms between targets (first one after `timer/4`); `startSize` px; `maxSize` px a target grows before it counts as missed; `difficulty` = ms per px of growth (target lifetime = `maxSize * difficulty` ms); `accuracy` % required; `isMoving`. Perfect at 100 % accuracy. |
| `captcha`   | `Captcha(countdown, timer, limit, difficulty, difficulty2, events, action, data)` | `countdown` s; `timer` ms the tile numbers are shown; `limit` ms for the answer; `difficulty` tiles; `difficulty2` questions (clamped <= 8). |
| `keymaster` | `Keymaster(countdown, timer, limit, difficulty, chances, isShuffled, events, action, data)` | `countdown` s; `timer` = `{ min, max }` ms a key takes to fall; `limit` ms to survive (success at timeout); `difficulty` alleys (<= 4); `chances` misses allowed (one more fails); `shuffled` alley order; `randomKey = true` -> key set is one of `QWER` `ASDF` `ZXCV`. A press counts when the key is between 76 % and 88 % of its fall. |
| `pattern`   | `Pattern(countdown, limit, size, difficulty, difficulty2, charset, events, action, data)` | `countdown` s; `limit` ms; `size` rows of 10 cells (<= 10); `difficulty` cells in the answer; `difficulty2` characters per cell; `total` = charset name (`numeric`, `alphabet`, `alphanumer`, `greek`, `symbols`, `currency`, `braille`) or `false` for a random one. The grid scrolls one cell every 1.5 s. Keys: `W A S D` move, `Space` / `Enter` confirm. |
| `icons`     | `Icons(countdown, timer, limit, delay, difficulty, difficulty2, events, action, data)` | `countdown` s; `timer` = number of 1 s shuffles; `limit` ms for the answers; `delay` ms the final grid stays before the input; `difficulty` icons (4 per row); `difficulty2` colours to name. |
| `tracking`  | `Tracking(countdown, delay, limit, difficulty, events, action, data)` | `countdown` s; `delay` ms the numbers stay visible; `limit` ms; `difficulty` targets to click in order. |

`Minigame.Play:Drill` is not a NUI game (scaleform). `Sliders` (`type = "drill"`)
is commented out in Lua and is not implemented.

Every game with a `countdown` shows it as `n, n-1, ..., 1, Go` (one second each),
so `countdown = 3` delays the start by 4 s, as in the previous UI. The hacking
themed games (aim, captcha, keymaster, icons, tracking) first play three 4 s
"bypass" stages, pattern plays one; this pacing is kept because the callers
tune their timers around it.

## UI -> Lua (`RegisterNUICallback`)

| Callback          | Body | Lua |
| ----------------- | ---- | --- |
| `Minigame:Finish` | `{ state }` with `state` = `0` fail, `1` success, `2` perfect. Keypad also sends `entered` (the digits as a string). | Fires `events.onFail` / `onSuccess` / `onPerfect` with `merge(params.data, body)`, so every body field leaks into the event payload: keep the body minimal. `state = 2` is only sent when `events.onPerfect` exists (Lua would otherwise call `nil`). |
| `Minigame:End`    | none | `Minigame:End()` (stops the control-disable / animation threads, clears `doingAction`) then `SetNuiFocus(false, false)` and `SetNuiFocusKeepInput(false)`. |

The UI sends `Minigame:Finish` exactly once per game, as soon as the outcome
is known, shows the result for 2 s, fades out (250 ms) and then sends
`Minigame:End`. If a new `SHOW_GAME` arrives while the result is still on
screen (chained games such as the lockpick stages), the pending `Minigame:End`
is dropped, because Lua has already started the next game.

`Escape` aborts the current game: the UI sends `Minigame:Finish { state = 0 }`
and follows the normal fail path, so focus is always released.

## Focus

Owned by Lua. While `isPlayingGame` is true `_playGame` runs a thread that
calls `SetNuiFocus(true, params.needsMouse)` and
`SetNuiFocusKeepInput(not params.needsMouse)` every frame. Focus is dropped in
the `Minigame:End` callback and in `Minigame:Cancel`. The UI never assumes it
has focus and never hides itself without calling `Minigame:End`.

## UI state (not part of the contract)

`src/state/game.svelte.js` holds the one game on screen: `session` (incremented
on every `SHOW_GAME`, the game component remounts), `result` (`null` while
playing, then `success` / `perfect` / `fail`) and `reason` (why a game failed,
shown under the result only: "Time ran out", "Game stopped", "Wrong code"...).
`reason` is never sent to Lua; the `Minigame:Finish` body stays `{ state }`
(plus `entered` for the keypad). `FAIL_GAME` from Lua marks the game failed
with the reason "Game stopped" and does not send `Minigame:Finish` (Lua has
already fired `onFail`); the panel still holds 2 s, fades and sends
`Minigame:End`, as the previous UI did.

## Inputs per game (unchanged from the previous UI)

| Game | Input |
| ---- | ----- |
| `skillbar` | `E` (shown inside the target zone) |
| `round` | the key in the centre of the ring (`1` `2` `3`, or `E`); any other of `E Q R 1 2 3 4` fails |
| `scanner` | the key shown on the target bar |
| `sequencer`, `scrambler`, `memory`, `aim`, `tracking` | mouse |
| `keypad` | mouse, or `0`-`9`, `Backspace`, `Enter` |
| `captcha`, `icons` | text field, `Enter` or the button checks the answer |
| `keymaster` | the letter on each alley (`Q W E R`, `A S D F` or `Z X C V`) |
| `pattern` | `W A S D` or the arrow keys move the cursor, `Space` / `Enter` confirm |
| every game | `Escape` gives up (`Minigame:Finish { state = 0 }`) |

No key hints are drawn: a key the player must press is shown as the target
itself (the letter in the zone, on the bar, in the ring, on the falling cap).
Keymaster's `timer` is read as a JSON array or as an object with numeric keys.

## Dropped from the old UI (never triggered by Lua)

* `APP_SHOW`, `APP_HIDE`, `SHOW_SCOPE`, `HIDE_SCOPE`, `ARMED`, `SET_BLINDFOLD`
  (old `containers/App/reducer.js`): no `SendNUIMessage` in this resource uses
  them.
* The `drill` / sliders NUI game: the Lua `Sliders` entry is commented out and
  `Drill` is a scaleform.
* Pricedown / LCD / Oswald (Google Fonts) fonts, `@mojs/core`, `use-sound`,
  `@mui/styles`, Font Awesome Pro, and then React, Redux and MUI themselves
  (the UI is now Svelte 5 on `@sandbox/ui-kit`).
* Key-hint footers ("Enter Submit", "W A S D Move cursor"), the dot-grid
  playfield backgrounds, glows and gradients.

## Lua quirks noticed while extracting (not changed here)

* `Keypad` sends `difficulty = difficulty` and `Scrambler` sends
  `mask = isMasked`, both undefined globals, so the fields are always `nil`.
* `Minigame:Cancel` indexes `_playing.events` without a nil check; if it runs
  after `_gameCleanup` cleared `_playing` it errors.
* The old UI reported `state = 2` for Aim / Tracking at 100 % accuracy even
  when no `onPerfect` handler was given (e.g. `DoTracking` in
  sandbox-robbery), which makes Lua call a nil function. The new UI only
  reports `2` when `events.onPerfect` is present.
