/**
 * The minimap anchor Lua sends (GetMinimapAnchor in client/hud.lua) is
 * normalised screen space: leftX/rightX/topY/bottomY/width/height in 0..1.
 * The status cluster sits directly under the minimap, twice as wide as the
 * map, like minimal-hud. Without an anchor (browser dev) it sits bottom-left.
 */
export function hasAnchor(position) {
    return Boolean(position && typeof position.bottomY === 'number' && typeof position.leftX === 'number');
}

export function statusAnchor(position) {
    if (!hasAnchor(position)) {
        return 'left:1.1vw;bottom:1.6vh;width:28vw';
    }
    const width = Math.max(0.2, (position.width ?? 0.14) * 2);
    return `left:${(position.leftX * 100).toFixed(3)}vw;top:calc(${(position.bottomY * 100).toFixed(3)}vh + 0.4em);width:${(width * 100).toFixed(3)}vw`;
}

/** Buff chips sit to the right of the minimap, just above the status row. */
export function buffsAnchor(position) {
    if (!hasAnchor(position)) {
        return 'left:1.1vw;bottom:calc(1.6vh + 3.4em)';
    }
    return `left:calc(${(position.rightX * 100).toFixed(3)}vw + 0.6em);top:calc(${(position.bottomY * 100).toFixed(3)}vh - 2.3em)`;
}
