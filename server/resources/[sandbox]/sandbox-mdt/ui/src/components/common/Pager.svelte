<script>
    import { Button } from '@sandbox/ui-kit';

    /** Previous / next for server-paged searches (the server only knows whether a next page exists). */
    let { page = 1, pages = 1, onpage } = $props();
</script>

{#if page > 1 || pages > page}
    <nav class="mdt-pager" aria-label="Pages">
        <Button variant="secondary" size="sm" icon="chevron-left" disabled={page <= 1} onclick={() => onpage?.(page - 1)}>Previous page</Button>
        <span>Page {page}</span>
        <Button variant="secondary" size="sm" iconRight="chevron-right" disabled={pages <= page} onclick={() => onpage?.(page + 1)}>Next page</Button>
    </nav>
{/if}
