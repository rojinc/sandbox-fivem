/**
 * Pointer handling for the grids. A press that moves more than a few pixels
 * picks the item up and the release drops it; a press that does not move is a
 * click (select). Right click picks up half a stack until the next click.
 * Shift-click moves across, Ctrl-drag takes half, middle click uses.
 */
import { app, view } from '../state/app.svelte.js';
import { inv, slotItem } from '../state/inventory.svelte.js';
import { ui, pointer } from '../state/ui.svelte.js';
import { pickUp, dropOn, cancelHold, quickTransfer, amountFor, useSlot } from './actions.js';

const THRESHOLD = 5;
let press = null;
let suppressClick = false;

export function trackPointer(e) {
    const s = view.scale || 1;
    pointer.x = e.clientX / s;
    pointer.y = e.clientY / s;
}

export function select(side, slot) {
    const it = slotItem(side, slot);
    if (!it) {
        ui.selection = null;
        ui.amount = '';
        return;
    }
    if (ui.selection?.side === side && ui.selection?.slot === it.Slot) {
        ui.selection = null;
        ui.amount = '';
        return;
    }
    ui.selection = { side, slot: it.Slot };
    ui.amount = String(Math.min(Number(it.Count) || 1, 10000));
    ui.addToShop = null;
    ui.message = null;
}

export function slotPointerDown(e, side, slot) {
    trackPointer(e);
    if (e.button === 1) {
        e.preventDefault();
        if (side === 'player' && !ui.held) useSlot(side, slot);
        return;
    }
    if (e.button !== 0) return;
    if (ui.held) {
        if (ui.held.sticky) {
            e.preventDefault();
            suppressClick = true;
            dropOn(side, slot);
        }
        return;
    }
    press = slotItem(side, slot) ? { side, slot, x: e.clientX, y: e.clientY, half: e.ctrlKey } : null;
}

export function slotPointerUp(e, side, slot) {
    if (e.button !== 0) return;
    if (ui.held && !ui.held.sticky) {
        suppressClick = true;
        dropOn(side, slot);
    }
    press = null;
}

export function slotClick(e, side, slot) {
    if (suppressClick) {
        suppressClick = false;
        return;
    }
    if (e.shiftKey && slotItem(side, slot)) {
        if (inv.showSecondary && app.mode === 'inventory') quickTransfer(side, slot, amountFor(side, slot));
        return;
    }
    select(side, slot);
}

export function slotContextMenu(e, side, slot) {
    e.preventDefault();
    if (ui.held || !slotItem(side, slot)) return;
    pickUp(side, slot, { sticky: true, half: !e.ctrlKey, single: e.ctrlKey });
}

export function windowPointerMove(e) {
    trackPointer(e);
    if (!press || ui.held) return;
    if (Math.abs(e.clientX - press.x) + Math.abs(e.clientY - press.y) < THRESHOLD) return;
    const p = press;
    press = null;
    if (pickUp(p.side, p.slot, { half: p.half })) suppressClick = true;
}

export function windowPointerUp(e) {
    if (e.button !== 0) return;
    // Released away from every slot: the drag ends where it started.
    if (ui.held && !ui.held.sticky) cancelHold();
    press = null;
    // A click event only follows a release on the same element; do not let the flag leak to the next one.
    setTimeout(() => (suppressClick = false), 0);
}

/** Any press that does not land on a slot puts back an item held from a right click. */
export function windowPointerDown(e) {
    if (ui.held?.sticky && !e.target?.closest?.('button.slot')) cancelHold();
}

/** A press on the dimmed background: drop whatever is held and clear the selection. */
export function backgroundPointerDown(e) {
    if (e.target !== e.currentTarget) return;
    if (ui.held) cancelHold();
    ui.selection = null;
    ui.amount = '';
    ui.addToShop = null;
}
