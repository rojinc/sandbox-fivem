<script>
    import { Modal, Button, RichText, fetchNui, onKey } from '@sandbox/ui-kit';
    import { ui } from '../../state/ui.svelte.js';

    /** Yes/No dialog for Confirm:Show (client/confirm.lua). */
    const confirm = $derived(ui.confirm);
    const accept = () => fetchNui('Confirm:Yes', { event: confirm.yes, data: confirm.data });
    const deny = () => fetchNui('Confirm:No', { event: confirm.no, data: confirm.data });

    onKey('Escape', () => (confirm.showing ? deny() : false));
    onKey('Enter', () => (confirm.showing ? accept() : false));
</script>

{#if confirm.showing}
    <div class="hud-ui">
        <Modal title={confirm.title ?? 'Confirm'} onclose={deny} width="440px">
            {#if confirm.description}
                <p class="desc"><RichText text={confirm.description} /></p>
            {/if}
            {#snippet actions()}
                <Button variant="secondary" onclick={deny}>{confirm.denyLabel ?? 'No'}</Button>
                <Button onclick={accept}>{confirm.acceptLabel ?? 'Yes'}</Button>
            {/snippet}
        </Modal>
    </div>
{/if}

<style>
    .desc {
        margin: 0;
        max-width: none;
    }
</style>
