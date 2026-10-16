import Skillbar from './Skillbar.jsx';
import RoundSkillbar from './RoundSkillbar.jsx';
import Scanner from './Scanner.jsx';
import Sequencer from './Sequencer.jsx';
import Keypad from './Keypad.jsx';
import Scrambler from './Scrambler.jsx';
import Memory from './Memory.jsx';
import Aim from './Aim.jsx';
import Captcha from './Captcha.jsx';
import Keymaster from './Keymaster.jsx';
import Pattern from './Pattern.jsx';
import Icons from './Icons.jsx';
import Tracking from './Tracking.jsx';

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
