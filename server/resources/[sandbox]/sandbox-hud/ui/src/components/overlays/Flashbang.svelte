<script>
    import { ui } from '../../state/ui.svelte.js';

    /** White-out for SET_FLASHBANGED { duration, strength } that clears itself afterwards. */
    let visible = $state(false);

    $effect(() => {
        const flash = ui.flashbang;
        if (!flash) {
            visible = false;
            return undefined;
        }
        visible = true;
        const t = setTimeout(() => (visible = false), flash.duration);
        return () => clearTimeout(t);
    });
</script>

{#if ui.flashbang}
    <div
        class="flash"
        style="opacity:{visible ? Math.max(0, Math.min(1, ui.flashbang.strength)) : 0};transition:{visible ? 'opacity 60ms linear' : 'opacity 900ms ease-out'}"
        ontransitionend={() => {
            if (!visible) ui.flashbang = null;
        }}
    ></div>
{/if}

<style>
    .flash {
        position: absolute;
        inset: 0;
        background: #fff;
    }
</style>
