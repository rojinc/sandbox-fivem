<script>
    import { Modal, Button, PageAlert } from '@sandbox/ui-kit';
    import { formatCash, formatSid, fullName, jobLines } from '../../lib/format.js';

    /**
     * Confirmation before `DeleteCharacter`. Deletion is permanent and staff
     * cannot reverse it, so the record is shown again before the button.
     */
    let { character, oncancel, onconfirm } = $props();

    const name = $derived(fullName(character));
    const jobs = $derived(jobLines(character?.Jobs));
</script>

<Modal title="Delete {name}" onclose={oncancel} width="560px">
    <PageAlert type="warning" title="You cannot undo this">
        You lose this character's money, property and progress. Staff cannot restore a deleted character.
    </PageAlert>
    <dl class="au-dl record">
        <dt>Name</dt>
        <dd>{name}</dd>
        <dt>State ID</dt>
        <dd class="au-mono">{formatSid(character?.SID)}</dd>
        <dt>Job</dt>
        <dd>{jobs.length ? jobs.join('; ') : 'Unemployed'}</dd>
        <dt>Cash</dt>
        <dd class="au-mono">{formatCash(character?.Cash)}</dd>
    </dl>

    {#snippet actions()}
        <Button variant="danger" onclick={() => onconfirm?.(character)}>Delete character</Button>
        <Button variant="secondary" onclick={oncancel}>Keep character</Button>
    {/snippet}
</Modal>

<style>
    .record {
        margin: 0;
        grid-template-columns: 100px 1fr;
    }
</style>
