/** Interaction state: selection, amount, the held (dragged) item, hover and inline messages. */
export const ui = $state({
    /** { side, slot } */
    selection: null,
    /** what the amount field holds, as typed */
    amount: '',
    /** { side, slot, name, count, sticky } while an item follows the pointer */
    held: null,
    /** { side, slot } for the tooltip */
    hover: null,
    /** { tone: 'error' | 'success' | 'info', text } shown between the panels */
    message: null,
    /** { slotFrom, slotTo, name, count, quantity, price } while the add-to-shop form is open */
    addToShop: null,
    /** true while a give waits for the server */
    giving: false,
});

/** Pointer position in frame coordinates, kept apart so only the ghost re-renders on move. */
export const pointer = $state({ x: 0, y: 0 });

let messageTimer = null;
export function say(text, tone = 'error', ms = 4000) {
    ui.message = { text, tone };
    clearTimeout(messageTimer);
    if (ms) messageTimer = setTimeout(() => (ui.message = null), ms);
}

export function clearInteraction() {
    ui.selection = null;
    ui.amount = '';
    ui.held = null;
    ui.hover = null;
    ui.addToShop = null;
    ui.message = null;
}
