<script>
    import { Button } from '@sandbox/ui-kit';
    import { fetchNui } from '@sandbox/ui-kit/nui';
    import Sheet from '../common/Sheet.svelte';
    import { share } from '../../state/misc.svelte.js';
    import { showAlert } from '../../state/notify.svelte.js';
    import { plain } from '../../lib/format.js';

    /** A contact or document someone shared with you: save it or decline it. */
    let saving = $state(false);
    const s = $derived(share.sharing);
    const isDoc = $derived(s?.type === 'documents');
    const title = $derived(isDoc ? (s?.data?.isCopy ? 'Copy of a document shared with you' : 'Document shared with you') : 'Contact shared with you');

    async function save() {
        if (!s || saving) return;
        saving = true;
        try {
            const res = await fetchNui('SaveShare', s);
            if (res) {
                showAlert(isDoc ? 'Document saved' : 'Contact saved', 'success');
                share.sharing = null;
                share.open = false;
            } else {
                showAlert('That could not be saved. Ask them to share it again.', 'error');
                share.open = false;
            }
        } catch {
            showAlert('That could not be saved. Ask them to share it again.', 'error');
            share.open = false;
        }
        saving = false;
    }
    function decline() {
        share.sharing = null;
        share.open = false;
        showAlert('Share declined');
    }
</script>

<Sheet open={share.open && Boolean(s)} {title} onclose={() => (share.open = false)}>
    {#if s}
        <dl class="ph-facts qs">
            {#if isDoc}
                <div><dt>Title</dt><dd>{plain(s.data?.document?.title) || 'Untitled document'}</dd></div>
            {:else}
                <div><dt>Name</dt><dd>{plain(s.data?.name) || 'No name'}</dd></div>
                <div><dt>Number</dt><dd class="au-mono">{s.data?.number}</dd></div>
            {/if}
        </dl>
    {/if}
    {#snippet actions()}
        <Button loading={saving} onclick={save}>{isDoc ? 'Save document' : 'Save contact'}</Button>
        <Button variant="secondary" onclick={decline}>Decline</Button>
    {/snippet}
</Sheet>

<style>
    .qs > div {
        padding-inline: 0;
    }
</style>
