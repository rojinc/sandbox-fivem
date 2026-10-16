<script>
    import { fly, fade } from 'svelte/transition';
    import { ui } from '../../state/ui.svelte.js';
    import Toast from './Toast.svelte';

    /** Top-right stack: persistent notifications first, newest on top within each group. */
    const ordered = $derived([
        ...ui.notifications.filter((n) => !(n.duration > 0)).sort((a, b) => b.created - a.created),
        ...ui.notifications.filter((n) => n.duration > 0).sort((a, b) => b.created - a.created),
    ]);
</script>

{#if ordered.length}
    <div class="stack">
        {#each ordered as n (n._id)}
            <div in:fly={{ x: 24, duration: 220 }} out:fade={{ duration: 180 }}>
                <Toast notification={n} />
            </div>
        {/each}
    </div>
{/if}

<style>
    .stack {
        position: absolute;
        top: 16px;
        right: 16px;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
</style>
