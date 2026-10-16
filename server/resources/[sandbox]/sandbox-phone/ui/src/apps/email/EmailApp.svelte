<script>
    import { Button, EmptyState, Tag, RichText } from '@sandbox/ui-kit';
    import { fetchNui } from '@sandbox/ui-kit/nui';
    import AppPage from '../../components/common/AppPage.svelte';
    import Sheet from '../../components/common/Sheet.svelte';
    import { data, removeData } from '../../state/data.svelte.js';
    import { openApp, back } from '../../state/router.svelte.js';
    import { showAlert } from '../../state/notify.svelte.js';
    import { clock } from '../../state/clock.svelte.js';
    import { when, stamp, toMs, plain } from '../../lib/format.js';

    /** Email: the inbox (root) and one email (view/:id). Expired emails disappear on their own. */
    let { app, segs = [] } = $props();

    const all = $derived(Array.isArray(data.emails) ? data.emails.filter(Boolean) : Object.values(data.emails ?? {}).filter(Boolean));
    const live = $derived(all.filter((e) => !e.expires || toMs(e.expires) > clock.now).sort((a, b) => toMs(b.time) - toMs(a.time)));
    const viewing = $derived(segs[0] === 'view' ? (all.find((e) => String(e.id) === String(segs[1])) ?? null) : null);

    // Expired emails are deleted, as before.
    $effect(() => {
        for (const e of all) {
            if (e.expires && toMs(e.expires) <= clock.now) {
                fetchNui('DeleteEmail', e.id);
                removeData('emails', e.id);
            }
        }
    });

    // Opening an unread email marks it read.
    $effect(() => {
        if (viewing?.unread) {
            fetchNui('ReadEmail', viewing.id);
            viewing.unread = false;
        }
    });

    let confirmDelete = $state(false);
    function remove() {
        confirmDelete = false;
        const id = viewing.id;
        back();
        fetchNui('DeleteEmail', id);
        removeData('emails', id);
        showAlert('Email deleted', 'success');
    }
    function route() {
        fetchNui('GPSRoute', { id: viewing.id, location: viewing.flags.location });
        showAlert('Location marked on your GPS', 'success');
    }
    function hyperlink() {
        fetchNui('Hyperlink', { id: viewing.id, hyperlink: viewing.flags.hyperlink });
    }
    const minutesLeft = (e) => Math.max(1, Math.ceil((toMs(e.expires) - clock.now) / 60000));
</script>

{#if segs[0] === 'view'}
    <AppPage title="Email">
        {#if viewing}
            <article class="mail">
                <h2 class="mail__subject">{plain(viewing.subject) || 'No subject'}</h2>
                <dl class="ph-facts mail__facts">
                    <div><dt>From</dt><dd>{plain(viewing.sender)}</dd></div>
                    <div><dt>Received</dt><dd>{stamp(viewing.time)}</dd></div>
                    {#if viewing.expires}
                        <div><dt>Expires</dt><dd class="warn">In {minutesLeft(viewing)} min, then it is deleted</dd></div>
                    {/if}
                </dl>
                {#if viewing.flags?.location || viewing.flags?.hyperlink}
                    <div class="ph-actions">
                        {#if viewing.flags?.hyperlink}<Button onclick={hyperlink}>{viewing.flags.hyperlink.label ?? 'Accept offer'}</Button>{/if}
                        {#if viewing.flags?.location}<Button variant={viewing.flags?.hyperlink ? 'secondary' : 'primary'} onclick={route}>Set GPS route</Button>{/if}
                    </div>
                {/if}
                <div class="mail__body"><RichText text={viewing.body} tag="div" allowedTags={['h3', 'h4', 'hr']} /></div>
                <div class="ph-actions">
                    <Button variant="danger" onclick={() => (confirmDelete = true)}>Delete email</Button>
                </div>
            </article>
        {:else}
            <div class="ph-pad">
                <p>This email has been deleted or has expired.</p>
                <Button variant="secondary" onclick={() => openApp('email')}>Go to inbox</Button>
            </div>
        {/if}
    </AppPage>
    <Sheet open={confirmDelete} title="Delete this email?" onclose={() => (confirmDelete = false)}>
        <p>You cannot get it back once it is deleted.</p>
        {#snippet actions()}
            <Button variant="danger" onclick={remove}>Delete email</Button>
            <Button variant="secondary" onclick={() => (confirmDelete = false)}>Keep it</Button>
        {/snippet}
    </Sheet>
{:else}
    <AppPage title={app?.label ?? 'Email'}>
        {#if data.player?.Alias?.email}<p class="ph-note addr">Your address is <strong>{data.player.Alias.email}</strong></p>{/if}
        {#if live.length}
            <ul class="ph-list">
                {#each live as e (e.id)}
                    <li>
                        <button type="button" class="ph-row" class:is-unread={e.unread} onclick={() => openApp('email', `view/${e.id}`)}>
                            <span class="ph-row__main">
                                <span class="ph-row__title">{plain(e.subject) || 'No subject'}</span>
                                <span class="ph-row__sub">{plain(e.sender)}</span>
                                {#if e.unread || e.expires}
                                    <span class="tags">
                                        {#if e.unread}<Tag tone="info">Unread</Tag>{/if}
                                        {#if e.expires}<Tag tone="warning">Expires in {minutesLeft(e)} min</Tag>{/if}
                                    </span>
                                {/if}
                            </span>
                            <span class="ph-row__side">{when(e.time, clock.now)}</span>
                        </button>
                    </li>
                {/each}
            </ul>
        {:else}
            <EmptyState title="Your inbox is empty">Emails from businesses, jobs and the city arrive here.</EmptyState>
        {/if}
    </AppPage>
{/if}

<style>
    .addr {
        border-bottom: 1px solid var(--au-border);
        overflow-wrap: anywhere;
    }
    .addr strong {
        color: var(--au-text);
    }
    .tags {
        display: flex;
        flex-wrap: wrap;
        gap: var(--au-s1);
        margin-top: var(--au-s1);
    }
    .tags :global(.au-tag) {
        font-size: var(--au-fs-xs);
    }
    .ph-row:not(.is-unread) :global(.ph-row__title) {
        font-weight: 400;
    }
    .mail__subject {
        margin: 0;
        padding: var(--au-s4) var(--au-s4) var(--au-s2);
        font-size: var(--au-fs-md);
        overflow-wrap: anywhere;
    }
    .mail__facts {
        border-top: 1px solid var(--au-border);
    }
    .warn {
        color: var(--au-warning);
        font-weight: 700;
    }
    .mail__body {
        padding: var(--au-s4);
        overflow-wrap: anywhere;
        user-select: text;
    }
    .mail__body :global(p) {
        margin: 0 0 var(--au-s3);
    }
</style>
