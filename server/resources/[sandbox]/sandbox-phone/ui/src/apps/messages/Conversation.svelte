<script>
    import { onMount, tick } from 'svelte';
    import { Button, Spinner } from '@sandbox/ui-kit';
    import { fetchNui } from '@sandbox/ui-kit/nui';
    import AppPage from '../../components/common/AppPage.svelte';
    import Sheet from '../../components/common/Sheet.svelte';
    import { data } from '../../state/data.svelte.js';
    import { messages, onIncomingMessage, upsertThread, removeThread, clearUnread } from '../../state/messages.svelte.js';
    import { call } from '../../state/call.svelte.js';
    import { openApp, navigate } from '../../state/router.svelte.js';
    import { showAlert } from '../../state/notify.svelte.js';
    import { findContact, callNumber } from '../../lib/contacts.js';
    import { stamp, toMs, clockTime, longDate } from '../../lib/format.js';
    import { copyText, splitLinks } from '../../lib/clipboard.js';

    /** One conversation: the texts, oldest at the top, and the reply box. */
    let { number } = $props();

    const MAX = 256;
    let list = $state([]); // { id, method, time, message }
    let loading = $state(true);
    let failed = $state(false);
    let text = $state('');
    let sending = $state(false);
    let sendError = $state('');
    let options = $state(false);
    let confirmDelete = $state(false);
    let body = $state();

    const contact = $derived(findContact(number));
    const thread = $derived(messages.threads?.find((t) => t.number == number) ?? null);
    const hasMore = $derived(list.length < (Number(thread?.count) || 0));
    const ordered = $derived(list.slice().sort((a, b) => toMs(a.time) - toMs(b.time)));

    let lastRead = 0;
    function markRead() {
        clearUnread(number);
        if (Date.now() - lastRead < 2000) return;
        lastRead = Date.now();
        fetchNui('ReadConvo', number);
    }

    async function scrollEnd() {
        await tick();
        if (body) body.scrollTop = body.scrollHeight;
    }

    async function load(older = false) {
        loading = true;
        failed = false;
        try {
            const res = await fetchNui('Messages:LoadTexts', { number, offset: older ? list.length : 0 });
            const rows = Array.isArray(res) ? res : Object.values(res ?? {});
            if (!Array.isArray(res) && (res === false || res === null)) throw new Error('load');
            const seen = new Set(list.map((m) => m.id));
            list = older ? [...list, ...rows.filter((m) => !seen.has(m.id))] : rows;
            if (!older) scrollEnd();
        } catch {
            failed = true;
        }
        loading = false;
    }

    onMount(() => {
        load();
        markRead();
        return onIncomingMessage((m) => {
            if (!m || m.number != number) return;
            list = [...list, m];
            markRead();
            scrollEnd();
        });
    });

    async function send(e) {
        e?.preventDefault();
        const message = text.trim();
        if (!message || sending) return;
        if (message.length > MAX) {
            sendError = `Shorten your message to ${MAX} characters.`;
            return;
        }
        sending = true;
        sendError = '';
        const msg = { owner: data.player?.Phone, number, method: 1, time: Math.floor(Date.now() / 1000), message };
        try {
            const id = await fetchNui('SendMessage', msg);
            if (id) {
                list = [...list, { ...msg, id }];
                upsertThread(number, { id, owner: msg.owner, type: 1, method: 1, time: msg.time, message, count: (Number(thread?.count) || 0) + 1 });
                text = '';
                scrollEnd();
            } else {
                sendError = 'Your message was not sent. Try again.';
            }
        } catch {
            sendError = 'Your message was not sent. Try again.';
        }
        sending = false;
    }

    async function deleteConvo() {
        confirmDelete = false;
        try {
            const ok = await fetchNui('DeleteConvo', number);
            if (ok) {
                removeThread(number);
                showAlert('Conversation deleted', 'success');
                navigate('/apps/messages', { replace: true });
            } else showAlert('The conversation could not be deleted. Try again.', 'error');
        } catch {
            showAlert('The conversation could not be deleted. Try again.', 'error');
        }
    }

    function copy(url) {
        const ok = copyText(url);
        showAlert(ok ? 'Link copied' : 'The link could not be copied.', ok ? 'neutral' : 'error');
    }

    // A date line before the first text of each day.
    const dayOf = (t) => new Date(toMs(t)).toDateString();
</script>

