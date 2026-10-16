<script>
    import { Modal, Button, PageAlert } from '@sandbox/ui-kit';
    import { faTrashCan } from '@fortawesome/free-solid-svg-icons';
    import { formatSid, fullName, jobLines } from '../../lib/format.js';

    /**
     * Confirmation before `DeleteCharacter`. The copy matches the old UI's
     * warning: deletion is permanent and not reversible by staff.
     */
    let { character, oncancel, onconfirm } = $props();

    const name = $derived(fullName(character));
    const jobs = $derived(jobLines(character?.Jobs));
</script>

<Modal title="Delete {name}?" onclose={oncancel} width="560px">
    <PageAlert type="warning" title="This cannot be undone">
        Deleting removes the character, their money, property and progress for good. Staff cannot restore a deleted character.
    </PageAlert>
    <dl class="au-dl record">
        <dt>Name</dt>
        <dd>{name}</dd>
        <dt>State ID</dt>
        <dd class="au-mono">{formatSid(character?.SID)}</dd>
        <dt>Job</dt>
        <dd>{jobs.length ? jobs.join('; ') : 'Unemployed'}</dd>
    </dl>

    {#snippet actions()}
        <Button variant="secondary" onclick={oncancel}>Keep character</Button>
        <Button variant="danger" icon={faTrashCan} onclick={() => onconfirm?.(character)}>Delete forever</Button>
    {/snippet}
</Modal>

<style>
    .record {
        margin: 0;
        grid-template-columns: 100px 1fr;
    }
</style>
