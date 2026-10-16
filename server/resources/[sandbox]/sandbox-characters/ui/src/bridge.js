/**
 * Lua -> UI message routing. Every SendNUIMessage({ type, data }) listed in
 * CONTRACT.md lands here and mutates the rune state modules directly.
 */
import { onNui } from '@sandbox/ui-kit/nui';
import { app, STATE_CHARACTERS, STATE_SPAWN, showLoading, hideLoading, resetApp } from './state/app.svelte.js';
import { characters, setData, addCharacter, removeCharacter, settlePending, resetCharacters } from './state/characters.svelte.js';
import { setSpawns, resetSpawns } from './state/spawn.svelte.js';

const KNOWN_STATES = new Set([STATE_CHARACTERS, STATE_SPAWN]);

export function installBridge() {
    onNui('APP_SHOW', () => (app.hidden = false));
    onNui('APP_HIDE', () => {
        app.hidden = true;
        characters.pending = null;
        characters.notice = null;
        characters.selected = null;
    });
    onNui('APP_RESET', () => {
        resetApp();
        resetCharacters();
        resetSpawns();
    });

    onNui('LOADING_SHOW', (d = {}) => showLoading(d.message));
    onNui('LOADING_HIDE', () => {
        hideLoading();
        // A round trip that ended without its success message failed.
        settlePending();
    });

    onNui('SET_DATA', (d = {}) => setData(d));
    onNui('SET_STATE', (d = {}) => {
        if (KNOWN_STATES.has(d.state)) app.state = d.state;
    });
    onNui('CREATE_CHARACTER', (d = {}) => addCharacter(d.character));
    onNui('DELETE_CHARACTER', (d = {}) => removeCharacter(d.id));
    onNui('SET_SPAWNS', (d = {}) => {
        setSpawns(d.spawns);
        if (characters.pending === 'select') characters.pending = null;
    });
}
