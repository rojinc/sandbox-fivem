/**
 * Lua -> UI message routing. Every SendNUIMessage({ type, data }) listed in
 * CONTRACT.md lands here and mutates the rune state modules directly.
 */
import { onNui } from '@sandbox/ui-kit/nui';
import { openInput, setScreenState, setDraft } from './state/screen.svelte.js';
import { addMessage, addTemplate, addSuggestion, removeSuggestion, resetSuggestions, clearMessages } from './state/chat.svelte.js';

export function installBridge() {
    /* --------------------------------------------------------- screen */
    onNui('ON_OPEN', () => openInput());
    onNui('ON_SCREEN_STATE_CHANGE', (d = {}) => setScreenState(d));

    /* ------------------------------------------------------------ log */
    onNui('ON_MESSAGE', (d = {}) => addMessage(d.message));
    onNui('ON_TEMPLATE_ADD', (d = {}) => addTemplate(d.template));
    onNui('ON_CLEAR', () => clearMessages());

    /* ------------------------------------------------------- commands */
    onNui('ON_SUGGESTION_ADD', (d = {}) => addSuggestion(d.suggestion));
    onNui('ON_SUGGESTION_REMOVE', (d = {}) => removeSuggestion(d.name));
    onNui('ON_COMMANDS_RESET', () => resetSuggestions());

    /* UI-internal, never sent by Lua: the preview runner cannot type, so its scenarios seed the draft with it. */
    onNui('input/set', (d = {}) => setDraft(d.value));
}
