/**
 * Everything the player does to items: pick up, drop, quick transfer, buy,
 * use and add to a player shop. Ported from the old Slot.js / reducer logic:
 * the UI updates both grids at once (optimistic) and locks the two slots until
 * Lua answers with SET_PLAYER_SLOT / SET_SECONDARY_SLOT.
 */
import { fetchNui } from '@sandbox/ui-kit/nui';
import { catalog } from '../state/catalog.svelte.js';
import { app } from '../state/app.svelte.js';
import { inv, slotItem, capacityOf, lockSlot, unlockSlot } from '../state/inventory.svelte.js';
import { ui, say } from '../state/ui.svelte.js';
import { itemDef, itemLabel, inventoryWeight, stackMax, durabilityOf, parseMeta, formatCount } from './item.js';
import { playDrag } from './sound.js';

const MAX_MOVE = 10000;

export const other = (side) => (side === 'player' ? 'secondary' : 'player');

function sound(name) {
    fetchNui('FrontEndSound', name);
}

function refuse(text) {
    sound('DISABLED');
    if (text) say(text, 'error');
    return false;
}

function invName(side) {
    if (side === 'player') return 'your inventory';
    const s = inv.secondary;
    if (Number(s.invType) === 10) return 'the ground';
    return s.name || 'the other inventory';
}

export function weightOf(side) {
    return inventoryWeight(inv[side].inventory, catalog.items);
}

/** Is this secondary slot the container that is open right now? */
export function isOpenContainer(instance) {
    if (!instance) return false;
    const def = catalog.items[instance.Name];
    if (Number(def?.type) !== 10) return false;
    const md = parseMeta(instance.MetaData);
    return String(inv.secondary.owner) === `container:${md.Container}`;
}

/** Why an item in a shop cannot be taken, or null. */
export function shopBlock(side, instance) {
    if (side !== 'secondary' || !inv.secondary.shop || !instance) return null;
    const def = catalog.items[instance.Name];
    if (def?.requiresLicense && Number(def?.type) === 2 && !inv.player.isWeaponEligble) return 'You need a weapons permit to buy this.';
    if (def?.qualification && !(inv.player.qualifications ?? []).includes(def.qualification)) return 'You need an extra qualification to buy this.';
    return null;
}

/** Why an item cannot be picked up at all, or null. */
export function pickupBlock(side, instance) {
    if (!instance) return 'empty';
    if (inv.locks[side][instance.Slot]) return 'That slot is still updating. Try again in a moment.';
    const def = itemDef(catalog.items, instance.Name);
    if (def.invalid) return 'This item has no definition, so it cannot be moved.';
    if (isOpenContainer(instance)) return 'Close the container before you move it.';
    return shopBlock(side, instance);
}

/** The amount typed between the panels, if it applies to this slot. */
export function selectedAmount(side, slot, count) {
    const sel = ui.selection;
    if (!sel || sel.side !== side || sel.slot !== slot) return null;
    const n = Math.floor(Number(ui.amount));
    if (!Number.isFinite(n) || n < 1) return null;
    return Math.min(n, count, MAX_MOVE);
}

export function amountFor(side, slot, { half = false, single = false } = {}) {
    const it = slotItem(side, slot);
    if (!it) return 0;
    const count = Math.max(1, Number(it.Count) || 1);
    if (single) return 1;
    if (half) return Math.max(1, Math.min(Math.ceil(count / 2), MAX_MOVE));
    return selectedAmount(side, slot, count) ?? Math.min(count, MAX_MOVE);
}

/** Start holding an item (drag, or a sticky pick-up from a right click). */
export function pickUp(side, slot, { sticky = false, half = false, single = false } = {}) {
    const it = slotItem(side, slot);
    const block = pickupBlock(side, it);
    if (block) {
        if (block !== 'empty') refuse(block);
        return false;
    }
    const def = itemDef(catalog.items, it.Name);
    const count = amountFor(side, slot, { half: half && stackMax(def) > 0, single });
    ui.held = { side, slot: it.Slot, name: it.Name, count, sticky };
    ui.hover = null;
    return true;
}

