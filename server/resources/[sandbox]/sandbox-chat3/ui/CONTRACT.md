# sandbox-chat3: Lua <-> NUI contract

Extracted from `client/cl_chat.lua` and `client/component.lua` (the client is
the source of truth) with the message shapes that `server/sv_chat.lua`,
`server/component.lua` and `server/utils.lua` actually put on the wire.

Every message below is routed in `src/bridge.js` (`onNui(type, fn)`) into the
rune state modules `src/state/screen.svelte.js` and `src/state/chat.svelte.js`.
Callbacks are sent with `fetchNui(name, body)`.

## Lua -> UI (`SendNUIMessage`)

| `type` | `data` fields | Sent from |
| --- | --- | --- |
| `ON_OPEN` | *(none)* | `Characters:Client:Spawn` loop when control 245 (`T`) is pressed. Focus is **not** set yet; Lua calls `SetNuiFocus(true)` once the key is released. The UI shows the log and the input strip and clears the draft. |
| `ON_SCREEN_STATE_CHANGE` | `shouldHide: bool`, `inputting: bool` | `Characters:Client:Logout` and `UI:Client:Reset` (both send `{ shouldHide = true, inputting = false }`). `inputting = false` also clears the draft. |
| `ON_CLEAR` | *(none)* | `chat:clearChat` (also fired by `Characters:Client:Logout` in component.lua) and `UI:Client:Reset`. Empties the log; the Up/Down history is kept. |
| `ON_MESSAGE` | `message: object` (see *Message shapes*) | `chat:addMessage`, deprecated `chatMessage`, `__cfx_internal:serverPrint`. The log keeps the last 150 lines. |
| `ON_SUGGESTION_ADD` | `suggestion: { name: string, help: string, params?: [{ name, help }] }` | `chat:addSuggestion(name, help, params)` and `chat:addSuggestions(list)` (one message per entry). The client component also re-sends every registered command with `help = ""` on every resource start/stop; a bare entry never overwrites one that already has help or params. |
| `ON_SUGGESTION_REMOVE` | `name: string` | `chat:removeSuggestion(name)` and `chat:removeSuggestions(list)` (one message per entry). |
| `ON_COMMANDS_RESET` | *(none)* | `chat:resetSuggestions`: the server sends it before re-sending the allowed command list. |
| `ON_TEMPLATE_ADD` | `template: { id: string, html: string }` | `chat:addTemplate(id, html)`: standard cfx chat template with `{0}`, `{1}` ... placeholders. May override `default`, `defaultAlt` and `print`. |

8 message types.

### Message shapes carried by `ON_MESSAGE.message`

**Sandbox format** (`server/component.lua`, `CHAT.Send.*`):

```lua
{ time = os.time(), type = <kind>, message = <string>, author = {...}? }
```

| `type` | `author` | Rendered as |
| --- | --- | --- |
| `ooc` | `{ First, Last, SID }` | plain text, `OOC` tag |
| `server` | - | HTML allowed, `Server` tag (error outline) |
| `system` | - | HTML allowed, `System` tag (action outline) |
| `broadcast` | - | HTML allowed, `Broadcast` tag (warning, solid). Sent by `Send.Broadcast.All` and `Send.System.Broadcast`. |
| `911` | `{ First, Last, Phone, SID }`, or `{ Anonymous = true }`, or `{ ..., Reply = <SID> }` | plain text, `911` tag (error, solid) |
| `311` | same as `911` | plain text, `311` tag (info outline) |
| `411` | - | plain text, `411` tag (success, solid), police/prison only |
| `411A` | - | plain text, `411-A` tag (success outline), prison only |
| `dispatch` | - | HTML allowed, `Dispatch` tag (warning outline) |
| `tests` | - | HTML allowed, `Test results` tag (info outline) |

Unknown kinds get a neutral tag made from `type`. The author line shows the
name in bold, then `#SID`, the phone and `to #Reply` in muted mono. The
timestamp column (HH:MM, mono, muted) is the moment the line reached this
client; `time` is carried but not displayed.

