<script>
    import NotAvailable from './NotAvailable.svelte';

    /** Interwebz, Files, SupplyMate and Terminal: never built (or empty) in the old laptop. */
    let { app } = $props();
</script>

<NotAvailable name={app?.label ?? 'This app'} />
