/**
 * settings.location -> where the unit docks on the 1920x1080 reference frame
 * (the app root is zoomed to the real viewport). 1..7 keep the meaning of the
 * original unit (1 BR, 2 R, 3 TR, 4 TOP, 5 TL, 6 L, 7 BL); 8 and 9 fill the
 * 3x3 grid that client/settings.lua now accepts (1..9).
 *
 * `origin` is the transform-origin for settings.scale so the unit grows away
 * from the edge it is anchored to.
 */
export const POSITIONS = {
    1: { label: 'Bottom right', style: 'right:20px;bottom:20px', origin: 'right bottom' },
    2: { label: 'Right', style: 'right:20px;top:50%;transform:translateY(-50%)', origin: 'right center' },
    3: { label: 'Top right', style: 'right:20px;top:20px', origin: 'right top' },
    4: { label: 'Top centre', style: 'top:20px;left:50%;transform:translateX(-50%)', origin: 'center top' },
    5: { label: 'Top left', style: 'left:20px;top:20px', origin: 'left top' },
    6: { label: 'Left', style: 'left:20px;top:50%;transform:translateY(-50%)', origin: 'left center' },
    // Bottom left sits above the minimap and status bars drawn by sandbox-hud.
    7: { label: 'Bottom left', style: 'left:20px;bottom:25%', origin: 'left bottom' },
    8: { label: 'Bottom centre', style: 'left:50%;bottom:20px;transform:translateX(-50%)', origin: 'center bottom' },
    9: { label: 'Centre', style: 'left:50%;top:50%;transform:translate(-50%,-50%)', origin: 'center center' },
};

export const DEFAULT_POSITION = 1;

/** Reading order for the remote's position list: a 3x3 grid, top row first. */
export const POSITION_ORDER = [5, 4, 3, 6, 9, 2, 7, 8, 1];
