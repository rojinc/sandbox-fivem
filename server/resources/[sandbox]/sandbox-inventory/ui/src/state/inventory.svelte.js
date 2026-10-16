/**
 * The player and secondary inventories as Lua sent them, plus the slot locks
 * that keep a slot still until the server confirms a move or a use.
 */
import { asList } from '../lib/item.js';

export const emptyPlayer = () => ({
    loaded: false,
    size: 0,
    invType: 1,
    name: 'Your inventory',
    inventory: [],
    owner: 0,
    capacity: 100,
    isWeaponEligble: false,
    qualifications: [],
});

export const emptySecondary = () => ({
    loaded: false,
    size: 0,
    name: '',
    invType: 0,
    inventory: [],
    owner: 0,
    capacity: 100,
    shop: false,
    free: false,
    playerShop: false,
    modifyShop: false,
    action: false,
    class: false,
    model: false,
    slotOverride: false,
    capacityOverride: false,
});

export const inv = $state({
    player: emptyPlayer(),
    secondary: emptySecondary(),
    showSecondary: false,
    inUse: false,
    /** side -> { [slot]: true } */
    locks: { player: {}, secondary: {} },
});

const lockTimers = new Map();
const LOCK_TIMEOUT = 10000;

export function lockSlot(side, slot) {
    const n = Number(slot);
    if (!n) return;
    inv.locks[side][n] = true;
    const key = `${side}:${n}`;
    clearTimeout(lockTimers.get(key));
    // A lost server reply must not freeze a slot for good.
    lockTimers.set(
        key,
        setTimeout(() => unlockSlot(side, n), LOCK_TIMEOUT),
    );
}

export function unlockSlot(side, slot) {
    const n = Number(typeof slot === 'object' && slot !== null ? slot.Slot : slot);
    if (!n) return;
    const key = `${side}:${n}`;
    clearTimeout(lockTimers.get(key));
    lockTimers.delete(key);
    if (inv.locks[side][n]) delete inv.locks[side][n];
}

export function normaliseList(list) {
    return asList(list).map((s) => ({ ...s, Slot: Number(s.Slot), Count: Number(s.Count) || 0 }));
}

export function setPlayer(data = {}) {
    const next = { ...inv.player, ...data, invType: 1 };
    if (data.inventory !== undefined) next.inventory = normaliseList(data.inventory);
    if (data.qualifications !== undefined) next.qualifications = asList(data.qualifications);
    inv.player = next;
}

export function setSecondary(data = {}) {
    const same = String(inv.secondary.owner) === String(data.owner) && Number(inv.secondary.invType) === Number(data.invType);
    if (!same) {
        for (const slot of Object.keys(inv.locks.secondary)) unlockSlot('secondary', slot);
    }
    inv.secondary = { ...emptySecondary(), ...data, inventory: normaliseList(data.inventory) };
}

export function mergeSecondary(data = {}) {
    const next = { ...inv.secondary, ...data };
    if (data.inventory !== undefined) next.inventory = normaliseList(data.inventory);
    inv.secondary = next;
}

/** RESET_INVENTORY and closing: back to empty, but keep the locks (a reply may still be on its way). */
export function resetInventories() {
    inv.player = emptyPlayer();
    inv.secondary = emptySecondary();
    inv.showSecondary = false;
}

export function slotItem(side, slot) {
    const n = Number(slot);
    return inv[side].inventory.find((s) => s && s.Slot === n) ?? null;
}

export function capacityOf(side) {
    const i = inv[side];
    return Number(side === 'secondary' && i.capacityOverride ? i.capacityOverride : i.capacity) || 0;
}
