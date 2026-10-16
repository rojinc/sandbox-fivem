<script>
    import { onMount } from 'svelte';
    import { Button, Field, PageAlert, Spinner, Tag, TextInput, Textarea } from '@sandbox/ui-kit';
    import { fetchNui } from '@sandbox/ui-kit/nui';
    import AppPage from '../../components/common/AppPage.svelte';
    import Avatar from '../../components/common/Avatar.svelte';
    import Sheet from '../../components/common/Sheet.svelte';
    import TwitterProfile from './TwitterProfile.svelte';
    import { data } from '../../state/data.svelte.js';
    import { twitter } from '../../state/misc.svelte.js';
    import { openApp } from '../../state/router.svelte.js';
    import { showAlert } from '../../state/notify.svelte.js';
    import { clock } from '../../state/clock.svelte.js';
    import { when, toMs, plain } from '../../lib/format.js';
    import { copyText, splitLinks } from '../../lib/clipboard.js';

    /** Spammer: the public feed (root) and your profile (profile). Posts last until the server restarts. */
    let { app, segs = [] } = $props();

    const MAX = 255;
    const profile = $derived(data.player?.Profiles?.twitter ?? null);

    let count = $state(0);
    let loading = $state(false);
    let failed = $state(false);

    async function loadMore(reset = false) {
        if (loading) return;
        loading = true;
        failed = false;
        try {
            const [n, rows] = await Promise.all([fetchNui('Twitter:GetCount'), fetchNui('Twitter:GetTweets', reset ? 0 : twitter.tweets.length)]);
            count = Number(n) || 0;
            const list = Array.isArray(rows) ? rows : Object.values(rows ?? {});
            const seen = new Set(reset ? [] : twitter.tweets.map((t) => t.id));
            twitter.tweets = [...(reset ? [] : twitter.tweets), ...list.filter((t) => t && !seen.has(t.id))];
            twitter.loaded = true;
        } catch {
            failed = true;
        }
        loading = false;
    }
    onMount(() => {
        if (!segs.length) loadMore(true);
    });

    const feed = $derived(twitter.tweets.slice().sort((a, b) => toMs(b.time) - toMs(a.time)));
    const hasMore = $derived(twitter.tweets.length < count);

    let composing = $state(false);
    let text = $state('');
    let image = $state('');
    let errors = $state({});
    let sending = $state(false);
    let respam = $state(null);

    function compose(prefix = '') {
        text = prefix;
        image = '';
        errors = {};
        composing = true;
    }

    async function send(tweet) {
        try {
            return Boolean(await fetchNui('SendTweet', tweet));
        } catch {
            return false;
        }
    }

    async function post(e) {
        e?.preventDefault();
        const t = text.trim();
        const img = image.trim();
        const next = {};
        if (!t) next.text = 'Write something to post.';
        else if (t.length > MAX) next.text = `Shorten your post to ${MAX} characters.`;
        if (img && !/^https:\/\/\S+$/i.test(img)) next.image = 'Enter an image link that starts with https://, or leave it empty.';
        errors = next;
        if (Object.keys(next).length) return;
        sending = true;
        const ok = await send({ time: Math.floor(Date.now() / 1000), content: t, image: { using: Boolean(img), link: img }, likes: [] });
        sending = false;
        if (ok) {
            composing = false;
            showAlert('Posted', 'success');
        } else showAlert('Your post was not sent. Try again.', 'error');
    }

    async function doRespam() {
        const t = respam;
        respam = null;
        const ok = await send({
            ...$state.snapshot(t),
            author: profile?.name,
            content: `RESPAM: @${t.author?.name} "${t.content}"`,
            time: Math.floor(Date.now() / 1000),
            retweet: t.id,
            likes: [],
        });
        showAlert(ok ? 'Respammed' : 'That could not be respammed. Try again.', ok ? 'success' : 'error');
    }

    function copy(url) {
        const ok = copyText(url);
        showAlert(ok ? 'Link copied' : 'The link could not be copied.', ok ? 'neutral' : 'error');
    }
    const respams = (t) => twitter.tweets.filter((x) => x.retweet == t.id).length;
</script>

