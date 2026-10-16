<script>
    import { onEscape } from '@sandbox/ui-kit';
    import { app, closeApp } from './state/app.svelte.js';
    import BankScreen from './components/bank/BankScreen.svelte';
    import AtmScreen from './components/atm/AtmScreen.svelte';

    /**
     * Both frames are laid out in px for 1920x1080. Larger screens zoom the
     * frame by the same ratio so 1440p and 4K keep the 1080p proportions.
     */
    let zoom = $state(1);
    $effect(() => {
        const fit = () => {
            const ratio = Math.min(window.innerWidth / 1920, window.innerHeight / 1080) || 1;
            zoom = Math.max(1, Math.round(ratio * 100) / 100);
        };
        fit();
        window.addEventListener('resize', fit);
        return () => window.removeEventListener('resize', fit);
    });

    // Escape closes through Lua (the Close callback drops focus) unless a dialog
    // is open: the Modal's own Escape handler closes it first and this declines the key.
    onEscape(() => {
        if (!app.visible) return false;
        if (document.querySelector('.au-modal')) return false;
        closeApp();
        return true;
    });
</script>

{#if app.visible}
    <div class="stage">
        <div class="frame" class:frame--atm={app.mode === 'ATM'} style:zoom>
            {#if app.mode === 'ATM'}
                <AtmScreen />
            {:else}
                <BankScreen />
            {/if}
        </div>
    </div>
{/if}
