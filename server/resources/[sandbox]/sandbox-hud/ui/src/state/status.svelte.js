/** Health, armour, registered statuses and buffs (client/hud.lua, client/buffs.lua). */
export const status = $state({
    health: 100,
    maxHealth: 100,
    armor: 0,
    isDead: false,
    buffDefs: {}, // id -> { icon, color, duration, type: timed | value | permanent }
    buffs: [], // { buff, override, val, options, startTime }
    statuses: [], // { name, max, value, icon, color, flash, inverted?, options }
});

export function upsertStatus(s, updateOnly = false) {
    if (!s?.name) return;
    const i = status.statuses.findIndex((x) => x.name === s.name);
    if (i >= 0) status.statuses[i] = { ...status.statuses[i], ...s };
    else if (!updateOnly) status.statuses.push(s);
}

export function applyHp(d = {}) {
    if (typeof d.hp === 'number') status.health = d.hp;
    if (typeof d.maxHp === 'number') status.maxHealth = d.maxHp;
    if (typeof d.armor === 'number') status.armor = d.armor;
}
