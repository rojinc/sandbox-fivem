import Skillbar from './Skillbar.svelte';
import RoundSkillbar from './RoundSkillbar.svelte';
import Scanner from './Scanner.svelte';
import Sequencer from './Sequencer.svelte';
import Keypad from './Keypad.svelte';
import Scrambler from './Scrambler.svelte';
import Memory from './Memory.svelte';
import Aim from './Aim.svelte';
import Captcha from './Captcha.svelte';
import Keymaster from './Keymaster.svelte';
import Pattern from './Pattern.svelte';
import Icons from './Icons.svelte';
import Tracking from './Tracking.svelte';

/** `params.type` from Lua -> component. */
export const GAMES = {
    skillbar: Skillbar,
    round: RoundSkillbar,
    scanner: Scanner,
    sequencer: Sequencer,
    keypad: Keypad,
    scrambler: Scrambler,
    memory: Memory,
    aim: Aim,
    captcha: Captcha,
    keymaster: Keymaster,
    pattern: Pattern,
    icons: Icons,
    tracking: Tracking,
};
