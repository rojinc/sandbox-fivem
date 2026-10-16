<script>
    import { Kbd } from '@sandbox/ui-kit';

    /** Key caps with labels: hints = [{ key: 'Num *', label: 'Lock' }]. Defaults from client.lua; players can rebind. */
    let { hints = [] } = $props();
</script>

<span class="hints">
    {#each hints as h (h.key + h.label)}
        <span class="hint"><Kbd>{h.key}</Kbd> {h.label}</span>
    {/each}
</span>

<style>
    .hints {
        display: inline-flex;
        align-items: center;
        gap: 12px;
        white-space: nowrap;
    }
    .hint {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 14px;
    }
</style>
