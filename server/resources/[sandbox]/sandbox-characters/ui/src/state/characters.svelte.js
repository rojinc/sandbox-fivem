/**
 * Character roster, MOTD, changelog and the UI-local selection, in-flight
 * request and notice.
 *
 * From Lua (see ../../CONTRACT.md):
 *   SET_DATA         { changelog, motd, characters, characterLimit, serverName? }
 *   CREATE_CHARACTER { character }
 *   DELETE_CHARACTER { id }
 *   SET_SPAWNS       { spawns }   (clears a pending "select")
 *   LOADING_HIDE                  (a pending request with no success message failed)
 */
import { asArray } from '../lib/format.js';

export const DEFAULT_SERVER_NAME = 'SandboxRP';

/** "^1Sandbox^7RP" -> "SandboxRP" */
function cleanServerName(v) {
    const s = typeof v === 'string' ? v.replace(/\^\d/g, '').trim() : '';
    return s || DEFAULT_SERVER_NAME;
}

const initial = () => ({
    list: [],
    changelog: null,
    motd: null,
    limit: 3,
    /** sv_projectName from Lua, without FiveM colour codes. */
    serverName: DEFAULT_SERVER_NAME,
    /** ID of the highlighted row (UI-local). */
    selected: null,
    /** 'create' | 'delete' | 'select' | 'play' while a callback is in flight (UI-local). */
    pending: null,
    /** { tone: 'success' | 'error' | 'info', text, at } (UI-local). */
    notice: null,
});

export const characters = $state(initial());

const FAILURE_TEXT = {
    create: 'Your character was not created. Check you have a free slot, then try again.',
    delete: 'Your character was not deleted. Try again in a minute.',
    select: 'There are no spawn points for this character right now. Try again in a minute, or choose another character.',
};

/** Default highlight: the most recently played character, else the first. */
function defaultSelection(list) {
    if (!list.length) return null;
    let best = list[0];
    for (const c of list) {
        if (Number(c.LastPlayed) > Number(best.LastPlayed)) best = c;
    }
    return best.ID ?? null;
}

export function setData(d) {
    const list = asArray(d.characters);
    characters.list = list;
    characters.changelog = d.changelog && typeof d.changelog === 'object' ? d.changelog : null;
    characters.motd = typeof d.motd === 'string' && d.motd.trim() ? d.motd : null;
    characters.limit = Number(d.characterLimit) > 0 ? Number(d.characterLimit) : characters.limit;
    characters.serverName = cleanServerName(d.serverName);
    characters.selected = defaultSelection(list);
    characters.pending = null;
}

export function addCharacter(character) {
    characters.pending = null;
    if (!character || typeof character !== 'object') return;
    characters.list = [...characters.list, character];
    characters.selected = character.ID ?? characters.selected;
    notify('success', `${character.First} ${character.Last} is ready to play.`);
}

export function removeCharacter(id) {
    characters.pending = null;
    const gone = characters.list.find((c) => c.ID === id);
    const remaining = characters.list.filter((c) => c.ID !== id);
    characters.list = remaining;
    if (characters.selected === id) characters.selected = defaultSelection(remaining);
    if (gone) notify('info', `${gone.First} ${gone.Last} was deleted.`);
}

/** LOADING_HIDE with a request still pending means Lua sent no success message. */
export function settlePending() {
    const p = characters.pending;
    if (!p) return;
    characters.pending = null;
    if (FAILURE_TEXT[p]) notify('error', FAILURE_TEXT[p]);
}

export function select(id) {
    characters.selected = id ?? null;
}

export function notify(tone, text) {
    characters.notice = { tone, text, at: Date.now() };
}

export function dismissNotice() {
    characters.notice = null;
}

export function resetCharacters() {
    Object.assign(characters, initial());
}

export function selectedCharacter() {
    return characters.list.find((c) => c.ID === characters.selected) ?? null;
}

export function canCreate() {
    return characters.list.length < characters.limit;
}
