/**
 * The minimap anchor Lua sends (GetMinimapAnchor in client/hud.lua) is normalised
 * screen space: leftX/rightX/topY/bottomY in 0..1. The cluster normally occupies
 * the minimap's slot (radar hidden); when the radar is visible ("shifted", in a
 * vehicle or with GPS) it moves to the minimap's right edge.
 */
export function hasAnchor(position) {
    return Boolean(position && typeof position.bottomY === 'number');
}

/** CSS for the main cluster container: anchored by its bottom-left corner. */
export function clusterAnchor(position, shifted) {
    if (!hasAnchor(position)) {
        return { left: '1.35vw', bottom: '2.6vh' };
    }
    const x = shifted ? position.rightX + 0.0055 : position.leftX + 0.0045;
    return { left: `${x * 100}vw`, bottom: `${(1 - position.bottomY) * 100}vh` };
}

/** Top-left corner just under the minimap (minimap layout). */
export function belowMinimap(position) {
    if (!hasAnchor(position)) return { left: 15, top: 2 };
    return { left: `${(position.leftX + 0.0045) * 100}vw`, top: `${(position.bottomY + 0.001) * 100}vh` };
}
