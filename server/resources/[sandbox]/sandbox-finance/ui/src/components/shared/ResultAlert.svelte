<script>
    import { PageAlert } from '@sandbox/ui-kit';

    /** Page-level outcome of the last action: { type: info|success|warning|error, title, message }. */
    let { alert = null, onclose, compact = false } = $props();

    let el = $state(null);
    $effect(() => {
        if (alert && el) el.scrollIntoView({ block: 'nearest' });
    });
</script>

{#if alert}
    <div bind:this={el}>
        <PageAlert type={alert.type} title={alert.title} {compact} {onclose}>{alert.message}</PageAlert>
    </div>
{/if}
