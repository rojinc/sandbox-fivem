<script>
    import { onMount } from 'svelte';
    import { Button, Field, Modal, PageAlert, Select, Tag, Textarea } from '@sandbox/ui-kit';
    import { go, back } from '../../state/app.svelte.js';
    import { toast } from '../../state/toasts.svelte.js';
    import { call, list } from '../../lib/api.js';
    import { FirearmFlagTitles } from '../../lib/data.js';
    import { formatDay } from '../../lib/format.js';
    import State from '../common/State.svelte';

    let { params = {} } = $props();
    let status = $state('loading');
    let f = $state(null);
    let adding = $state(false);
    let busy = $state(false);
    let form = $state({ title: FirearmFlagTitles[0], description: '' });
    let error = $state('');

    async function load() {
        status = 'loading';
        const res = await call('View', { type: 'firearm', id: params.id });
        if (!res || !res.serial) {
            status = res === null ? 'error' : 'missing';
            return;
        }
        f = res;
        status = 'ready';
    }
    onMount(load);

    const flags = $derived(list(f?.flags));

    async function addFlag() {
        if (!form.description.trim()) return (error = 'Describe why the firearm is flagged.');
        busy = true;
        const res = await call('Create', { type: 'firearm-flag', parentId: f.serial, doc: { title: form.title, description: form.description.trim() } });
        busy = false;
        if (res && typeof res === 'object') {
            f.flags = [...flags, { ...res, date: res.date ?? Date.now() }];
            toast.success('Flag added');
            adding = false;
        } else error = 'The flag was not added. Try again.';
    }

    async function removeFlag(flag) {
        const res = await call('Delete', { type: 'firearm-flag', parentId: f.serial, id: flag.id });
        if (res) {
            f.flags = flags.filter((x) => x !== flag);
            toast.success('Flag removed');
        } else toast.error('The flag was not removed. Try again.');
    }
</script>

<div class="mdt-back"><Button variant="tertiary" size="sm" icon="arrow-left" onclick={() => back('firearms')}>Back to firearms</Button></div>

{#if status === 'loading'}
    <State status="loading" title="Opening firearm" />
{:else if status === 'error'}
    <State status="error" onretry={load} />
{:else if status === 'missing'}
    <State title="No firearm with serial {params.id}">It may have been scratched or destroyed.</State>
{:else}
    <div class="mdt-page-head">
        <div>
            <h1>{f.model}</h1>
            <p>Serial number <span class="au-mono">{f.serial}</span></p>
            {#if flags.length}<div class="mdt-tags tags">{#each flags as fl, i (fl.id ?? i)}<Tag tone="error">{fl.title}</Tag>{/each}</div>{/if}
        </div>
        <div class="mdt-page-head__actions"><Button onclick={() => ((form = { title: FirearmFlagTitles[0], description: '' }), (error = ''), (adding = true))}>Flag firearm</Button></div>
    </div>
    <div class="mdt-split">
        <div>
            <section class="mdt-section">
                <h2>Flags</h2>
                {#if flags.length}
                    <table class="au-table au-table--dense mdt-table">
                        <thead><tr><th scope="col">Flag</th><th scope="col">Reason</th><th scope="col">Added by</th><th scope="col">Date</th><th scope="col"><span class="au-hidden">Actions</span></th></tr></thead>
                        <tbody>
                            {#each flags as fl, i (fl.id ?? i)}
                                <tr>
                                    <td><Tag tone="error">{fl.title}</Tag></td>
                                    <td>{fl.description}</td>
                                    <td>{fl.author_callsign ? `${fl.author_callsign} ` : ''}{fl.author_first?.[0] ?? ''}. {fl.author_last ?? ''}</td>
                                    <td class="nowrap">{fl.date ? formatDay(fl.date) : 'Unknown'}</td>
                                    <td class="act">{#if fl.id != null}<Button variant="tertiary" size="sm" onclick={() => removeFlag(fl)}>Remove</Button>{/if}</td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                {:else}
                    <p class="au-muted">No flags on this firearm.</p>
                {/if}
            </section>
        </div>
        <aside>
            <section class="mdt-section">
                <h2>Registration</h2>
                <dl class="au-dl">
                    <dt>Owner</dt>
                    <dd>{#if f.owner_sid}<button type="button" class="mdt-link" onclick={() => go('person', { id: f.owner_sid })}>{f.owner_name ?? `State ID ${f.owner_sid}`}</button>{:else}{f.owner_name ?? 'Unknown'}{/if}</dd>
                    <dt>Purchased</dt>
                    <dd>{f.purchased ? formatDay(f.purchased) : 'Unknown'}</dd>
                </dl>
            </section>
        </aside>
    </div>

    <Modal open={adding} title="Flag firearm" onclose={() => (adding = false)}>
        {#if error}<div class="block"><PageAlert type="error" compact>{error}</PageAlert></div>{/if}
        <Field label="Flag" id="ff-title"><Select id="ff-title" bind:value={form.title} options={FirearmFlagTitles.map((t) => ({ value: t, label: t }))} /></Field>
        <Field label="Reason" id="ff-desc"><Textarea id="ff-desc" rows={3} bind:value={form.description} /></Field>
        {#snippet actions()}
            <Button variant="secondary" onclick={() => (adding = false)}>Cancel</Button>
            <Button loading={busy} onclick={addFlag}>Add flag</Button>
        {/snippet}
    </Modal>
{/if}

<style>
    .tags {
        margin-top: var(--au-s2);
    }
    .nowrap {
        white-space: nowrap;
    }
    .act {
        text-align: right;
    }
    .block {
        margin-bottom: var(--au-s3);
    }
</style>
