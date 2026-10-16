<script>
    import { untrack } from 'svelte';
    import { Button, Modal } from '@sandbox/ui-kit';
    import { go } from '../../state/app.svelte.js';
    import { store, removeData } from '../../state/data.svelte.js';
    import { toast } from '../../state/toasts.svelte.js';
    import { call, list } from '../../lib/api.js';
    import { boloType } from '../../lib/data.js';
    import { formatDateTime, personName, relative } from '../../lib/format.js';
    import State from '../common/State.svelte';

    let { params = {} } = $props();

    const bolos = $derived(list(store.bolos).slice().sort((a, b) => (b.time ?? 0) - (a.time ?? 0)));
    let selectedId = $state(untrack(() => params.id ?? null));
    const selected = $derived(bolos.find((b) => b.id == selectedId) ?? bolos[0] ?? null);
    let confirm = $state(false);
    let busy = $state(false);

    async function dismiss() {
        busy = true;
        const res = await call('Delete', { type: 'BOLO', id: selected.id });
        busy = false;
        if (res) {
            removeData('bolos', selected.id);
            selectedId = null;
            confirm = false;
            toast.success('BOLO dismissed');
        } else toast.error('The BOLO was not dismissed. Try again.');
    }
</script>

<div class="mdt-page-head">
    <div>
        <h1>Be on the lookout</h1>
        <p>Active BOLOs for every officer on duty. They clear when the server restarts.</p>
    </div>
    <div class="mdt-page-head__actions"><Button onclick={() => go('bolo-new')}>Issue a BOLO</Button></div>
</div>

{#if !bolos.length}
    <State title="No BOLOs are active" actionLabel="Issue a BOLO" onaction={() => go('bolo-new')}>Issue one when officers need to watch for a person or vehicle.</State>
{:else}
    <div class="mdt-split">
        <table class="au-table au-table--hover au-table--dense mdt-table">
            <thead><tr><th scope="col">For</th><th scope="col">BOLO</th><th scope="col">Issued</th></tr></thead>
            <tbody>
                {#each bolos as b (b.id)}
                    <tr class="is-clickable" class:is-selected={selected?.id === b.id} tabindex="0" onclick={() => (selectedId = b.id)} onkeydown={(e) => e.key === 'Enter' && (selectedId = b.id)}>
                        <td>{boloType(b.type)}</td>
                        <td><strong>{b.title}</strong><div class="au-muted">{b.summary}</div></td>
                        <td class="nowrap">{relative(b.time)}</td>
                    </tr>
                {/each}
            </tbody>
        </table>
        {#if selected}
            <aside>
                <section class="mdt-section">
                    <h2>{selected.title}</h2>
                    <dl class="au-dl">
                        <dt>Looking for</dt>
                        <dd>{boloType(selected.type)}</dd>
                        <dt>Issued by</dt>
                        <dd>{selected.author ? personName(selected.author, { callsign: true }) : 'Unknown'}</dd>
                        <dt>Issued</dt>
                        <dd>{formatDateTime(selected.time)}</dd>
                        <dt>Summary</dt>
                        <dd>{selected.summary}</dd>
                        <dt>Description</dt>
                        <dd class="pre">{selected.description || 'None given'}</dd>
                    </dl>
                    <Button variant="danger" size="sm" onclick={() => (confirm = true)}>Dismiss BOLO</Button>
                </section>
            </aside>
        {/if}
    </div>
{/if}

<Modal open={confirm} title="Dismiss this BOLO" onclose={() => (confirm = false)}>
    <p>Officers stop seeing "{selected?.title}". Do this once the person or vehicle is found.</p>
    {#snippet actions()}
        <Button variant="secondary" onclick={() => (confirm = false)}>Cancel</Button>
        <Button variant="danger" loading={busy} onclick={dismiss}>Dismiss BOLO</Button>
    {/snippet}
</Modal>

<style>
    .nowrap {
        white-space: nowrap;
    }
    .pre {
        white-space: pre-wrap;
    }
</style>
