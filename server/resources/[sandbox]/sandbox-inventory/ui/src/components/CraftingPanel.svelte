<script>
    import { Button, PageAlert, Tag, TextInput, fetchNui } from '@sandbox/ui-kit';
    import ItemImage from './ItemImage.svelte';
    import { catalog } from '../state/catalog.svelte.js';
    import { crafting } from '../state/crafting.svelte.js';
    import { inv, setPlayer, capacityOf } from '../state/inventory.svelte.js';
    import { itemDef, inventoryWeight, stackMax, formatCount, formatUntil, formatWeight, WEIGHT_UNIT } from '../lib/item.js';

    /** The bench: a table of recipes, what each needs against what you hold, an amount and a Craft button. */
    const SERVER_MAX = 50;

    let now = $state(Date.now());
    $effect(() => {
        const t = setInterval(() => (now = Date.now()), 1000);
        return () => clearInterval(t);
    });

    const held = $derived.by(() => {
        const counts = {};
        for (const s of inv.player.inventory) counts[s.Name] = (counts[s.Name] ?? 0) + (Number(s.Count) || 0);
        return counts;
    });

    const rows = $derived.by(() => {
        const q = crafting.search.trim().toLowerCase();
        return crafting.recipes
            .filter((r) => r?.result?.name)
            .map((r) => {
                const def = itemDef(catalog.items, r.result.name);
                const perCraft = Number(r.result.count) || 1;
                const max = Math.max(1, Math.min(SERVER_MAX, Math.floor((stackMax(def) || perCraft) / perCraft) || 1));
                const typed = crafting.qty[r.id] ?? '1';
                const n = Math.floor(Number(typed));
                const qty = Number.isFinite(n) && n >= 1 ? Math.min(n, max) : 1;
                const needs = {};
                for (const m of Object.values(r.items ?? {})) {
                    if (!m?.name) continue;
                    needs[m.name] = (needs[m.name] ?? 0) + (Number(m.count) || 0);
                }
                const mats = Object.entries(needs).map(([name, per]) => ({
                    name,
                    label: itemDef(catalog.items, name).label,
                    need: per * qty,
                    have: held[name] ?? 0,
                }));
                const cooldown = Number(crafting.cooldowns?.[r.id]) || 0;
                return { r, def, perCraft, max, qty, typed, mats, cooldown };
            })
            .filter((row) => !q || row.def.label.toLowerCase().includes(q));
    });

    const weight = $derived(inventoryWeight(inv.player.inventory, catalog.items));

    function problem(row) {
        if (row.cooldown > now) return `${row.def.label} is on cooldown. Try again ${formatUntil(row.cooldown, now)}.`;
        const short = row.mats.filter((m) => m.have < m.need);
        if (short.length) return `You need ${short.map((m) => `${formatCount(m.need - m.have)} more ${m.label}`).join(' and ')}.`;
        const add = (Number(row.def.weight) || 0) * row.perCraft * row.qty;
        if (weight + add > capacityOf('player')) return `You cannot carry ${formatWeight(add)} ${WEIGHT_UNIT} more. Make fewer or free up some weight.`;
        return null;
    }

    async function craft(row) {
        if (crafting.busy) return;
        const why = problem(row);
        if (why) {
            fetchNui('FrontEndSound', 'DISABLED');
            crafting.result = { tone: 'error', text: why };
            return;
        }
        crafting.busy = row.r.id;
        crafting.result = null;
        let res = null;
        try {
            res = await fetchNui('Crafting:Craft', { bench: crafting.bench, qty: row.qty, result: row.r.id }, { timeout: 30000 });
        } catch {
            res = null;
        }
        crafting.busy = null;
        if (res && typeof res === 'object' && res.inventory) {
            setPlayer({ inventory: res.inventory });
            crafting.cooldowns = res.cooldowns && typeof res.cooldowns === 'object' ? { ...res.cooldowns } : {};
            crafting.qty[row.r.id] = '1';
            crafting.result = { tone: 'success', text: `You crafted ${formatCount(row.perCraft * row.qty)} ${row.def.label}.` };
        } else {
            crafting.result = { tone: 'error', text: `${row.def.label} was not crafted. The reason is in your notifications.` };
        }
    }
</script>

