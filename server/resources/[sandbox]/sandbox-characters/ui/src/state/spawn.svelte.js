/**
 * Spawn points for the character that was just selected.
 *
 *   SET_SPAWNS { spawns: [{ id, label, location, icon?, event? }] }
 *
 * Spawn ids are not unique (Config.DefaultSpawns all use id 1), so the
 * selection is an index. The first option is pre-selected so Enter plays.
 */
import { asArray } from '../lib/format.js';

const initial = () => ({ list: [], selected: 0 });

export const spawn = $state(initial());

export function setSpawns(spawns) {
    spawn.list = asArray(spawns).filter((s) => s && typeof s === 'object');
    spawn.selected = 0;
}

export function chooseSpawn(index) {
    spawn.selected = Math.max(0, Math.min(spawn.list.length - 1, Number(index) || 0));
}

export function selectedSpawn() {
    return spawn.list[spawn.selected] ?? null;
}

export function resetSpawns() {
    Object.assign(spawn, initial());
}