{#if segs[0] === 'profile'}
    <TwitterProfile />
{:else}
    <AppPage title={app?.label ?? 'Spammer'}>
        {#snippet actions()}
            <Button size="sm" variant="tertiary" onclick={() => openApp('twitter', 'profile')}>Profile</Button>
            {#if profile}<Button size="sm" variant="secondary" onclick={() => compose()}>Post</Button>{/if}
        {/snippet}

        {#if !profile}
            <div class="ph-pad">
                <PageAlert type="info" title="Pick a name to post">You can read the feed now. Set up your profile to post and reply.</PageAlert>
                <Button onclick={() => openApp('twitter', 'profile')}>Set up profile</Button>
            </div>
        {/if}

        {#if feed.length}
            <ul class="ph-list">
                {#each feed as t (t.id)}
                    <li class="tw">
                        <Avatar name={t.author?.name} src={t.author?.picture ?? t.author?.avatar} size={40} />
                        <div class="tw__main">
                            <div class="tw__head">
                                <span class="tw__name">@{plain(t.author?.name)}</span>
                                {#if t.verified || t.source === -1}<Tag tone="info">Verified</Tag>{/if}
                                <span class="tw__time">{when(t.time, clock.now)}</span>
                            </div>
                            <p class="tw__text">
                                {#each splitLinks(plain(t.content)) as part, j (j)}
                                    {#if part.url}<button type="button" class="tw__link" onclick={() => copy(part.url)}>{part.url}</button>{:else}{part.text}{/if}
                                {/each}
                            </p>
                            {#if t.image?.using && /^https:\/\//i.test(t.image?.link ?? '')}
                                <img class="tw__img" src={t.image.link} alt="Picture posted by @{plain(t.author?.name)}" loading="lazy" />
                            {/if}
                            {#if profile}
                                <div class="tw__actions">
                                    <Button size="sm" variant="tertiary" onclick={() => compose(`@${t.author?.name} `)}>Reply</Button>
                                    <Button size="sm" variant="tertiary" onclick={() => (respam = t)}>Respam{respams(t) ? ` (${respams(t)})` : ''}</Button>
                                </div>
                            {/if}
                        </div>
                    </li>
                {/each}
            </ul>
            {#if hasMore}
                <div class="ph-actions"><Button size="sm" variant="secondary" {loading} onclick={() => loadMore()}>Show older posts</Button></div>
            {:else}
                <p class="ph-note">You have reached the oldest post.</p>
            {/if}
        {:else if loading}
            <p class="ph-note state"><Spinner size={18} /> Loading the feed</p>
        {:else if failed}
            <div class="ph-pad">
                <p class="err" role="alert">The feed could not be loaded.</p>
                <Button variant="secondary" onclick={() => loadMore(true)}>Try again</Button>
            </div>
        {:else}
            <p class="ph-note">Nobody has posted yet. Posts show here as soon as they are sent.</p>
        {/if}
    </AppPage>

    <Sheet open={composing} title="New post" onclose={() => (composing = false)}>
        <form id="tw-form" onsubmit={post} novalidate>
            <Field label="Your post" hint="{MAX - text.length} characters left" id="tw-text" error={errors.text}>
                <Textarea id="tw-text" rows={4} bind:value={text} maxlength={MAX} invalid={Boolean(errors.text)} />
            </Field>
            <Field label="Image link (optional)" id="tw-img" error={errors.image}>
                <TextInput id="tw-img" bind:value={image} autocomplete="off" invalid={Boolean(errors.image)} />
            </Field>
        </form>
        {#snippet actions()}
            <Button type="submit" form="tw-form" loading={sending}>Post</Button>
            <Button variant="secondary" onclick={() => (composing = false)}>Cancel</Button>
        {/snippet}
    </Sheet>

    <Sheet open={Boolean(respam)} title="Respam this post?" onclose={() => (respam = null)}>
        {#if respam}<p>@{plain(respam.author?.name)}: {plain(respam.content)}</p>{/if}
        {#snippet actions()}
            <Button onclick={doRespam}>Respam</Button>
            <Button variant="secondary" onclick={() => (respam = null)}>Cancel</Button>
        {/snippet}
    </Sheet>
{/if}

<style>
    .tw {
        display: flex;
        gap: var(--au-s3);
        padding: var(--au-s3) var(--au-s4) var(--au-s2);
    }
    .tw__main {
        flex: 1;
        min-width: 0;
    }
    .tw__head {
        display: flex;
        align-items: center;
        gap: var(--au-s2);
    }
    .tw__name {
        font-weight: 700;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .tw__time {
        margin-left: auto;
        flex-shrink: 0;
        color: var(--au-muted);
    }
    .tw__text {
        margin: var(--au-s1) 0 0;
        overflow-wrap: anywhere;
        white-space: pre-wrap;
        user-select: text;
    }
    .tw__link {
        padding: 0;
        border: 0;
        background: transparent;
        color: var(--au-action);
        font: inherit;
        text-decoration: underline;
        overflow-wrap: anywhere;
        cursor: pointer;
    }
    .tw__img {
        margin-top: var(--au-s2);
        max-height: 220px;
    }
    .tw__actions {
        display: flex;
        gap: var(--au-s3);
        margin-top: var(--au-s1);
    }
    .state {
        display: flex;
        align-items: center;
        gap: var(--au-s2);
    }
    .err {
        color: var(--au-error);
        font-weight: 700;
    }
</style>
