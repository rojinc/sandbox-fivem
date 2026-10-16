<script>
    import { Button, EmptyState, Field, Select, TextInput, RichText, Tag } from '@sandbox/ui-kit';
    import { fetchNui } from '@sandbox/ui-kit/nui';
    import AppPage from '../../components/common/AppPage.svelte';
    import Sheet from '../../components/common/Sheet.svelte';
    import AdvertForm from './AdvertForm.svelte';
    import { data } from '../../state/data.svelte.js';
    import { openApp, back } from '../../state/router.svelte.js';
    import { showAlert } from '../../state/notify.svelte.js';
    import { call } from '../../state/call.svelte.js';
    import { clock } from '../../state/clock.svelte.js';
    import { callNumber } from '../../lib/contacts.js';
    import { when, stamp, toMs, plain } from '../../lib/format.js';
    import { htmlToText } from '../../lib/text.js';
    import { CATEGORIES, categoryLabel } from './categories.js';

    /**
     * Ads: one advert per player, keyed by server id. Root lists them (filter by
     * category, search titles), view/:id shows one, add and edit post yours.
     */
    let { app, segs = [] } = $props();

    const me = $derived(data.player?.Source);
    const ads = $derived(
        Object.entries(data.adverts && typeof data.adverts === 'object' ? data.adverts : {})
            .filter(([k, a]) => k !== '0' && a && a.title)
            .map(([k, a]) => ({ ...a, key: k })),
    );
    const mine = $derived(ads.find((a) => String(a.key) === String(me)) ?? null);

    let category = $state('');
    let term = $state('');
    const list = $derived(
        ads
            .filter((a) => !category || (a.categories ?? []).includes(category))
            .filter((a) => !term.trim() || String(a.title).toLowerCase().includes(term.trim().toLowerCase()))
            .sort((a, b) => toMs(b.time) - toMs(a.time)),
    );
    const viewing = $derived(segs[0] === 'view' ? (ads.find((a) => String(a.key) === String(segs[1])) ?? null) : null);

    const price = (a) => (a.price !== undefined && a.price !== null && String(a.price).trim() !== '' ? `$${Number(String(a.price).replace(/[^\d.]/g, '')).toLocaleString('en-US')}` : 'Negotiable');
    const canBump = $derived(mine ? clock.now - toMs(mine.time) > 30 * 60 * 1000 : false);

    let confirmDelete = $state(false);
    function remove() {
        confirmDelete = false;
        fetchNui('DeleteAdvert');
        showAlert('Your ad was deleted', 'success');
        openApp('adverts');
    }
    function bump() {
        fetchNui('UpdateAdvert', { ...$state.snapshot(mine), key: undefined, time: Date.now() });
        showAlert('Your ad moved to the top', 'success');
    }

    const CAT_OPTIONS = [{ value: '', label: 'All categories' }, ...CATEGORIES.map((c) => ({ value: c.value, label: c.label }))];
</script>

