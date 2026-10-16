# Design brief: SandboxRP interfaces

Subject and audience: in-game screens for a FiveM roleplay server (HUD, phone, police MDT, laptop, inventory, admin tools, character select, loading screen, menus, devices). Players use them mid-game at 1080p to 4K with mouse and keyboard, with the game world behind every screen.

Primary action: get the player to the one thing the screen is for, with as little chrome as possible.

Direction: a dark government service console. One theme, never light: page #181a1d (rgb 24, 26, 29), quiet greys for raised surfaces, a single blue for actions, the purple focus ring. Identity blocks read like the knowledge-centre reference: a short bold acronym in the action colour above a plain heading, a row of section names as text links, a small outline icon beside a muted meta line.

Type: Roboto 400/500/700. Roboto Mono only for live numbers, plates, IDs and timers. Sizes 12 / 14 / 16 / 20 / 24 / 32 / 40 / 48 px; body line-height 1.5, headings 1.25. Headings 500-700, never uppercase except the eyebrow label.

Colour:
- Surfaces: sunk #121416 (inputs), page #181a1d, raised #1e2124, hover #25282c, selected #2d3136.
- Lines: #33373c, strong #474c53.
- Text: #e9ebee, muted #a1a7ae, hint #7f868e.
- Action #6cb6ff (hover #93c9ff, text on it #0d1117), soft action background #172f47. Focus ring #c390f9.
- States, each a foreground and a tinted background: success #3ecf8e / #173a2b, warning #f2b84b / #3d3115, error #ff7b72 / #431c1c, info #6cb6ff / #172f47.
- HUD readouts keep the minimal-hud palette (green #06ce6b, blue #2b78fc, orange #fb8607, red #fe2436, white #f2f2f2).

Icons: Tabler outline icons (stroke 1.75, 2 to 2.2 on the HUD), drawn by name with `<Icon icon="name" />`. Lua's Font Awesome names map automatically. Icons are for controls and status, never decoration in front of every row.

Shape: 4px radius on controls, 8px on panels and toasts. 1px lines. Shadows only on things that float (menus, dialogs, toasts). Dense, on a 4px grid.

Hard rules:
- No coloured edge bars (left or top rules) to mark a type or a selection. A notification or alert shows its type with a tinted background; a selected row uses the hover/selected surface.
- No panel behind text that sits on the world or a photo (progress bars, loading status, prompts, death text). Use the text shadow (`.au-overworld`).
- No key hints or "guide" footers (↑↓ choose, Esc close...). Keys appear only when Lua sends them as part of a prompt.
- No gradients, glass, blur, glow, emoji, light pages, uppercase headings.
- Physical devices look like the device: the radio is drawn inside its handset image, the radar is a dash unit, the taxi meter is a meter, the phone and laptop are device frames. Apps inside them use the console style.

Layout: full-screen apps use AppShell (identity header, text nav with a 2px blue underline on the active item, side nav, content column, quiet footer). Records are tables, details are definition lists, forms put labels above fields.

HUD: follows ThatMadCap/minimal-hud for the in-world readouts (status bars under the minimap, RPM arc speedometer with gears, compass pills). Its menus, dialogs and toasts use the console style.

Motion: 120ms control feedback, 200ms panel open and close. Nothing decorative. prefers-reduced-motion respected.
