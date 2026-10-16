/**
 * Screen state. Lua messages:
 *   ON_OPEN                                          -> show the log and the input
 *   ON_SCREEN_STATE_CHANGE { shouldHide, inputting } -> logout / UI reset force it shut
 * `draft` is the text in the input bar. It is UI-internal: the preview runner
 * cannot type, so its scenarios seed it with the `input/set` message.
 */
export const screen = $state({
    hidden: true,
    inputting: false,
    draft: '',
});

export function openInput() {
    screen.hidden = false;
    screen.inputting = true;
    screen.draft = '';
}

export function setScreenState({ shouldHide, inputting } = {}) {
    if (shouldHide !== undefined) screen.hidden = Boolean(shouldHide);
    if (inputting !== undefined) {
        screen.inputting = Boolean(inputting);
        if (!screen.inputting) screen.draft = '';
    }
}

/** What the input bar does after Enter or Escape. The bar itself sends the chatResult callback. */
export function closeInput() {
    screen.hidden = true;
    screen.inputting = false;
    screen.draft = '';
}

export function setDraft(value) {
    screen.draft = String(value ?? '');
}
