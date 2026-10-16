<script>
    import { Button, Field, TextInput, Textarea, Checkbox } from '@sandbox/ui-kit';
    import { fetchNui } from '@sandbox/ui-kit/nui';
    import AppPage from '../../components/common/AppPage.svelte';
    import { data } from '../../state/data.svelte.js';
    import { navigate } from '../../state/router.svelte.js';
    import { showAlert } from '../../state/notify.svelte.js';
    import { htmlToText, textToHtml } from '../../lib/text.js';
    import { CATEGORIES } from './categories.js';

    /** Post or edit your ad. It stays up until you delete it or log off. */
    let { advert = null } = $props();

    let title = $state('');
    let price = $state('');
    let details = $state('');
    let cats = $state({});
    let errors = $state({});

    $effect.pre(() => {
        title = advert?.title ?? '';
        price = advert?.price ? String(advert.price) : '';
        details = htmlToText(advert?.full ?? advert?.short ?? '');
        cats = Object.fromEntries(CATEGORIES.map((c) => [c.value, (advert?.categories ?? []).includes(c.value)]));
    });

    function submit(e) {
        e.preventDefault();
        const next = {};
        const t = title.trim();
        const chosen = CATEGORIES.filter((c) => cats[c.value]).map((c) => c.value);
        const p = price.trim().replace(/[$,\s]/g, '');
        if (!t) next.title = 'Enter a title for your ad.';
        if (!chosen.length) next.cats = 'Choose at least one category.';
        if (p && !/^\d{1,9}$/.test(p)) next.price = 'Enter the price in whole dollars, for example 2500, or leave it empty.';
        if (!details.trim()) next.details = 'Say what you are offering or looking for.';
        errors = next;
        if (Object.keys(next).length) return;

        const p0 = data.player ?? {};
        const body = {
            title: t.slice(0, 32),
            price: p,
            full: textToHtml(details.slice(0, 2000)),
            short: details.trim().slice(0, 120),
            categories: chosen,
            id: p0.Source,
            author: `${p0.First ?? ''} ${p0.Last ?? ''}`.trim(),
            number: p0.Phone,
            time: Date.now(),
        };
        fetchNui(advert ? 'UpdateAdvert' : 'CreateAdvert', body);
        showAlert(advert ? 'Your ad was updated' : 'Your ad is live', 'success');
        navigate('/apps/adverts', { replace: true });
    }
</script>

<AppPage title={advert ? 'Edit your ad' : 'Post an ad'}>
    <form class="ph-form" onsubmit={submit} novalidate>
        <Field label="Title" hint="Up to 32 characters" id="ad-title" error={errors.title}>
            <TextInput id="ad-title" bind:value={title} maxlength="32" invalid={Boolean(errors.title)} />
        </Field>
        <fieldset class="cats">
            <legend class="cats__label">Categories</legend>
            {#if errors.cats}<p class="cats__err" role="alert"><span class="au-hidden">Error:</span> {errors.cats}</p>{/if}
            {#each CATEGORIES as c (c.value)}
                <Checkbox bind:checked={cats[c.value]} label={c.label} />
            {/each}
        </fieldset>
        <Field label="Price in dollars (optional)" hint="Leave empty if it is negotiable" id="ad-price" error={errors.price}>
            <TextInput id="ad-price" bind:value={price} inputmode="numeric" maxlength="12" width="60%" block={false} invalid={Boolean(errors.price)} />
        </Field>
        <Field label="Details" hint="What it is, its condition, and when you are free" id="ad-details" error={errors.details}>
            <Textarea id="ad-details" rows={6} bind:value={details} maxlength="2000" invalid={Boolean(errors.details)} />
        </Field>
        <Button type="submit">{advert ? 'Save changes' : 'Post ad'}</Button>
    </form>
</AppPage>

<style>
    .cats {
        display: flex;
        flex-direction: column;
        margin: 0 0 var(--au-s4);
        padding: 0;
        border: 0;
    }
    .cats__label {
        padding: 0;
        margin-bottom: var(--au-s1);
        font-weight: 700;
        font-size: var(--au-fs-xs);
    }
    .cats__err {
        margin: 0 0 var(--au-s2);
        color: var(--au-error);
        font-weight: 700;
    }
</style>