{#if segs[0] === 'add' || segs[0] === 'edit'}
    <AdvertForm advert={segs[0] === 'edit' ? mine : null} />
{:else if segs[0] === 'view'}
    <AppPage title="Ad">
        {#if viewing}
            {@const own = String(viewing.key) === String(me)}
            <article>
                <h2 class="ad__title">{plain(viewing.title)}</h2>
                <dl class="ph-facts">
                    <div><dt>Price</dt><dd>{price(viewing)}</dd></div>
                    <div><dt>Posted by</dt><dd>{plain(viewing.author)}</dd></div>
                    <div><dt>Number</dt><dd class="au-mono">{viewing.number}</dd></div>
                    <div><dt>Posted</dt><dd>{stamp(viewing.time)}</dd></div>
                    {#if viewing.categories?.length}
                        <div><dt>Categories</dt><dd>{viewing.categories.map(categoryLabel).join(', ')}</dd></div>
                    {/if}
                </dl>
                <div class="ph-actions">
                    {#if own}
                        <Button onclick={() => openApp('adverts', 'edit')}>Edit your ad</Button>
                        {#if canBump}<Button variant="secondary" onclick={bump}>Move to the top</Button>{/if}
                        <Button variant="danger" onclick={() => (confirmDelete = true)}>Delete ad</Button>
                    {:else}
                        <Button icon="phone" disabled={Boolean(call.current)} onclick={() => callNumber(viewing.number)}>Call</Button>
                        <Button variant="secondary" onclick={() => openApp('messages', `convo/${encodeURIComponent(viewing.number)}`)}>Send text</Button>
                    {/if}
                </div>
                {#if viewing.full && htmlToText(viewing.full)}
                    <div class="ad__body"><RichText text={viewing.full} tag="div" allowedTags={['img']} allowedAttr={['src', 'alt']} /></div>
                {:else if viewing.short}
                    <p class="ad__body">{plain(viewing.short)}</p>
                {/if}
            </article>
        {:else}
            <div class="ph-pad">
                <p>This ad has been taken down.</p>
                <Button variant="secondary" onclick={() => openApp('adverts')}>See all ads</Button>
            </div>
        {/if}
    </AppPage>
    <Sheet open={confirmDelete} title="Delete your ad?" onclose={() => (confirmDelete = false)}>
        <p>It disappears for everyone straight away.</p>
        {#snippet actions()}
            <Button variant="danger" onclick={remove}>Delete ad</Button>
            <Button variant="secondary" onclick={() => (confirmDelete = false)}>Keep it</Button>
        {/snippet}
    </Sheet>
{:else}
    <AppPage title={app?.label ?? 'Ads'}>
        {#snippet actions()}
            {#if mine}
                <Button size="sm" variant="secondary" onclick={() => openApp('adverts', `view/${mine.key}`)}>Your ad</Button>
            {:else}
                <Button size="sm" variant="secondary" onclick={() => openApp('adverts', 'add')}>Post an ad</Button>
            {/if}
        {/snippet}
        <div class="filters">
            <Field label="Category" id="ad-cat">
                <Select id="ad-cat" options={CAT_OPTIONS} bind:value={category} />
            </Field>
            <Field label="Search titles" id="ad-q">
                <TextInput id="ad-q" type="search" bind:value={term} />
            </Field>
        </div>
        {#if list.length}
            <p class="ph-note count" aria-live="polite">Showing {list.length} of {ads.length} {ads.length === 1 ? 'ad' : 'ads'}</p>
            <ul class="ph-list">
                {#each list as a (a.key)}
                    <li>
                        <button type="button" class="ph-row" onclick={() => openApp('adverts', `view/${a.key}`)}>
                            <span class="ph-row__main">
                                <span class="ph-row__title">{plain(a.title)}</span>
                                <span class="ph-row__sub">{plain(a.author)}, {when(a.time, clock.now)}</span>
                                {#if String(a.key) === String(me)}<span class="own"><Tag tone="info">Your ad</Tag></span>{/if}
                            </span>
                            <span class="ph-row__side">{price(a)}</span>
                        </button>
                    </li>
                {/each}
            </ul>
        {:else if ads.length}
            <p class="ph-note">No ads match. Choose another category or clear the search.</p>
        {:else}
            <EmptyState title="No ads right now">
                Ads people post to buy, sell or hire show here until they log off.
                {#snippet actions()}
                    <Button onclick={() => openApp('adverts', 'add')}>Post an ad</Button>
                {/snippet}
            </EmptyState>
        {/if}
    </AppPage>
{/if}

<style>
    .filters {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--au-s3);
        padding: var(--au-s3) var(--au-s4) 0;
        border-bottom: 1px solid var(--au-border);
    }
    .filters :global(.au-field) {
        margin-bottom: var(--au-s3);
    }
    .count {
        padding-bottom: var(--au-s2);
        border-bottom: 1px solid var(--au-border);
    }
    .own {
        display: block;
        margin-top: var(--au-s1);
    }
    .own :global(.au-tag) {
        font-size: var(--au-fs-xs);
    }
    .ad__title {
        margin: 0;
        padding: var(--au-s4) var(--au-s4) var(--au-s3);
        font-size: var(--au-fs-md);
        overflow-wrap: anywhere;
        border-bottom: 1px solid var(--au-border);
    }
    .ad__body {
        margin: 0;
        padding: 0 var(--au-s4) var(--au-s4);
        overflow-wrap: anywhere;
        user-select: text;
    }
    .ad__body :global(p) {
        margin: 0 0 var(--au-s3);
    }
    .ad__body :global(img) {
        max-height: 240px;
    }
</style>