export function cancelHold() {
    if (!ui.held) return;
    ui.held = null;
    sound('DISABLED');
}

function moveBody(fromSide, fromSlot, toSide, toSlot, origin, count) {
    const f = inv[fromSide];
    const t = inv[toSide];
    return {
        ownerFrom: f.owner,
        ownerTo: t.owner,
        slotFrom: fromSlot,
        slotTo: toSlot,
        name: origin.Name,
        countFrom: Number(origin.Count),
        countTo: count,
        invTypeFrom: f.invType,
        invTypeTo: t.invType,
        vehClassFrom: fromSide === 'secondary' ? (f.class ?? false) : false,
        vehClassTo: toSide === 'secondary' ? (t.class ?? false) : false,
        vehModelFrom: fromSide === 'secondary' ? (f.model ?? false) : false,
        vehModelTo: toSide === 'secondary' ? (t.model ?? false) : false,
        slotOverrideFrom: fromSide === 'secondary' ? (f.slotOverride ?? false) : false,
        slotOverrideTo: toSide === 'secondary' ? (t.slotOverride ?? false) : false,
        capacityOverrideFrom: fromSide === 'secondary' ? (f.capacityOverride ?? false) : false,
        capacityOverrideTo: toSide === 'secondary' ? (t.capacityOverride ?? false) : false,
    };
}

/** Optimistic local update, the same result the server will produce. */
function applyLocal(kind, fromSide, fromSlot, toSide, toSlot, count) {
    const shopOrigin = fromSide === 'secondary' && inv.secondary.shop;
    const fromList = inv[fromSide].inventory;
    const o = fromList.find((s) => s.Slot === fromSlot);
    if (!o) return;
    const snapshot = { ...o };

    if (kind === 'swap') {
        const toList = inv[toSide].inventory;
        const d = toList.find((s) => s.Slot === toSlot);
        if (!d) return;
        const dSnap = { ...d };
        if (fromSide === toSide) {
            inv[fromSide].inventory = fromList.map((s) => (s === o ? { ...snapshot, Slot: toSlot } : s === d ? { ...dSnap, Slot: fromSlot } : s));
        } else {
            inv[fromSide].inventory = [...fromList.filter((s) => s !== o), { ...dSnap, Slot: fromSlot }];
            inv[toSide].inventory = [...toList.filter((s) => s !== d), { ...snapshot, Slot: toSlot }];
        }
    } else {
        // move, merge and split all take `count` from the origin and put it on the destination.
        if (!shopOrigin) {
            inv[fromSide].inventory = count >= snapshot.Count ? fromList.filter((s) => s !== o) : fromList.map((s) => (s === o ? { ...snapshot, Count: snapshot.Count - count } : s));
        }
        const toList = inv[toSide].inventory;
        const d = toList.find((s) => s.Slot === toSlot);
        if (d) {
            inv[toSide].inventory = toList.map((s) => (s === d ? { ...d, Count: Number(d.Count) + count } : s));
        } else {
            const created = { ...snapshot, Slot: toSlot, Count: count };
            if (shopOrigin) {
                created.CreateDate = Math.floor(Date.now() / 1000);
                delete created.Price;
            }
            inv[toSide].inventory = [...toList, created];
        }
    }

    lockSlot(fromSide, fromSlot);
    lockSlot(toSide, toSlot);
}

function send(kind, fromSide, fromSlot, toSide, toSlot, origin, count, isSplit) {
    const body = moveBody(fromSide, fromSlot, toSide, toSlot, origin, count);
    if (kind === 'swap') fetchNui('SwapSlot', body);
    else if (kind === 'merge') fetchNui('MergeSlot', body);
    else fetchNui('MoveSlot', { ...body, isSplit: Boolean(isSplit) });
    applyLocal(kind, fromSide, fromSlot, toSide, toSlot, count);
    playDrag(app.settings.muted);
    ui.message = null;
}

