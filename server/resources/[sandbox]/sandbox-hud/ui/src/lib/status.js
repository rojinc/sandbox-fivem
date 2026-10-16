/** Visibility rules shared by every status presentation (from the Lua contract's options). */
export function isStatusHidden(status, isDead) {
    const o = status.options ?? {};
    const value = Number(status.value);
    const max = o.customMax ? o.customMax : status.max || 100;
    const pct = Number.isFinite(value) ? (value / max) * 100 : 100;
    if (o.hideZero && Number.isFinite(value) && value <= 0) return true;
    if (o.hideHigh && Number.isFinite(value) && pct >= 90) return true;
    if (isDead && !o.visibleWhileDead) return true;
    return false;
}

export function isStatusLow(status) {
    const value = Number(status.value);
    if (!status.flash || !Number.isFinite(value)) return false;
    return status.inverted ? value >= 90 : value <= 10;
}

export function statusPercent(status) {
    const value = Number(status.value);
    const max = status.options?.customMax ? status.options.customMax : status.max || 100;
    if (!Number.isFinite(value)) return 0;
    return Math.max(0, Math.min(100, (value / max) * 100));
}

/** Gear label from the raw dashboard gear: 0 is reverse, 1 is first (or neutral when stopped). */
export function gearLabel(gear, speed, ignition) {
    if (!ignition || gear === null || gear === undefined) return '';
    const g = Number(gear);
    if (g === 0) return speed > 0 ? 'R' : 'N';
    if (g === 1 && speed < 1) return 'N';
    return String(Math.floor(g));
}
