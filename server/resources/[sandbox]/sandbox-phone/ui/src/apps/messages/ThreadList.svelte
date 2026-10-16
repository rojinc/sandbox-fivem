<script>
    import { onMount } from 'svelte';
    import { Button, EmptyState, Spinner } from '@sandbox/ui-kit';
    import { fetchNui } from '@sandbox/ui-kit/nui';
    import AppPage from '../../components/common/AppPage.svelte';
    import Avatar from '../../components/common/Avatar.svelte';
    import { messages } from '../../state/messages.svelte.js';
    import { openApp } from '../../state/router.svelte.js';
    import { findContact } from '../../lib/contacts.js';
    import { when, toMs, plain } from '../../lib/format.js';
    import { clock } from '../../state/clock.svelte.js';

    /** Conversations, newest first. Lua answers InitLoad and sends the threads separately. */
    let { app } = $props();

    async function load() {
        if (messages.loading) return;
        messages.loading = true;
        messages.failed = false;
        try {
            const ok = await fetchNui('Messages:InitLoad');
            if (ok) messages.loaded = true;
            else messages.failed = true;
        } catch {
            messages.failed = true;
        }
        messages.loading = false;
    }

    onMount(() => {
        if (!messages.loaded) load();
    });

    const threads = $derived((messages.threads ?? []).slice().sort((a, b) => toMs(b.time) - toMs(a.time)));
</script>

<AppPage title={app?.label ?? 'Messages'}>
    {#snippet actions()}
        <Button size="sm" variant="secondary" onclick={() => openApp('messages', 'new')}>New message</Button>
    {/snippet}

    {#if messages.failed}
        <div class="ph-pad">
            <p class="err" role="alert">Your messages could not be loaded.</p>
            <Button variant="secondary" onclick={load}>Try again</Button>
        </div>
    {:else if !messages.loaded || !messages.threads}
        <div class="loading"><Spinner size={20} /> Loading your messages</div>
    {:else if threads.length}
        <ul class="ph-list">
            {#each threads as t (t.number)}
                {@const contact = findContact(t.number)}
                <li>
                    <button type="button" class="ph-row" class:is-unread={t.unread > 0} onclick={() => openApp('messages', `convo/${encodeURIComponent(t.number)}`)}>
                        <Avatar name={contact?.name ?? ''} src={contact?.avatar ?? ''} mark={contact ? '' : '#'} size={40} />
                        <span class="ph-row__main">
                            <span class="ph-row__title">{contact?.name ?? t.number}</span>
                            <span class="ph-row__sub">{plain(t.message)}</span>
                        </span>
                        <span class="ph-row__side">
                            <span class="side__time">{when(t.time, clock.now)}</span>
                            {#if t.unread > 0}<span class="side__count">{t.unread} new</span>{/if}
                        </span>
                    </button>
                </li>
            {/each}
        </ul>
    {:else}
        <EmptyState title="No messages yet">
            Texts you send and receive show here.
            {#snippet actions()}
                <Button onclick={() => openApp('messages', 'new')}>Send a text</Button>
            {/snippet}
        </EmptyState>
    {/if}
</AppPage>

<style>
    .loading {
        display: flex;
        align-items: center;
        gap: var(--au-s3);
        padding: var(--au-s5) var(--au-s4);
        color: var(--au-muted);
    }
    .err {
        color: var(--au-error);
        font-weight: 700;
    }
    .side__time,
    .side__count {
        display: block;
    }
    .side__count {
        margin-top: 2px;
        padding: 0 6px;
        background: var(--au-ink);
        color: var(--au-on-ink);
        font-weight: 700;
    }
    .is-unread :global(.ph-row__sub) {
        color: var(--au-text);
    }
</style>
