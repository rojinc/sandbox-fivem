<script>
    import { Modal, Button, formatMoney } from '@sandbox/ui-kit';
    import { app, price, confirmSave, confirmCancel } from '../state/app.svelte.js';

    /** Save and discard confirmations. Escape or the close button keeps editing. */
    const cost = $derived(price());
    const creator = $derived(app.mode === 'CREATOR');
    const close = () => {
        if (!app.saving) app.dialog = null;
    };
</script>

<Modal open={app.dialog === 'save'} title={creator ? 'Save your character' : cost > 0 ? 'Pay for these changes' : 'Save these changes'} onclose={close} width="480px">
    {#if creator}
        <p>After this, only a surgeon can change your face, heritage and ped model, and they charge for it.</p>
        <p>Check every section before you save.</p>
    {:else if cost > 0}
        <p>You pay {formatMoney(cost)} in cash and your character keeps everything you changed here.</p>
    {:else}
        <p>Your character keeps everything you changed here.</p>
    {/if}
    {#snippet actions()}
        <Button variant="secondary" disabled={app.saving} onclick={close}>Keep editing</Button>
        <Button loading={app.saving} onclick={confirmSave}>{creator ? 'Save character' : cost > 0 ? `Pay ${formatMoney(cost)}` : 'Save changes'}</Button>
    {/snippet}
</Modal>

<Modal open={app.dialog === 'cancel'} title="Discard your changes" onclose={close} width="480px">
    <p>Your character goes back to how it looked when you came in. You are not charged.</p>
    {#snippet actions()}
        <Button variant="secondary" onclick={close}>Keep editing</Button>
        <Button variant="danger" onclick={confirmCancel}>Discard changes</Button>
    {/snippet}
</Modal>
