/**
 * Messages, templates, command suggestions and the sent-line history.
 * Lua messages (names and payload fields exactly as client/cl_chat.lua sends them):
 *   ON_MESSAGE           { message }
 *   ON_TEMPLATE_ADD      { template: { id, html } }
 *   ON_SUGGESTION_ADD    { suggestion: { name, help, params } }
 *   ON_SUGGESTION_REMOVE { name }
 *   ON_COMMANDS_RESET
 *   ON_CLEAR
 */
import { DEFAULT_TEMPLATES, isCfxMessage } from '../lib/template.js';

export const MAX_MESSAGES = 150;
export const MAX_HISTORY = 50;

/** A Lua array that is not dense arrives as an object with numeric keys. */
const asList = (v) => (Array.isArray(v) ? v : Object.values(v ?? {}));

export const chat = $state({
    messages: [], // { id, receivedAt, ...message }
    templates: { ...DEFAULT_TEMPLATES },
    suggestions: [], // { name, help, params: [{ name, help }] }
    history: [], // sent lines, newest first
    seq: 0, // bumps on every accepted message (ids and "new line" detection)
});

function isRenderable(message) {
    if (isCfxMessage(message)) return message.args.length > 0;
    return message.message !== undefined && message.message !== null && message.message !== '';
}

export function addMessage(message) {
    if (!message || typeof message !== 'object') return;
    const entry = message.args !== undefined && !Array.isArray(message.args) ? { ...message, args: asList(message.args) } : message;
    if (!isRenderable(entry)) return;
    chat.messages.push({ ...entry, id: chat.seq, receivedAt: Date.now() });
    chat.seq += 1;
    if (chat.messages.length > MAX_MESSAGES) chat.messages.splice(0, chat.messages.length - MAX_MESSAGES);
}

export function addTemplate(template) {
    if (!template?.id || typeof template.html !== 'string') return;
    chat.templates[template.id] = template.html;
}

export function addSuggestion(suggestion) {
    if (!suggestion || typeof suggestion.name !== 'string') return;
    const incoming = {
        name: suggestion.name,
        help: typeof suggestion.help === 'string' ? suggestion.help : '',
        params: asList(suggestion.params).filter((p) => p && typeof p === 'object'),
    };
    const idx = chat.suggestions.findIndex((s) => s.name === incoming.name);
    if (idx === -1) {
        chat.suggestions.push(incoming);
        return;
    }
    // The client component re-sends every registered command with an empty
    // help on each resource start; never let that erase the server's copy.
    const existing = chat.suggestions[idx];
    const bare = !incoming.help && incoming.params.length === 0;
    if (bare && (existing.help || existing.params.length)) return;
    chat.suggestions[idx] = incoming;
}

export function removeSuggestion(name) {
    if (typeof name !== 'string') return;
    chat.suggestions = chat.suggestions.filter((s) => s.name !== name);
}

export function resetSuggestions() {
    chat.suggestions = [];
}

/** ON_CLEAR empties the log; the Up/Down history is kept so a staff /clearall does not eat it. */
export function clearMessages() {
    chat.messages = [];
}

export function pushHistory(message) {
    if (typeof message !== 'string' || !message.trim()) return;
    if (chat.history[0] === message) return;
    chat.history = [message, ...chat.history].slice(0, MAX_HISTORY);
}
