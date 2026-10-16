/**
 * Command suggestion helpers (pure functions).
 */
export const MAX_SHOWN = 6;

export function isCommand(value) {
    return typeof value === 'string' && value.startsWith('/');
}

/** Tokens of the draft, quoted strings kept together: /give "John Doe" 5 */
export function tokenize(value) {
    return String(value ?? '').match(/"[^"]*"?|\S+/g) ?? [];
}

/**
 * Index of the parameter being typed (-1 while still on the command word).
 * "/cmd" -> -1, "/cmd " -> 0, "/cmd a" -> 0, "/cmd a " -> 1
 */
export function paramIndex(value) {
    const tokens = tokenize(value);
    const trailingSpace = /\s$/.test(String(value ?? ''));
    const current = trailingSpace ? tokens.length : tokens.length - 1;
    return current - 1;
}

/** Suggestions whose name starts with the command word, sorted by name. */
export function matchSuggestions(suggestions, value) {
    if (!isCommand(value)) return [];
    const word = value.split(/\s/, 1)[0].toLowerCase();
    return suggestions
        .filter((s) => typeof s?.name === 'string' && s.name.toLowerCase().startsWith(word))
        .sort((a, b) => a.name.localeCompare(b.name));
}

/** Help text to show for a suggestion given where the caret is. */
export function helpFor(suggestion, index, isActive) {
    const params = Array.isArray(suggestion.params) ? suggestion.params : [];
    if (isActive && index >= 0 && params.length > 0) {
        const p = params[Math.min(index, params.length - 1)];
        return p?.help || suggestion.help || '';
    }
    return suggestion.help || '';
}
