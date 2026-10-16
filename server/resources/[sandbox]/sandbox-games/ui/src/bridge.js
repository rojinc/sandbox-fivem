/** Lua -> UI routing. See ../CONTRACT.md. */
import { onNui } from '@sandbox/ui-kit/nui';
import { startGame, cancelGame } from './state/game.svelte.js';

export function installBridge() {
    onNui('SHOW_GAME', (d = {}) => startGame(d?.game));
    onNui('FAIL_GAME', () => cancelGame());
}
