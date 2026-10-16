<script>
    import { fetchNui, onEscape } from '@sandbox/ui-kit';
    import { radar } from './state/radar.svelte.js';
    import RadarUnit from './components/radar/RadarUnit.svelte';
    import Remote from './components/remote/Remote.svelte';

    // The frame is designed at 1920 wide; zoom keeps it the same apparent size at 1440p and 4K.
    let zoom = $state(1);
    $effect(() => {
        const update = () => {
            zoom = Math.min(2.5, Math.max(0.75, window.innerWidth / 1920));
        };
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    });

    // Escape closes the remote through Lua (which also drops NUI focus). While the remote is
    // closed the key is declined so nothing else loses it.
    onEscape(() => (radar.remoteOpen ? fetchNui('CloseRemote') : false));
</script>

<div class="radar-root" style="zoom:{zoom}">
    <RadarUnit />
    <Remote />
</div>