const SHOP_LIMIT = 50;

function openAddToShop(fromSlot, toSlot, origin, count) {
    if (inv.secondary.inventory.length >= SHOP_LIMIT && !slotItem('secondary', toSlot)) return refuse(`This shop is full. It lists up to ${SHOP_LIMIT} items.`);
    const def = itemDef(catalog.items, origin.Name);
    ui.addToShop = {
        slotFrom: fromSlot,
        slotTo: toSlot,
        name: origin.Name,
        label: itemLabel(origin, def),
        max: Number(origin.Count) || 1,
        stackable: stackMax(def) > 0,
        quantity: String(count),
        price: String(Number(def.price) || 0),
    };
    ui.selection = null;
    sound('SHOP_ADD');
}

function weightCheck(fromSide, toSide, origin, count) {
    if (fromSide === toSide) return null;
    const def = itemDef(catalog.items, origin.Name);
    const add = (Number(def.weight) || 0) * count;
    if (weightOf(toSide) + add > capacityOf(toSide)) {
        return toSide === 'player' ? 'You cannot carry that much. Move fewer or free up some weight.' : `${capitalise(invName(toSide))} cannot hold that much weight.`;
    }
    return null;
}

const capitalise = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/** Drop the held item on a slot. */
export function dropOn(toSide, toSlot) {
    const held = ui.held;
    if (!held) return false;
    ui.held = null;
    toSlot = Number(toSlot);
    if (held.side === toSide && held.slot === toSlot) return false;

    const fromSide = held.side;
    const origin = slotItem(fromSide, held.slot);
    if (!origin || origin.Name !== held.name) return refuse('That item has moved. Pick it up again.');
    const count = Math.max(1, Math.min(held.count, Number(origin.Count) || 1));
    const t = inv[toSide];
    const dest = slotItem(toSide, toSlot);
    const destDef = dest ? itemDef(catalog.items, dest.Name) : null;

    if (inv.locks[toSide][toSlot]) return refuse('That slot is still updating. Try again in a moment.');
    if (dest && destDef.invalid) return refuse('That slot holds an item with no definition.');
    if (dest && isOpenContainer(dest)) return refuse('You cannot drop items on a container while it is open.');
    if (toSide === 'secondary' && t.shop) return refuse('This shop does not buy items.');
    if (toSide === 'secondary' && t.playerShop && !t.modifyShop) return refuse('Only the shop owner and moderators can add items.');

    const heavy = weightCheck(fromSide, toSide, origin, count);
    if (heavy) return refuse(heavy);

    const fromShop = fromSide === 'secondary' && inv.secondary.shop;
    if (fromShop && toSide === 'player' && dest && dest.Name !== origin.Name) return refuse('Drop it on an empty slot or on the same item.');

    const isSplit = count !== Number(origin.Count);
    const fits = Boolean(dest) && dest.Name === origin.Name && Number(dest.Count) + count <= stackMax(destDef);

    if (fromSide === toSide) {
        if (dest) {
            if (fits) {
                if (isSplit) send('move', fromSide, held.slot, toSide, toSlot, origin, count, true);
                else {
                    if (fromSide === 'secondary' && inv.secondary.playerShop && Number(dest.Price) !== Number(origin.Price)) return refuse('Items with different prices cannot share a slot.');
                    send('merge', fromSide, held.slot, toSide, toSlot, origin, count);
                }
            } else {
                if (isSplit) return refuse('Drop part of a stack on an empty slot or on the same item.');
                send('swap', fromSide, held.slot, toSide, toSlot, origin, count);
            }
        } else {
            send('move', fromSide, held.slot, toSide, toSlot, origin, count, isSplit);
        }
        return true;
    }

    if (fromSide === 'player' && t.playerShop) {
        if (!dest || (dest.Name === origin.Name && Number(dest.Count) + count <= stackMax(destDef))) {
            openAddToShop(held.slot, toSlot, origin, count);
            return Boolean(ui.addToShop);
        }
        return refuse('Drop it on an empty shop slot or on the same item.');
    }

    if (dest) {
        if (fits) send(isSplit ? 'move' : 'merge', fromSide, held.slot, toSide, toSlot, origin, count, isSplit);
        else if (!isSplit && !inv.secondary.shop && !inv.secondary.playerShop) send('swap', fromSide, held.slot, toSide, toSlot, origin, count);
        else return refuse('Drop it on an empty slot or on the same item.');
    } else {
        send('move', fromSide, held.slot, toSide, toSlot, origin, count, isSplit);
    }
    return true;
}

