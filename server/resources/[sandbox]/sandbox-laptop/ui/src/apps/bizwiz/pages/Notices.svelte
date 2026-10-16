<script>
    import { Button, Modal, Breadcrumbs } from '@sandbox/ui-kit';
    import { fetchNui } from '@sandbox/ui-kit/nui';
    import { data, asList } from '../../../state/data.svelte.js';
    import { env } from '../../../state/env.svelte.js';
    import { showAlert } from '../../../state/notify.svelte.js';
    import { hasJobPerm } from '../../../lib/perms.js';
    import { ago, formatDateTime, person } from '../../../lib/format.js';
    import { cleanHtml, summary } from '../../../lib/html.js';

    /** The notice board: notices for everyone on duty (businessNotices), newest first. */
    let { onnav } = $props();

    const notices = $derived(
        asList(data.businessNotices)
            .slice()
            .sort((a, b) => (Number(b.time) || 0) - (Number(a.time) || 0)),
    );
    const canCreate = $derived(hasJobPerm('TABLET_CREATE_NOTICE'));
    const canDelete = $derived(hasJobPerm('TABLET_DELETE_NOTICE'));

    let openId = $state(null);
    const open = $derived(notices.find((n) => n._id == openId) ?? null);
    let deleting = $state(false);
    let busy = $state(false);

    async function remove() {
        busy = true;
        const res = await fetchNui('DeleteBusinessNotice', { id: open._id });
        busy = false;
        deleting = false;
        if (res === true) {
            showAlert('Notice deleted', 'success');
            openId = null;
        } else showAlert('The notice was not deleted. Try again.', 'error');
    }
</script>

{#if open}
    <Breadcrumbs items={[{ label: 'Notice board', onclick: () => (openId = null) }, { label: open.title }]} />
    <div class="section-head">
        <h3 class="heading">{open.title}</h3>
        {#if canDelete}<Button variant="secondary" size="sm" onclick={() => (deleting = true)}>Delete notice</Button>{/if}
    </div>
    <p class="au-muted posted">Posted {formatDateTime(open.time)}{open.author ? ` by ${person(open.author)}` : ''}</p>
    <div class="user-html">{@html cleanHtml(open.description)}</div>
{:else}
    <div class="section-head">
        <h3 class="heading">Notice board</h3>
        {#if canCreate}<Button onclick={() => onnav('Create/Notice')}>Post a notice</Button>{/if}
    </div>
    {#if notices.length}
        <table class="au-table">
            <caption class="au-hidden">Notices, newest first</caption>
            <thead>
                <tr>
                    <th scope="col">Notice</th>
                    <th scope="col">Summary</th>
                    <th scope="col">Posted</th>
                </tr>
            </thead>
            <tbody>
                {#each notices as n (n._id ?? n.time)}
                    <tr>
                        <td class="col-title"><button type="button" class="row-link" onclick={() => (openId = n._id)}>{n.title}</button></td>
                        <td class="au-muted">{summary(n.description, 90)}</td>
                        <td class="col-when">{ago(n.time, env.now)}</td>
                    </tr>
                {/each}
            </tbody>
        </table>
    {:else}
        <div class="state">
            <strong>No notices</strong>
            <p>Notices tell everyone on duty about shifts, prices and rules.{canCreate ? ' Post the first one.' : ''}</p>
        </div>
    {/if}
{/if}

{#if deleting && open}
    <Modal title="Delete this notice?" onclose={() => (deleting = false)} width="460px">
        <p class="modal-text">"{open.title}" disappears for everyone on duty. This cannot be undone.</p>
        {#snippet actions()}
            <Button variant="secondary" onclick={() => (deleting = false)}>Keep notice</Button>
            <Button variant="danger" loading={busy} onclick={remove}>Delete notice</Button>
        {/snippet}
    </Modal>
{/if}

<style>
    .posted {
        margin: 0 0 var(--au-s5);
    }
    .col-title {
        width: 30%;
    }
    .col-when {
        white-space: nowrap;
    }
    .modal-text {
        margin: 0;
    }
</style>
