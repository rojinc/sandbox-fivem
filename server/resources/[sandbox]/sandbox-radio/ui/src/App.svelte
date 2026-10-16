<script>
    import { fly } from 'svelte/transition';
    import { fetchNui, onKey } from '@sandbox/ui-kit';
    import { radio } from './state/radio.svelte.js';
    import Handset from './components/Handset.svelte';

    // px layout for 1080p, zoomed with the viewport so the handset is not tiny at 1440p / 4K.
    let scale = $state(1);
    $effect(() => {
        const update = () => (scale = Math.max(1, Math.round((window.innerWidth / 1920) * 100) / 100));
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    });

    // Escape closes through Lua (it drops NUI focus and sends APP_HIDE). Handlers decline when the handset is closed.
    onKey('Escape', () => (radio.open ? fetchNui('Close') : false));
    onKey(['ArrowUp', 'ArrowDown'], (e) => {
        if (!radio.open || !radio.power) return false;
        fetchNui(e.key === 'ArrowUp' ? 'VolumeUp' : 'VolumeDown');
        return true;
    });
</script>

<div class="radio-root">
    {#if radio.open}
        <div class="radio-dock" style:zoom={scale} transition:fly={{ y: 16, duration: 200 }}>
            <Handset />
        </div>
    {/if}
</div>