<AppPage title={contact?.name ?? number} bind:bodyEl={body}>
    {#snippet actions()}
        <Button size="sm" variant="secondary" icon="phone" disabled={Boolean(call.current)} onclick={() => callNumber(number)}>Call</Button>
        <Button size="sm" variant="tertiary" onclick={() => (options = true)}>Options</Button>
    {/snippet}

    <div class="convo">
        {#if hasMore && !loading}
            <Button size="sm" variant="tertiary" onclick={() => load(true)}>Show earlier messages</Button>
        {/if}
        {#if loading && !list.length}
            <div class="state"><Spinner size={20} /> Loading messages</div>
        {:else if failed && !list.length}
            <div class="state state--err" role="alert">These messages could not be loaded.</div>
            <Button size="sm" variant="secondary" onclick={() => load()}>Try again</Button>
        {:else if !list.length}
            <p class="state">No messages with {contact?.name ?? number} yet. Write one below.</p>
        {/if}

        {#each ordered as m, i (m.id ?? `${m.time}-${i}`)}
            {#if i === 0 || dayOf(m.time) !== dayOf(ordered[i - 1].time)}
                <div class="day">{longDate(m.time)}</div>
            {/if}
            <div class="msg" class:msg--mine={Number(m.method) === 1} title={stamp(m.time)}>
                <div class="msg__text">
                    {#each splitLinks(m.message) as part, j (j)}
                        {#if part.url && part.image}
                            <button type="button" class="msg__img" onclick={() => copy(part.url)} aria-label="Copy image link"><img src={part.url} alt="" loading="lazy" /></button>
                        {:else if part.url}
                            <button type="button" class="msg__link" onclick={() => copy(part.url)}>{part.url}</button>
                        {:else}{part.text}{/if}
                    {/each}
                </div>
                <div class="msg__time ph-num">{clockTime(m.time)}</div>
            </div>
        {/each}
    </div>

    {#snippet footer()}
        <form class="compose" onsubmit={send}>
            {#if sendError}<p class="compose__err" role="alert"><span class="au-hidden">Error:</span> {sendError}</p>{/if}
            <label class="au-hidden" for="compose-text">Message to {contact?.name ?? number}</label>
            <div class="compose__row">
                <textarea id="compose-text" class="compose__input" rows="1" maxlength={MAX} placeholder="Write a text" bind:value={text}
                    onkeydown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) send(e);
                    }}></textarea>
                <Button type="submit" loading={sending}>Send</Button>
            </div>
        </form>
    {/snippet}
</AppPage>

<Sheet open={options} title={contact?.name ?? number} onclose={() => (options = false)}>
    {#snippet actions()}
        <Button
            variant="secondary"
            onclick={() => {
                options = false;
                openApp('contacts', contact ? `view/${contact.id}` : `caller/${encodeURIComponent(number)}`);
            }}>{contact ? 'View contact' : 'Add to contacts'}</Button
        >
        <Button
            variant="danger"
            onclick={() => {
                options = false;
                confirmDelete = true;
            }}>Delete conversation</Button
        >
    {/snippet}
</Sheet>

<Sheet open={confirmDelete} title="Delete this conversation?" onclose={() => (confirmDelete = false)}>
    <p>Every text with {contact?.name ?? number} is removed from your phone. They keep their copy.</p>
    {#snippet actions()}
        <Button variant="danger" onclick={deleteConvo}>Delete conversation</Button>
        <Button variant="secondary" onclick={() => (confirmDelete = false)}>Keep it</Button>
    {/snippet}
</Sheet>

<style>
    .convo {
        display: flex;
        flex-direction: column;
        gap: var(--au-s2);
        padding: var(--au-s3) var(--au-s3) var(--au-s4);
        min-height: 100%;
        justify-content: flex-end;
    }
    .state {
        display: flex;
        align-items: center;
        gap: var(--au-s3);
        margin: 0;
        color: var(--au-muted);
    }
    .state--err {
        color: var(--au-error);
        font-weight: 700;
    }
    .day {
        align-self: center;
        margin: var(--au-s2) 0 0;
        color: var(--au-muted);
    }
    .msg {
        max-width: 82%;
        align-self: flex-start;
        padding: var(--au-s2) var(--au-s3) 6px;
        background: var(--au-bg-alt);
    }
    .msg--mine {
        align-self: flex-end;
        background: var(--au-bg-alt-shade);
    }
    .msg__text {
        white-space: pre-wrap;
        overflow-wrap: anywhere;
        user-select: text;
    }
    .msg__time {
        margin-top: 2px;
        color: var(--au-muted);
        text-align: right;
    }
    .msg__link {
        padding: 0;
        border: 0;
        background: transparent;
        color: var(--au-action);
        font: inherit;
        text-decoration: underline;
        text-align: left;
        overflow-wrap: anywhere;
        cursor: pointer;
    }
    .msg__img {
        display: block;
        padding: 0;
        border: 0;
        background: transparent;
        cursor: pointer;
    }
    .msg__img img {
        max-height: 200px;
    }
    .compose {
        padding: var(--au-s2) var(--au-s3) var(--au-s1);
    }
    .compose__row {
        display: flex;
        align-items: flex-end;
        gap: var(--au-s2);
    }
    .compose__input {
        flex: 1;
        min-width: 0;
        height: 44px;
        max-height: 120px;
        padding: 9px var(--au-s3);
        border: 2px solid var(--au-input-border);
        background: var(--au-input-bg);
        color: var(--au-input-text);
        font: inherit;
        font-size: var(--au-fs-xs);
        resize: none;
    }
    .compose__input:focus {
        outline: 3px solid var(--au-focus);
        outline-offset: 0;
        box-shadow: inset 0 0 0 2px var(--au-ink);
    }
    .compose__input::placeholder {
        color: var(--au-input-placeholder);
    }
    .compose__err {
        margin: 0 0 var(--au-s2);
        color: var(--au-error);
        font-weight: 700;
    }
</style>