/** Move (or buy) `count` of a slot to the other inventory: first matching stack, else first free slot. */
export function quickTransfer(fromSide, fromSlot, count) {
    const toSide = other(fromSide);
    if (!inv.showSecondary || app.mode !== 'inventory') return refuse('There is no other inventory open.');
    const origin = slotItem(fromSide, fromSlot);
    const block = pickupBlock(fromSide, origin);
    if (block) return block === 'empty' ? false : refuse(block);
    const t = inv[toSide];
    if (toSide === 'secondary' && t.shop) return refuse('This shop does not buy items.');
    if (toSide === 'secondary' && t.playerShop && !t.modifyShop) return refuse('Only the shop owner and moderators can add items.');

    const def = itemDef(catalog.items, origin.Name);
    const n = Math.max(1, Math.min(Number(count) || Number(origin.Count) || 1, Number(origin.Count) || 1, MAX_MOVE));
    const heavy = weightCheck(fromSide, toSide, origin, n);
    if (heavy) return refuse(heavy);

    const max = stackMax(def);
    let destSlot = null;
    if (max > 0) {
        const match = [...t.inventory]
            .sort((a, b) => a.Slot - b.Slot)
            .find((s) => s.Name === origin.Name && Number(s.Count) + n <= max && !inv.locks[toSide][s.Slot] && !(toSide === 'secondary' && t.playerShop && Number(s.Price) !== Number(origin.Price)));
        if (match) destSlot = match.Slot;
    }
    if (!destSlot) {
        const size = Number(t.size) || 0;
        for (let i = 1; i <= size; i += 1) {
            if (!slotItem(toSide, i) && !inv.locks[toSide][i]) {
                destSlot = i;
                break;
            }
        }
    }
    if (!destSlot) return refuse(`There is no free slot in ${invName(toSide)}.`);

    if (toSide === 'secondary' && t.playerShop) {
        openAddToShop(fromSlot, destSlot, origin, n);
        return Boolean(ui.addToShop);
    }

    const isSplit = n !== Number(origin.Count);
    const dest = slotItem(toSide, destSlot);
    send(dest && !isSplit ? 'merge' : 'move', fromSide, fromSlot, toSide, destSlot, origin, n, isSplit);
    return true;
}

/** Why the player cannot use this slot right now, or null. */
export function useBlock(side, instance) {
    if (!instance) return 'Select an item in your inventory first.';
    if (side !== 'player') return 'Move the item to your inventory to use it.';
    if (app.mode !== 'inventory') return 'You cannot use items at a crafting bench.';
    if (inv.inUse) return 'You are already using an item.';
    if (inv.locks.player[instance.Slot]) return 'That slot is still updating. Try again in a moment.';
    const def = itemDef(catalog.items, instance.Name);
    if (def.invalid) return 'This item has no definition, so it cannot be used.';
    if (!def.isUsable) return `${itemLabel(instance, def)} cannot be used.`;
    const d = durabilityOf(instance, def);
    if (d !== null && d <= 0) return `${itemLabel(instance, def)} is broken.`;
    return null;
}

export function useSlot(side, slot) {
    const it = slotItem(side, slot);
    const block = useBlock(side, it);
    if (block) return refuse(block);
    sound('SELECT');
    fetchNui('UseItem', { owner: inv.player.owner, slot: it.Slot, invType: inv.player.invType });
    lockSlot('player', it.Slot);
    ui.message = null;
    return true;
}