**Standard cfx format** (deprecated `chatMessage(author, color, text)` and
`__cfx_internal:serverPrint(msg)`):

```lua
{ color = { r, g, b }?, args = { [author]?, text } }
-- plus the usual optional cfx fields a script may add through chat:addMessage:
-- templateId = "default" | "defaultAlt" | "print" | <id from ON_TEMPLATE_ADD>
-- template   = "<b>{0}</b> {1}"   (inline template)
-- multiline  = true               (keeps line breaks)
```

`args` are escaped before they are dropped into the template, so a player
cannot inject markup; `color` becomes a 3px rule on the left of the line.
`args` entries may carry `^0`-`^9` colour codes and `^*`, `^_`, `^~`, `^=`,
`^r` style codes (`src/lib/colorize.js`). Built-in templates: `default` =
`<b>{0}</b>: {1}`, `defaultAlt` = `{0}`, `print` = `<pre>{0}</pre>`; one
argument selects `defaultAlt` when no `templateId` is given.

### Sanitising

Every body goes through the kit's `sanitizeHtml` with the chat profile in
`src/lib/html.js`: the inline defaults plus `div`, `pre`, `img` and the
`style`, `class`, `src` attributes. Plain-text kinds are escaped first so a
`<b>` typed by a player stays text. DOMPurify drops `src` values that are not
http(s)/data URLs, so `nui://` images from resource themes do not render
(themes were never wired to the UI, see below).

## UI -> Lua (`RegisterNUICallback`)

| Callback | Body read by Lua | Effect |
| --- | --- | --- |
| `chatResult` | `cancelled: bool`, `message: string` (only read when not cancelled) | Clears `chatInputActive`, `SetNuiFocus(false)`. If not cancelled: `/cmd ...` -> `ExecuteCommand`, otherwise `_chat:messageEntered` server event. Replies `"ok"`. |
| `loaded` | *(none)* | `chat:init` server event (server re-sends the command list), refreshes client command suggestions. Replies `"ok"`. Sent once when App mounts. |

2 callbacks.

## Focus and keys

* Lua owns focus. `SetNuiFocus(false)` on character spawn; the UI never calls it.
* `ON_OPEN` is sent while `T` is held; `SetNuiFocus(true)` follows when the key
  is released. The UI focuses its input when the strip mounts and re-focuses it
  on blur while inputting.
* Every exit path calls `chatResult`, where Lua drops focus:
  * Enter with text -> `{ message }` (the line is pushed onto the Up/Down history);
  * Enter with an empty draft, Escape -> `{ cancelled = true }`;
  * the strip being unmounted by `ON_SCREEN_STATE_CHANGE { inputting = false }`
    (logout, UI reset) -> `{ cancelled = true }`, so `chatInputActive` is cleared
    in Lua and `T` works again afterwards. Lua handles the repeat harmlessly.
* Tab completes the first matching command, Up/Down walk the history (the live
  draft is restored at the bottom), PageUp/PageDown scroll the log. The Escape
  handler is registered only while the strip exists, so other surfaces keep
  their keys.
* Pointer events are on only while inputting; otherwise the chat is click-through.
* The log fades 2.5 s after the input closes; a line arriving while the chat is
  closed shows the log for 6 s.

## UI-internal message (not sent by Lua)

* `input/set` `{ value }`: sets the draft. The preview runner cannot type, so
  `preview/command-*.json` and `preview/chat-1440p.json` use it to show the
  suggestion list. Nothing in Lua sends it.

## Dead UI that was not ported (and why)

* `Chat.Refresh:Themes()` in `client/cl_chat.lua` builds a `themes` table from
  `chat_theme` resource metadata but never sends it to the UI: no NUI message
  exists for themes.
* The old React UI's `useSound.js` imported `../assets/sounds/*.mp3` that did
  not exist in the repo and was never mounted.
* The old `ON_SUGGESTION_REMOVE` reducer case was a no-op; the state module
  removes the entry.
* The old UI ignored `ON_TEMPLATE_ADD` and `ON_MESSAGE` payloads without
  `message.message` (every `chatMessage` / `serverPrint` line); both render.
