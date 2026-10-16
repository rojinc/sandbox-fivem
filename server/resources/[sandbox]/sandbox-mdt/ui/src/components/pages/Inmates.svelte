<script>
    import { onMount } from 'svelte';
    import { Button, Field, Modal, PageAlert, Tag, TextInput } from '@sandbox/ui-kit';
    import { go, hasPerm } from '../../state/app.svelte.js';
    import { toast } from '../../state/toasts.svelte.js';
    import { call, list } from '../../lib/api.js';
    import { formatDateTime, months, relative } from '../../lib/format.js';
    import State from '../common/State.svelte';

    /** People serving a sentence at Bolingbroke. */
    let status = $state('loading');
    let prisoners = $state([]);
    let reducing = $state(null);
    let amount = $state('1');
    let error = $state('');
    let busy = $state(false);
    const canReduce = $derived(hasPerm('DOC_REDUCTION'));

    async function load() {
        status = 'loading';
        const res = await call('DOCGetPrisoners', {});
        if (res === null || res === false) {
            status = 'error';
            return;
        }
        prisoners = list(res).sort((a, b) => (a.Jailed?.Release ?? 0) - (b.Jailed?.Release ?? 0));
        status = 'ready';
    }
    onMount(load);

    async function reduce() {
        const n = parseInt(amount, 10);
        if (!n || n < 1 || n > (Number(reducing.Jailed?.Duration) || 999)) return (error = 'Enter a number of months, 1 or more, no longer than the sentence.');
        busy = true;
        const res = await call('DOCReduceSentence', { SID: reducing.SID, reduction: n });
        busy = false;
        if (res) {
            toast.success(`Sentence reduced by ${months(n)}`);
            reducing = null;
            load();
        } else error = 'The sentence was not reduced. The inmate must be in the city to reduce it.';
    }
</script>

<div class="mdt-page-head">
    <div>
        <h1>Inmates</h1>
        <p>Everyone serving a sentence, next release first.</p>
    </div>
</div>

{#if status === 'loading'}
    <State status="loading" title="Loading inmates" />
{:else if status === 'error'}
    <State status="error" onretry={load} />
{:else if !prisoners.length}
    <State title="Nobody is serving a sentence">Inmates appear here when they are sent to Bolingbroke.</State>
{:else}
    <table class="au-table au-table--dense mdt-table">
        <thead><tr><th scope="col">State ID</th><th scope="col">Name</th><th scope="col" class="mdt-num">Sentence</th><th scope="col">Release</th><th scope="col"><span class="au-hidden">Actions</span></th></tr></thead>
        <tbody>
            {#each prisoners as p (p.SID)}
                <tr>
                    <td class="au-mono">{p.SID}</td>
                    <td><button type="button" class="mdt-link" onclick={() => go('person', { id: p.SID })}>{p.First} {p.Last}</button>{#if p.Jailed?.Reduced}<span class="tag"><Tag>Reduced</Tag></span>{/if}</td>
                    <td class="mdt-num">{months(p.Jailed?.Duration ?? 0)}</td>
                    <td>{p.Jailed?.Release ? `${relative(p.Jailed.Release)}, ${formatDateTime(p.Jailed.Release)}` : 'Unknown'}</td>
                    <td class="act">{#if canReduce}<Button variant="tertiary" size="sm" onclick={() => ((reducing = p), (amount = '1'), (error = ''))}>Reduce sentence</Button>{/if}</td>
                </tr>
            {/each}
        </tbody>
    </table>
{/if}

<Modal open={Boolean(reducing)} title="Reduce the sentence of {reducing?.First ?? ''} {reducing?.Last ?? ''}" onclose={() => (reducing = null)}>
    {#if error}<div class="block"><PageAlert type="error" compact>{error}</PageAlert></div>{/if}
    <Field label="Months to take off" id="red-n"><TextInput id="red-n" type="number" min="1" bind:value={amount} width="120px" block={false} /></Field>
    {#snippet actions()}
        <Button variant="secondary" onclick={() => (reducing = null)}>Cancel</Button>
        <Button loading={busy} onclick={reduce}>Reduce sentence</Button>
    {/snippet}
</Modal>

<style>
    .tag {
        margin-left: var(--au-s2);
    }
    .act {
        text-align: right;
        white-space: nowrap;
    }
    .block {
        margin-bottom: var(--au-s3);
    }
</style>
