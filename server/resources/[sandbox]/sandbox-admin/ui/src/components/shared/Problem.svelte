<script>
    import { PageAlert, Button } from '@sandbox/ui-kit';

    /** A failed load: what happened, and the action that fixes it. */
    let { title, retry, retryLabel = 'Try again', children } = $props();
</script>

<PageAlert type="error" {title}>
    {@render children?.()}
    {#if retry}
        <div class="retry"><Button variant="secondary" size="sm" onclick={retry}>{retryLabel}</Button></div>
    {/if}
</PageAlert>

<style>
    .retry {
        margin-top: var(--au-s3);
    }
</style>
