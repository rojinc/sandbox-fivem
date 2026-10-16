/** The drag sound the old UI played on every move (volume 0.25), silenced by the `muted` setting. */
import dragUrl from '../assets/drag.mp3';

let audio = null;

export function playDrag(muted) {
    if (muted || typeof Audio === 'undefined') return;
    try {
        audio ??= new Audio(dragUrl);
        audio.volume = 0.25;
        audio.currentTime = 0;
        const p = audio.play();
        if (p && typeof p.catch === 'function') p.catch(() => {});
    } catch {
        /* no audio device: stay silent */
    }
}