/** Why this slot cannot be given right now, or null. */
export function giveBlock(side, instance) {
    if (!instance) return 'Select an item in your inventory first.';
    if (side !== 'player') return 'Move the item to your inventory to give it.';
    if (app.mode !== 'inventory') return 'You cannot give items at a crafting bench.';
    if (inv.inUse) return 'You are using an item. Wait for it to finish.';
    if (ui.giving) return 'Wait for the last item to be handed over.';
    if (inv.locks.player[instance.Slot]) return 'That slot is still updating. Try again in a moment.';
    if (itemDef(catalog.items, instance.Name).invalid) return 'This item has no definition, so it cannot be given.';
    return null;
}

/**
 * Hand some of a slot to the nearest person. Lua picks who; the server checks
 * the distance, the amount and their space, then both inventories refresh
 * through SET_INVENTORIES. Nothing changes here until it answers.
 */
export async function giveSlot(slot, count) {
    const it = slotItem('player', slot);
    const block = giveBlock('player', it);
    if (block) return refuse(block);
    const def = itemDef(catalog.items, it.Name);
    const label = itemLabel(it, def);
    const n = Math.max(1, Math.min(Math.floor(Number(count)) || 1, Number(it.Count) || 1));
    sound('SELECT');
    lockSlot('player', it.Slot);
    ui.giving = true;
    ui.message = null;
    let res = null;
    try {
        res = await fetchNui('GiveItem', { slot: it.Slot, count: n });
    } catch {
        res = null;
    }
    ui.giving = false;
    unlockSlot('player', it.Slot);
    if (res && res.success) {
        say(`You gave ${formatCount(Number(res.count) || n)} ${label}.`, 'success');
        return true;
    }
    return refuse(res?.reason || 'The item was not given. Try again.');
}

export async function submitAddToShop() {
    const form = ui.addToShop;
    if (!form) return;
    const qty = Math.floor(Number(form.quantity));
    const price = Math.floor(Number(form.price));
    if (!Number.isFinite(qty) || qty < 1 || qty > form.max) return say(`Enter a quantity from 1 to ${formatCount(form.max)}.`, 'error');
    if (!Number.isFinite(price) || price < 0 || price > 4000000000) return say('Enter a price of $0 or more.', 'error');
    sound('SELECT');
    ui.addToShop = { ...form, busy: true };
    let res = null;
    try {
        res = await fetchNui('AddToShop', {
            ownerFrom: inv.player.owner,
            invTypeFrom: inv.player.invType,
            slotFrom: form.slotFrom,
            ownerTo: inv.secondary.owner,
            invTypeTo: inv.secondary.invType,
            slotTo: form.slotTo,
            price,
            quantity: qty,
        });
    } catch {
        res = null;
    }
    ui.addToShop = null;
    if (res && typeof res === 'object' && (res.player || res.secondary)) {
        if (res.player) inv.player.inventory = Object.values(res.player).map((s) => ({ ...s, Slot: Number(s.Slot), Count: Number(s.Count) || 0 }));
        if (res.secondary) inv.secondary.inventory = Object.values(res.secondary).map((s) => ({ ...s, Slot: Number(s.Slot), Count: Number(s.Count) || 0 }));
        say(`Added ${formatCount(qty)} ${form.label} to the shop.`, 'success');
    } else {
        say('The shop did not take the item. Check you still moderate this shop and try again.', 'error', 6000);
    }
}

export function submitAction() {
    sound('SELECT');
    fetchNui('SubmitAction', { owner: inv.secondary.owner, invType: inv.secondary.invType });
}

export function closeInventory() {
    fetchNui('Close');
}

export function saveSettings(patch) {
    app.settings = { ...app.settings, ...patch };
    // The server keeps only these two keys, each with this type (server/inventory.lua _defInvSettings).
    fetchNui('UpdateSettings', { muted: Boolean(app.settings.muted), useBank: Boolean(app.settings.useBank) });
}
