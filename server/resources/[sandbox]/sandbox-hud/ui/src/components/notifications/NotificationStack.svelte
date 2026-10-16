<script>
    import { fly, fade } from 'svelte/transition';
    import { Toast } from '@sandbox/ui-kit';
    import { ui } from '../../state/ui.svelte.js';

    /** Top-right stack: persistent notifications first, newest on top within each group. */
    const ordered = $derived([
        ...ui.notifications.filter((n) => !(n.duration > 0)).sort((a, b) => b.created - a.created),
        ...ui.notifications.filter((n) => n.duration > 0).sort((a, b) => b.created - a.created),
    ]);

    const TYPES = { success: 'success', warning: 'warning', error: 'error', info: 'info' };

    function remove(id) {
        ui.notifications = ui.notifications.filter((n) => n._id !== id);
    }

    // Timed notifications remove themselves; HIDE_ALERT marks one hidden.
    $effect(() => {
        const timers = [];
        for (const n of ui.notifications) {
            if (n.hide) {
                remove(n._id);
                continue;
            }
            if (n.duration > 0) {
                const left = n.created + n.duration - Date.now();
                timers.push(setTimeout(() => remove(n._id), Math.max(0, left)));
            }
        }
        return () => timers.forEach(clearTimeout);
    });
</script>

{#if ordered.length}
    <div class="stack">
        {#each ordered as n (n._id)}
            <div in:fly={{ x: 24, duration: 220 }} out:fade={{ duration: 180 }}>
                <Toast type={TYPES[n.type] ?? 'neutral'} message={n.message} icon={n.icon} pinned={!(n.duration > 0)} />
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
