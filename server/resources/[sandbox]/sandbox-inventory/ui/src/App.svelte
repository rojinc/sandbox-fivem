<script>
    import { onKey } from '@sandbox/ui-kit';
    import InventoryScreen from './components/InventoryScreen.svelte';
    import Hotbar from './components/Hotbar.svelte';
    import ItemAlerts from './components/ItemAlerts.svelte';
    import StaticTooltip from './components/StaticTooltip.svelte';
    import CrashScreen from './components/CrashScreen.svelte';
    import { app, view } from './state/app.svelte.js';
    import { ui } from './state/ui.svelte.js';
    import { cancelHold, closeInventory } from './lib/actions.js';

    /*
     * Laid out in px for 1920x1080. The frame is scaled to the window (a
     * transform, so pointer maths stay simple) and 1440p or 4K keep the
     * 1080p proportions.
     */
    const DESIGN_W = 1920;
    const DESIGN_H = 1080;

    function fit() {
        const s = Math.max(0.5, Math.min(window.innerWidth / DESIGN_W, window.innerHeight / DESIGN_H) || 1);
        view.scale = Math.round(s * 1000) / 1000;
        view.width = Math.round(window.innerWidth / view.scale);
        view.height = Math.round(window.innerHeight / view.scale);
    }

    $effect(() => {
        fit();
        window.addEventListener('resize', fit);
        return () => window.removeEventListener('resize', fit);
    });

    // Escape (and F2, as before) first drops a held item or the shop form, then closes through Lua.
    onKey(['Escape', 'F2'], () => {
        if (!app.visible) return false;
        if (ui.held) {
            cancelHold();
            return true;
        }
        if (ui.addToShop) {
            ui.addToShop = null;
            return true;
        }
        closeInventory();
        return true;
    });

    function crashed(error) {
        console.warn('[inventory] render failed', error);
    }
</script>

<div class="stage">
    <div class="frame" style:width="{view.width}px" style:height="{view.height}px" style:transform="scale({view.scale})">
        <ItemAlerts />
        <Hotbar />
        <StaticTooltip />
        <svelte:boundary onerror={crashed}>
            {#if app.visible}
                <InventoryScreen />
            {/if}
            {#snippet failed(error, reset)}
                <CrashScreen {reset} />
            {/snippet}
        </svelte:boundary>
    </div>
</div>

<style>
    .stage {
        position: fixed;
        inset: 0;
        overflow: hidden;
        pointer-events: none;
    }
    .frame {
        position: absolute;
        top: 0;
        left: 0;
        transform-origin: 0 0;
    }
</style>
