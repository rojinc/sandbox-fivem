<script>
    import { fly } from 'svelte/transition';
    import { cubicOut } from 'svelte/easing';
    import { onKey } from '@sandbox/ui-kit';
    import { radio } from './state/radio.svelte.js';
    import { close, volume } from './lib/actions.js';
    import Handset from './components/Handset.svelte';

    // Laid out in px for 1920x1080 and zoomed with the viewport (by height too, so ultrawide screens
    // do not get a handset taller than the screen).
    let zoom = $state(1);
    $effect(() => {
        const update = () => (zoom = Math.round(Math.min(window.innerWidth / 1920, window.innerHeight / 1080) * 1000) / 1000);
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    });

    const reduceMotion = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const slide = { x: 48, y: 240, duration: reduceMotion ? 0 : 200, easing: cubicOut };

    // Escape closes through Lua (it drops NUI focus and sends APP_HIDE). Handlers decline when the handset is closed.
    onKey('Escape', () => (radio.open ? close() : false));
    onKey(['ArrowUp', 'ArrowDown'], (e) => (radio.open ? volume(e.key === 'ArrowUp' ? 1 : -1) : false));
</script>

<div class="radio-root">
    {#if radio.open}
        <div class="radio-dock" style:zoom transition:fly={slide}>
            <Handset />
        </div>
    {/if}
</div>