<section class="wrap" aria-label="Crafting bench">
    <div class="head au-overworld">
        <h2 class="title">Crafting bench</h2>
        <span class="count"><span class="au-mono">{formatCount(crafting.recipes.length)}</span> {crafting.recipes.length === 1 ? 'recipe' : 'recipes'}</span>
    </div>

    <div class="panel">
        {#if crafting.recipes.length > 6}
            <div class="search">
                <label class="au-hidden" for="recipe-search">Search recipes</label>
                <TextInput id="recipe-search" type="search" placeholder="Search recipes" bind:value={crafting.search} />
            </div>
        {/if}
        {#if crafting.result}
            <div class="result"><PageAlert type={crafting.result.tone} compact>{crafting.result.text}</PageAlert></div>
        {/if}

        {#if crafting.recipes.length === 0}
            <div class="empty">
                <p><strong>This bench has no recipes for you.</strong></p>
                <p>Add a schematic to the bench to learn a recipe. Some benches only work for certain jobs or reputation levels.</p>
            </div>
        {:else if rows.length === 0}
            <div class="empty">
                <p>No recipe matches "{crafting.search}".</p>
                <Button variant="tertiary" onclick={() => (crafting.search = '')}>Clear the search</Button>
            </div>
        {:else}
            <div class="scroll">
                <table class="au-table">
                    <thead>
                        <tr>
                            <th scope="col">Item</th>
                            <th scope="col">Needs</th>
                            <th scope="col" class="is-numeric">Amount</th>
                            <th scope="col"><span class="au-hidden">Action</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each rows as row (row.r.id)}
                            <tr>
                                <td>
                                    <div class="item">
                                        <span class="pic"><ItemImage instance={{ Name: row.r.result.name }} def={row.def} size={40} fallback={false} /></span>
                                        <span>
                                            <strong>{row.def.label}</strong>
                                            <span class="makes">Makes <span class="au-mono">{formatCount(row.perCraft * row.qty)}</span></span>
                                        </span>
                                    </div>
                                </td>
                                <td>
                                    <ul class="mats">
                                        {#each row.mats as m (m.name)}
                                            <li class:is-short={m.have < m.need}>
                                                <span>{m.label}</span>
                                                <span class="au-mono">{formatCount(m.have)} / {formatCount(m.need)}</span>
                                                {#if m.have < m.need}<span class="short">Short</span>{/if}
                                            </li>
                                        {/each}
                                    </ul>
                                </td>
                                <td class="is-numeric">
                                    {#if row.max > 1}
                                        <label class="au-hidden" for="qty-{row.r.id}">Amount of {row.def.label}</label>
                                        <TextInput id="qty-{row.r.id}" type="number" mono size="sm" min="1" max={row.max} width="72px" block={false} value={row.typed} oninput={(e) => (crafting.qty[row.r.id] = e.currentTarget.value)} />
                                    {:else}
                                        <span class="au-mono">1</span>
                                    {/if}
                                </td>
                                <td class="act">
                                    {#if row.cooldown > now}
                                        <Tag tone="warning">Ready {formatUntil(row.cooldown, now)}</Tag>
                                    {:else}
                                        <Button variant="secondary" size="sm" loading={crafting.busy === row.r.id} disabled={Boolean(crafting.busy) && crafting.busy !== row.r.id} onclick={() => craft(row)}>Craft</Button>
                                    {/if}
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        {/if}
    </div>
</section>

<style>
    .wrap {
        width: 760px;
        display: flex;
        flex-direction: column;
    }
    .head {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: var(--au-s4);
        margin-bottom: var(--au-s2);
    }
    .title {
        margin: 0;
        font-size: var(--au-fs-md);
        line-height: 1.3;
    }
    .count {
        font-size: var(--au-fs-xs);
    }
    .panel {
        margin-top: 16px;
        background: var(--au-bg);
        border: 2px solid var(--au-ink);
        padding: var(--au-s3) var(--au-s4) var(--au-s4);
    }
    .search {
        margin-bottom: var(--au-s3);
    }
    .result :global(.au-alert) {
        margin: 0 0 var(--au-s3);
    }
    .scroll {
        max-height: 620px;
        overflow-y: auto;
    }
    table {
        width: 100%;
    }
    thead th {
        position: sticky;
        top: 0;
        background: var(--au-bg);
        z-index: 1;
    }
    td {
        vertical-align: middle;
    }
    .item {
        display: flex;
        align-items: center;
        gap: var(--au-s3);
    }
    .item strong {
        display: block;
    }
    .pic {
        flex: none;
        display: grid;
        place-items: center;
        width: 48px;
        height: 48px;
        background: var(--au-bg-shade);
        border: 1px solid var(--au-border);
    }
    .makes {
        display: block;
        color: var(--au-muted);
    }
    .mats {
        margin: 0;
        padding: 0;
        list-style: none;
    }
    .mats li {
        display: flex;
        gap: var(--au-s2);
        align-items: baseline;
        flex-wrap: wrap;
    }
    .mats li.is-short {
        color: var(--au-error);
    }
    .short {
        font-weight: 700;
    }
    .act :global(.au-tag) {
        font-size: var(--au-fs-xs);
    }
    .act {
        text-align: right;
        white-space: nowrap;
        width: 1%;
    }
    .empty {
        padding: var(--au-s8) var(--au-s4);
        font-size: var(--au-fs-xs);
        color: var(--au-muted);
    }
    .empty p {
        margin: 0 0 var(--au-s2);
    }
    .empty strong {
        color: var(--au-text);
    }
</style>
