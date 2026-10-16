import beepUrl from '../assets/sounds/beep.mp3';
import positiveUrl from '../assets/sounds/positive.mp3';
import negativeUrl from '../assets/sounds/negative.mp3';
import confirmUrl from '../assets/sounds/confirm.mp3';
import backUrl from '../assets/sounds/back.mp3';
import tickUrl from '../assets/sounds/ticking.ogg';

const BANK = {
    beep: [beepUrl, 0.25],
    positive: [positiveUrl, 0.15],
    negative: [negativeUrl, 0.25],
    confirm: [confirmUrl, 0.25],
    back: [backUrl, 0.25],
};

function safePlay(audio) {
    try {
        const p = audio.play();
        if (p && typeof p.catch === 'function') p.catch(() => {});
    } catch {
        /* autoplay policy or no audio device */
    }
}

/** Fire-and-forget effect: 'beep' | 'positive' | 'negative' | 'confirm' | 'back'. */
export function play(name = 'beep') {
    if (typeof Audio === 'undefined') return;
    const [url, volume] = BANK[name] ?? BANK.beep;
    try {
        const a = new Audio(url);
        a.volume = volume;
        safePlay(a);
    } catch {
        /* ignore */
    }
}

let tick = null;

/** Looping clock while the player types an answer. */
export function startTick() {
    stopTick();
    if (typeof Audio === 'undefined') return;
    try {
        tick = new Audio(tickUrl);
        tick.loop = true;
        tick.volume = 0.25;
        safePlay(tick);
    } catch {
        tick = null;
    }
}

export function stopTick() {
    if (!tick) return;
    try {
        tick.pause();
        tick.currentTime = 0;
    } catch {
        /* ignore */
    }
    tick = null;
}
