<script>
    import { onEscape } from '@sandbox/ui-kit';
    import { app, closeApp } from './state/app.svelte.js';
    import BankScreen from './components/bank/BankScreen.svelte';
    import AtmScreen from './components/atm/AtmScreen.svelte';

    /** The frame is designed at 1920 wide; larger screens zoom it so it never looks tiny. */
    let scale = $state(1);
    $effect(() => {
        const update = () => {
            scale = Math.max(1, Math.round((window.innerWidth / 1920) * 100) / 100);
        };
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    });

    // Escape closes through Lua (the Close callback drops focus) unless a dialog
    // is open: the Modal's own Escape handler closes it first and the app declines the key.
    onEscape(() => {
        if (!app.visible) return false;
        if (document.querySelector('.au-modal')) return false;
        closeApp();
        return true;
    });
</script>

{#if app.visible}
    <div class="stage">
        <div class="frame" class:frame--atm={app.mode === 'ATM'} style:zoom={scale}>
            {#if app.mode === 'ATM'}
                <AtmScreen />
            {:else}
                <BankScreen />
            {/if}
        </div>
    </div>
{/if}
