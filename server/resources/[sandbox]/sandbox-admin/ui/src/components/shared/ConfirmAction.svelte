<script>
    import { Button, Modal } from '@sandbox/ui-kit';

    /** Confirmation for a destructive action (explode, delete, stall). */
    let { title, body, confirmLabel, busy = false, onconfirm, onclose } = $props();
</script>

<Modal {title} {onclose} width="520px">
    <p class="body">{body}</p>
    {#snippet actions()}
        <Button variant="danger" loading={busy} onclick={onconfirm}>{confirmLabel}</Button>
        <Button variant="secondary" onclick={onclose} disabled={busy}>Cancel</Button>
    {/snippet}
</Modal>

<style>
    .body {
        margin: 0;
    }
</style>
