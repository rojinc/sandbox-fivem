# Design brief: SandboxRP interfaces

Subject and audience: in-game screens for a FiveM roleplay server (phone, police MDT, laptop, inventory, admin tools, character select, loading screen, menus, prompts, notifications). Players use them mid-game at 1080p to 4K with mouse and keyboard, usually in a hurry, with the game world behind every screen.

Primary action: get the player to the one thing the screen is for (send the message, file the report, pick the item, confirm the purchase) with as little chrome as possible.

Direction: "Australian Government service portal". Every app looks like a page on a .gov.au site built with the GOLD design system (the Australian Government Design System): white pages, dark navy header and footer bands, teal actions, underlined links, a 4px grid, 4px corners, thick purple focus rings, flat everything.

References: GOLD design system components (header, main nav, breadcrumbs, side nav, callout, page alert, text input, select, control input, buttons, tags, cards, accordion, table, footer) and the service portals built on it (myGov, Services Australia, australia.gov.au).

Type: Roboto 400/500/700 for everything. Roboto Mono only for live numeric readouts (speed, timers, plates, IDs). GOLD scale: 14 / 16 / 20 / 24 / 32 / 40 / 48 px. Body line-height 1.5, headings 1.25.

Color (light pages): bg #FFFFFF, shade #F5F5F5, alt #EBEBEB, alt-shade #E0E0E0, text #313131, muted #636363, hint #6F777B, border #808080, action #00698F (hover #00435C), focus #9263DE.

Color (dark, for anything floating over the game world): bg #135E70, shade #10505F, alt #0D414D, alt-shade #0A323C, text #FFFFFF, muted #B5CFD6, border #8FB2BA, action #61DAFF (hover #9BE8FF, text on it #135E70), focus #C390F9.

System colours with one job each: error #D60000, success #0B996C, warning #F69900, info #00BFE9.
HUD readout colours (minimal-hud palette): green #06CE6B, blue #2B78FC, orange #FB8607, red #FE2436, white #F2F2F2.

Shape: 4px radius on controls and panels, none on bands. 1px #808080 borders on cards and tables, 3px borders on inputs and buttons. Shadows only under modals and floating panels (two levels). Dense, always on the 4px grid.

Layout: each full-screen app is a gov page: header band, main nav (4px teal underline on the active item), breadcrumbs, side nav plus a content column, footer band. Forms put labels above fields, hints under labels, and errors behind a red left rule. Lists of records are striped tables, not card grids. Floating menus and dialogs reuse the same chrome in the dark palette.

Imagery: the SandboxRP wordmark in header bands. No Commonwealth Coat of Arms and no real agency names anywhere: the look is borrowed, the identity stays the server's.

Motion: 120ms control feedback, 200ms panel open and close, 320ms progress. Nothing decorative. prefers-reduced-motion is respected.

Signature: the navy header band with a bold white title and a teal-underlined nav, and the thick purple focus ring on every control.

HUD exception: the in-world HUD (status bars, speedometer, compass) follows ThatMadCap/minimal-hud instead: no panels, thin bars with hard drop shadows, a 240 degree RPM arc with gear ticks, pill-shaped compass boxes, all set in Roboto. Menus, notifications and prompts in the same resource use the GOLD dark palette.

Avoiding: glass and blur panels with gradients (the old UI), rounded "game menu" pills everywhere, an icon tile in front of every row.
