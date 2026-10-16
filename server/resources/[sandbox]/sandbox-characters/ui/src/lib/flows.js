/**
 * The five round trips to Lua, each with the local "please wait" the old UI
 * showed. Lua always answers with LOADING_HIDE (plus a success message).
 */
import { fetchNui } from '@sandbox/ui-kit/nui';
import { showLoading } from '../state/app.svelte.js';
import { characters, select } from '../state/characters.svelte.js';

/** Splash -> roster. Lua drives the rest with LOADING_* / SET_DATA / SET_STATE. */
export function requestData() {
    showLoading('Loading server data');
    fetchNui('GetData');
}

/** Ask for the spawn points of one character (Lua answers with SET_SPAWNS + SET_STATE). */
export function playCharacter(character) {
    if (!character?.ID) return;
    select(character.ID);
    characters.pending = 'select';
    showLoading('Getting spawn points');
    fetchNui('SelectCharacter', { id: character.ID });
}

export function deleteCharacter(character) {
    if (!character?.ID) return;
    characters.pending = 'delete';
    showLoading('Deleting character');
    fetchNui('DeleteCharacter', { id: character.ID });
}

/** body: { first, last, gender: 0|1, dob: ISO string, origin: { label, value } | null, bio } */
export function createCharacter(body) {
    characters.pending = 'create';
    showLoading('Creating character');
    fetchNui('CreateCharacter', body);
}

export function spawnCharacter(character, spawnPoint) {
    if (!character || !spawnPoint) return;
    characters.pending = 'play';
    showLoading('Entering Los Santos');
    fetchNui('PlayCharacter', { character, spawn: spawnPoint });
}
