/**
 * Geometry of assets/radio_frame.webp (276 x 572 RGBA), measured from the image itself:
 * the screen is the fully transparent cut-out (alpha flood fill from its centre), the knobs
 * are the opaque silhouettes above the body, the power key is the inner pill of the bottom
 * rocker. Values are image pixels; SCALE turns them into 1080p CSS px (App.svelte then zooms
 * the whole dock with the viewport).
 */
export const SCALE = 1.25;

export const FRAME = { w: 276, h: 572 };

export const PARTS = {
    // transparent cut-out under the "WETROLLA" strip (soft 4px inner edge left and right)
    screen: { x: 60, y: 248, w: 156, h: 255 },
    // tall centre knob: speaker volume (VolumeUp / VolumeDown)
    volumeKnob: { x: 120, y: 120, w: 36, h: 58 },
    // short left knob: click sound volume (ClickVolumeUp / ClickVolumeDown)
    clickKnob: { x: 51, y: 138, w: 41, h: 40 },
    // pill with the power glyph in the bottom rocker
    powerKey: { x: 110, y: 536, w: 56, h: 24 },
};

const px = (n) => `${Math.round(n * SCALE * 100) / 100}px`;

/** Inline style that places an element over a part of the frame image. */
export function place({ x, y, w, h }) {
    return `left:${px(x)};top:${px(y)};width:${px(w)};height:${px(h)}`;
}

export const frameSize = `width:${px(FRAME.w)};height:${px(FRAME.h)};--frame-w:${px(FRAME.w)};--frame-h:${px(FRAME.h)}`;

/** Left or right half of a part (the knobs turn down on the left half, up on the right). */
export function half({ x, y, w, h }, side) {
    return { x: side > 0 ? x + w / 2 : x, y, w: w / 2, h };
}

/**
 * place() plus the offset that lines the frame image up under the element, so a highlight
 * masked with the image's alpha lights only the metal of a knob, never the world behind it.
 */
export function placeMasked(rect) {
    return `${place(rect)};--mask-x:${px(-rect.x)};--mask-y:${px(-rect.y)}`;
}
