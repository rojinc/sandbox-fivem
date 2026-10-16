/**
 * Rules and tips rotated in the corner card. Keys reference the server's
 * default key bindings (sandbox-keybinds); players can rebind them in the
 * GTA settings, which the "essentials" tip says.
 */
export const TIPS = [
    {
        kind: 'Rule',
        title: 'Stay in character',
        body: 'Everything you say in the city is said by your character. Keep out-of-character talk to /ooc and break character only when staff ask you to.',
    },
    {
        kind: 'Tip',
        title: 'The essentials',
        body: 'Most of what you need is one key away. All of these can be rebound in Settings, under Key Bindings.',
        keys: [
            ['M', 'Phone'],
            ['Tab', 'Inventory'],
            ['F1', 'Interactions'],
            ['Alt', 'Third eye'],
        ],
    },
    {
        kind: 'Rule',
        title: 'Value your life',
        body: 'Your character wants to live. When you are clearly outnumbered or outgunned, comply and let the scene play out. The story is better for it.',
    },
    {
        kind: 'Tip',
        title: 'Talking to the city',
        body: 'Cycle your voice range when you need to whisper or shout, and hold the radio key to talk on your channel.',
        keys: [
            ['Z', 'Voice range'],
            ['Caps', 'Radio'],
            ['B', 'Point'],
        ],
    },
    {
        kind: 'Rule',
        title: 'No metagaming',
        body: 'Act only on what your character has learned in the city. Streams, Discord and the forums are not sources of in-character information.',
    },
    {
        kind: 'Rule',
        title: 'Report, do not retaliate',
        body: 'If a scene breaks the rules, finish it in character and then open a report. Staff review the clip and handle it; arguing in /ooc never helps.',
    },
    {
        kind: 'Tip',
        title: 'Crashed mid-scene?',
        body: 'Rejoin straight away. Crash priority puts you back at the front of the queue so you can pick the scene up where you left it.',
    },
    {
        kind: 'Tip',
        title: 'More than one life',
        body: 'You can keep several characters, each with their own phone, bank account and vehicles. Pick one on the next screen.',
    },
];
