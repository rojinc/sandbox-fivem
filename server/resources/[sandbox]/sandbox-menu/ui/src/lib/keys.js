/**
 * Keyboard for the menu (CONTRACT.md, "Keyboard and focus"). handleKey runs
 * through onKey on keydown and returns false while the panel is hidden, or
 * when a text field should get the key instead.
 */
import { view } from '../state/menu.svelte.js';
import { send, moveCursor, step, activate, goBack, closeMenu, endEdit, moveEditor, nudgeChannel, commitPending } from './actions.js';

export const KEYS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Backspace', 'Escape'];

const isTyping = () => {
    const el = document.activeElement;
    return Boolean(el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable));
};

function editorKey(e, ed) {
    if (ed.mode === 'text' || ed.mode === 'entry') {
        // The field keeps arrows and Backspace; Enter saves, Escape leaves (a typed ticker number is dropped).
        if (e.key === 'Enter') endEdit(true);
        else if (e.key === 'Escape') endEdit(ed.mode === 'text');
        else return false;
        return true;
    }
    switch (e.key) {
        case 'ArrowUp':
        case 'ArrowDown':
            moveEditor(e.key === 'ArrowDown' ? 1 : -1);
            break;
        case 'ArrowLeft':
        case 'ArrowRight':
            if (ed.mode === 'color') nudgeChannel(e.key === 'ArrowRight' ? 1 : -1, e.repeat);
            break;
        case 'Enter':
            if (!e.repeat) endEdit(true);
            break;
        default:
            // Escape and Backspace close the list or colour editor without saving.
            endEdit(false);
    }
    return true;
}

export function handleKey(e) {
    if (!view.shown || !view.current) return false;
    if (view.editing) return editorKey(e, view.editing);
    if (isTyping()) return false;
    const item = view.current.items[view.cursor];
    switch (e.key) {
        case 'ArrowUp':
        case 'ArrowDown':
            moveCursor(e.key === 'ArrowDown' ? 1 : -1);
            break;
        case 'ArrowLeft':
        case 'ArrowRight':
            step(item, e.key === 'ArrowRight' ? 1 : -1);
            break;
        case 'Enter':
            if (!e.repeat) activate(item);
            break;
        case 'Backspace':
            if (!e.repeat) goBack();
            break;
        case 'Escape':
            if (!e.repeat) closeMenu();
            break;
        default:
            return false;
    }
    return true;
}

/** keyup: Shift hands the camera back to the game; releasing an arrow sends a slider's new value. */
export function handleKeyUp(e) {
    if (!view.shown) return;
    if (e.key === 'Shift' && !isTyping()) send('ToggleFocusLoss');
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') commitPending();
}
