<script>
    import { Button, Modal, Select, Tag, TextInput, uid } from '@sandbox/ui-kit';
    import { store } from '../../state/data.svelte.js';
    import { list } from '../../lib/api.js';
    import { ChargeTypes, chargeType } from '../../lib/data.js';
    import { resolveCharges, chargeTotals, sortCharges } from '../../lib/charges.js';
    import { formatMoney, months, plural } from '../../lib/format.js';

    /**
     * Choose charges for one suspect. `selected` is [{ id, count }];
     * onsave(next) receives the new list. Totals use the old terminal's maths.
     */
    let { open = false, title = 'Choose charges', selected = [], onsave, onclose } = $props();

    let picked = $state([]);
    let filter = $state('');
    let cls = $state('');
    const fid = uid('charge-filter');

    $effect.pre(() => {
        if (open) picked = list(selected).map((c) => ({ id: c.id, count: Number(c.count) || 1 }));
    });

    const all = $derived(sortCharges(list(store.charges).filter((c) => c.active !== false)));
    const shown = $derived(
        all.filter((c) => (!cls || String(c.type) === String(cls)) && (!filter.trim() || String(c.title).toLowerCase().includes(filter.trim().toLowerCase()))),
    );
    const totals = $derived(chargeTotals(resolveCharges(picked)));
    const countOf = (id) => picked.find((p) => p.id == id)?.count ?? 0;

    function add(id) {
        const p = picked.find((x) => x.id == id);
        if (p) p.count += 1;
        else picked.push({ id, count: 1 });
    }

    function remove(id) {
        const p = picked.find((x) => x.id == id);
        if (!p) return;
        if (p.count > 1) p.count -= 1;
        else picked = picked.filter((x) => x.id != id);
    }
</script>

<Modal {open} {title} width="980px" {onclose}>
    <p class="totals" aria-live="polite">
        {#if picked.length}
            <strong>{plural(picked.reduce((a, p) => a + p.count, 0), 'charge')}</strong>: {months(totals.months)} in jail, {formatMoney(totals.fine)} fine, {plural(totals.points, 'licence point')}
        {:else}
            No charges chosen yet.
        {/if}
    </p>
    <div class="filters">
        <div class="f-term">
            <label for={fid}>Find a charge</label>
            <TextInput id={fid} bind:value={filter} placeholder="For example evading" autocomplete="off" />
        </div>
        <div class="f-class">
            <label for="{fid}-class">Class</label>
            <Select id="{fid}-class" bind:value={cls} options={[{ value: '', label: 'All classes' }, ...ChargeTypes.map((t) => ({ value: String(t.value), label: t.label }))]} />
        </div>
    </div>
    <div class="scroll">
        <table class="au-table au-table--dense mdt-table">
            <thead>
                <tr>
                    <th scope="col">Charge</th>
                    <th scope="col">Class</th>
                    <th scope="col" class="mdt-num">Jail</th>
                    <th scope="col" class="mdt-num">Fine</th>
                    <th scope="col" class="mdt-num">Points</th>
                    <th scope="col" class="mdt-num">Count</th>
                    <th scope="col"><span class="au-hidden">Actions</span></th>
                </tr>
            </thead>
            <tbody>
                {#each shown as c (c.id)}
                    {@const n = countOf(c.id)}
                    <tr class:is-selected={n > 0}>
                        <td>{c.title}</td>
                        <td><Tag tone={chargeType(c.type).tone}>{chargeType(c.type).label}</Tag></td>
                        <td class="mdt-num au-mono">{c.jail ? `${c.jail} mo` : 'None'}</td>
                        <td class="mdt-num au-mono">{c.fine ? formatMoney(c.fine) : 'None'}</td>
                        <td class="mdt-num au-mono">{c.points || 0}</td>
                        <td class="mdt-num au-mono">{n}</td>
                        <td class="act">
                            <Button variant="secondary" size="sm" onclick={() => add(c.id)}>Add</Button>
                            {#if n > 0}<Button variant="tertiary" size="sm" onclick={() => remove(c.id)}>Remove</Button>{/if}
                        </td>
                    </tr>
                {:else}
                    <tr><td colspan="7" class="au-muted">No charges match. Clear the search or choose all classes.</td></tr>
                {/each}
            </tbody>
        </table>
    </div>
    {#snippet actions()}
        <Button variant="secondary" onclick={onclose}>Cancel</Button>
        <Button onclick={() => onsave?.(picked.map((p) => ({ id: p.id, count: p.count })))}>Save charges</Button>
    {/snippet}
</Modal>

<style>
    .totals {
        margin: 0 0 var(--au-s3);
    }
    .filters {
        display: flex;
        gap: var(--au-s3);
        margin-bottom: var(--au-s3);
    }
    .filters label {
        display: block;
        font-weight: 700;
        margin-bottom: var(--au-s1);
    }
    .f-term {
        width: 360px;
    }
    .f-class {
        width: 220px;
    }
    .scroll {
        max-height: 420px;
        overflow: auto;
    }
    .act {
        white-space: nowrap;
        text-align: right;
    }
</style>
