<script>
    import { Button } from '@sandbox/ui-kit';

    /** One action: the button, then what it does. */
    let { label, hint, variant = 'secondary', busy = false, disabled = false, onclick } = $props();
</script>

<li class="action-row">
    <Button {variant} size="sm" loading={busy} {disabled} {onclick}>{label}</Button>
    {#if hint}<span class="hint">{hint}</span>{/if}
</li>

<style>
    .action-row {
        display: grid;
        grid-template-columns: 200px minmax(0, 1fr);
        align-items: center;
        gap: var(--au-s4);
        padding: var(--au-s2) 0;
        border-bottom: 1px solid var(--au-border);
    }
    .action-row :global(.au-btn) {
        justify-content: flex-start;
        width: 100%;
    }
    .hint {
        color: var(--au-muted);
        font-size: var(--au-fs-xs);
    }
</style>
