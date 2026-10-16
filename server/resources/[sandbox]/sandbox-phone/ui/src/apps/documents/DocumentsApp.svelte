<script>
    import { Button, EmptyState, Tag } from '@sandbox/ui-kit';
    import AppPage from '../../components/common/AppPage.svelte';
    import DocumentView from './DocumentView.svelte';
    import DocumentForm from './DocumentForm.svelte';
    import { data } from '../../state/data.svelte.js';
    import { openApp } from '../../state/router.svelte.js';
    import { clock } from '../../state/clock.svelte.js';
    import { when, toMs, plain } from '../../lib/format.js';

    /** Documents: your list (root), one document (view/:id), new, edit/:id. */
    let { app, segs = [] } = $props();

    const docs = $derived((Array.isArray(data.myDocuments) ? data.myDocuments : Object.values(data.myDocuments ?? {})).filter(Boolean));
    const sorted = $derived(docs.slice().sort((a, b) => toMs(b.time) - toMs(a.time)));
    const find = (id) => docs.find((d) => String(d.id) === String(id)) ?? null;
    const sid = $derived(data.player?.SID);
</script>

{#if segs[0] === 'view'}
    {#key segs[1]}<DocumentView doc={find(segs[1])} />{/key}
{:else if segs[0] === 'new'}
    <DocumentForm />
{:else if segs[0] === 'edit'}
    <DocumentForm doc={find(segs[1])} />
{:else}
    <AppPage title={app?.label ?? 'Documents'}>
        {#snippet actions()}
            <Button size="sm" variant="secondary" onclick={() => openApp('documents', 'new')}>New document</Button>
        {/snippet}
        {#if sorted.length}
            <ul class="ph-list">
                {#each sorted as d (d.id)}
                    <li>
                        <button type="button" class="ph-row" onclick={() => openApp('documents', `view/${d.id}`)}>
                            <span class="ph-row__main">
                                <span class="ph-row__title">{plain(d.title) || 'Untitled document'}</span>
                                <span class="ph-row__sub">{String(d.sid) === String(sid) ? 'Yours' : `Shared by ${plain(d.sharer_name) || 'someone'}`}</span>
                                {#if d.signature_required && !d.signed}<span class="tag"><Tag tone="warning">Needs your signature</Tag></span>{/if}
                            </span>
                            <span class="ph-row__side">{when(d.time, clock.now)}</span>
                        </button>
                    </li>
                {/each}
            </ul>
        {:else}
            <EmptyState title="No documents yet">
                Write contracts, receipts and notes here, then share them or ask people to sign.
                {#snippet actions()}
                    <Button onclick={() => openApp('documents', 'new')}>Write a document</Button>
                {/snippet}
            </EmptyState>
        {/if}
    </AppPage>
{/if}

<style>
    .tag {
        display: block;
        margin-top: var(--au-s1);
    }
</style>
