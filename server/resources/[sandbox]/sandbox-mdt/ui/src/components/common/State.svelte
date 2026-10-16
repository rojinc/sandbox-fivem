<script>
    import { PageAlert, Spinner, Button } from '@sandbox/ui-kit';

    /**
     * Loading, empty and error states for a list or record.
     * status: loading | empty | error. `title` + children explain; `onretry` offers a retry on errors.
     */
    let { status = 'empty', title, onretry, actionLabel, onaction, children } = $props();
</script>

{#if status === 'loading'}
    <div class="loading" role="status"><Spinner size={20} />{title ?? 'Loading'}</div>
{:else if status === 'error'}
    <PageAlert type="error" title={title ?? 'The terminal could not reach the records server'}>
        {#if children}{@render children()}{:else}Wait a moment and try again. If it keeps failing, close and reopen the terminal.{/if}
        {#if onretry}<div class="retry"><Button variant="secondary" size="sm" onclick={onretry}>Try again</Button></div>{/if}
    </PageAlert>
{:else}
    <div class="mdt-empty">
        {#if title}<strong>{title}</strong>{/if}
        {#if children}<div>{@render children()}</div>{/if}
        {#if onaction}<div class="retry"><Button variant="secondary" size="sm" onclick={onaction}>{actionLabel}</Button></div>{/if}
    </div>
{/if}

<style>
    .loading {
        display: flex;
        align-items: center;
        gap: var(--au-s3);
        padding: var(--au-s6) 0;
        color: var(--au-muted);
    }
    .retry {
        margin-top: var(--au-s3);
    }
</style>
