# Design brief

Standard: Datum v1 rules on the project palette (dark, page #181a1d, Roboto).

Users and situation: players on a FiveM roleplay server at 1080p to 4K, mouse and keyboard, with the game world behind every screen. Staff and police use the MDT and admin console for long sessions; everyone uses the HUD, phone, inventory and menus mid-game, in a hurry.

Main task on each screen: the one thing that screen is for (send the message, file the report, pick the item, confirm the purchase). It appears first, with one primary action.

Primary action: an ink (light) button with a base bar. Blue is for links only.

Content blocks, in priority order: the task, the records it acts on, related facts in the aside, quiet meta at the bottom.

Structure for each block, and why:
- Records are tables (numbers right-aligned, tabular figures), because players compare and scan them.
- One thing described is definition rows (`.au-dl`), not blurbs.
- Forms put the label above the field, the hint under the label and the error above the input.
- Full-screen apps use AppShell: identity header (short acronym in bold, then the title), a row of bold text links with a 4px rule under the current one, a 4px rule under the header, side nav where there is depth.

Real assets found: the SandboxRP wordmark (characters and loading screen), the Del Perro pier backdrop, the radio handset frame (`sandbox-radio/ui/src/assets/radio_frame.webp`), hunting map images.

Placeholders still needed: an SVG version of the SandboxRP wordmark (only a raster exists).

Tokens (ui-kit/src/tokens.css), mapped onto Datum roles:
- paper #181a1d, paper-2 #1f2226 / #25282c, selected #2d3136
- ink (text, primary buttons, control edges, section rules) #f1f3f5; muted #b4bcc4
- rule (dividers only, never a control's only edge) #3b4047
- action (links only) #8cbcff; focus #ffcd00 gold with ink text
- error #ff8f85, success #4fd18b, warning #ffc266, each with a tinted fill, always beside a word

Exceptions to Datum, with reasons:
- Roboto instead of Atkinson Hyperlegible, and the dark palette: the user asked for both explicitly.
- Tabler outline icons (generated subset, `npm run icons`) instead of the 13 house icons: the user's own reference uses Tabler, and Lua sends icon names at runtime (statuses, buffs, menu actions) that need a matching set. Icons still appear only on controls and status.
- Notifications are toasts with a background tinted by type and no edge bar: the user asked for this explicitly, and the game has no page to place notices on.
- The in-world HUD follows ThatMadCap/minimal-hud (status bars under the minimap, RPM arc speedometer, compass pills with rounded ends): the user asked for that layout explicitly.
- Physical devices (radio handset, radar unit, taxi meter, phone, laptop) are drawn as the device, at the device's size: the user asked for the radio inside its handset image.
- No panel behind text placed on the game world or a photo (progress bars, loading status, prompts, death text): text shadow instead (`.au-overworld`). User instruction.
- No key hints or guide footers anywhere. User instruction.
- Text in the in-world HUD readouts (status values, compass) is smaller than 16px so the HUD stays out of the way; every menu, dialog, prompt and app uses 16px or more.

Hard rules (kit enforces most of them): square corners, no shadows or gradients or blur or glow, no coloured edge bars, no tracked uppercase labels, no dot-separated metadata strings, sentence case, plain English, specific button text, every state designed (empty, loading, error, long content).
