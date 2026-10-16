<script>
    import { Button, Field, TextInput, Spinner } from '@sandbox/ui-kit';
    import { fetchNui } from '@sandbox/ui-kit/nui';
    import { data, asList } from '../../state/data.svelte.js';
    import { person } from '../../lib/format.js';

    /**
     * Pick other employees who worked on a receipt. Searches your business's
     * employees by name or State ID (BizWizEmployeeSearch, 4 results at most).
     * You wrote the receipt, so you cannot add yourself.
     */
    let { value = $bindable([]) } = $props();

    let term = $state('');
    let results = $state([]);
    let searching = $state(false);
    let searched = $state(false);
    let failed = $state(false);

    const me = $derived(data.player?.SID);
    const picked = $derived(asList(value));
    const options = $derived(results.filter((r) => r.SID != me && !picked.some((p) => p.SID == r.SID)));

    async function search() {
        searching = true;
        const res = await fetchNui('BizWizEmployeeSearch', { term: term.trim(), job: data.onDuty });
        searching = false;
        searched = true;
        failed = !(Array.isArray(res) || (res && typeof res === 'object'));
        results = asList(res);
    }

    function add(emp) {
        value = [...picked, { SID: emp.SID, First: emp.First, Last: emp.Last }];
    }

    function remove(emp) {
        value = picked.filter((p) => p.SID != emp.SID);
    }
</script>

<fieldset class="picker">
    <legend class="picker__legend">Other employees <span class="au-muted">(optional)</span></legend>
    <span class="picker__hint">Add anyone who helped with this job. They get credit in receipt totals.</span>

    {#if picked.length}
        <ul class="picker__list">
            {#each picked as p (p.SID)}
                <li>
                    <span>{person(p)} <span class="au-muted">(State ID {p.SID})</span></span>
                    <Button variant="tertiary" size="sm" onclick={() => remove(p)}>Remove</Button>
                </li>
            {/each}
        </ul>
    {/if}

    <div class="picker__search">
        <Field label="Find an employee" id="emp-search">
            <TextInput
                id="emp-search"
                bind:value={term}
                autocomplete="off"
                onkeydown={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        search();
                    }
                }}
            />
        </Field>
        <Button variant="secondary" loading={searching} onclick={search}>Find</Button>
    </div>
    {#if searching}
        <div class="loading"><Spinner size={16} /> Searching</div>
    {:else if searched && failed}
        <p class="au-muted">The search did not run. Check you are still on duty.</p>
    {:else if searched && options.length}
        <ul class="picker__list">
            {#each options as o (o.SID)}
                <li>
                    <span>{person(o)} <span class="au-muted">(State ID {o.SID})</span></span>
                    <Button variant="secondary" size="sm" onclick={() => add(o)}>Add</Button>
                </li>
            {/each}
        </ul>
    {:else if searched}
        <p class="au-muted">No other employees match "{term.trim()}".</p>
    {/if}
</fieldset>

<style>
    .picker {
        border: 0;
        margin: 0 0 var(--au-s4);
        padding: 0;
    }
    .picker__legend {
        padding: 0;
        font-weight: 700;
        margin-bottom: var(--au-s1);
    }
    .picker__legend .au-muted {
        font-weight: 400;
    }
    .picker__hint {
        display: block;
        color: var(--au-muted);
        margin-bottom: var(--au-s3);
    }
    .picker__list {
        list-style: none;
        margin: 0 0 var(--au-s3);
        padding: 0;
        border-top: 1px solid var(--au-border);
    }
    .picker__list li {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--au-s3);
        padding: var(--au-s1) 0;
        border-bottom: 1px solid var(--au-border);
        min-height: 44px;
    }
    .picker__search {
        display: flex;
        align-items: flex-end;
        gap: var(--au-s2);
    }
    .picker__search :global(.au-field) {
        flex: 1;
        margin-bottom: 3px;
    }
</style>
