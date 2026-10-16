<script>
    import { onMount, tick } from 'svelte';
    import { Button, Field, Spinner, TextInput } from '@sandbox/ui-kit';
    import { fetchNui } from '@sandbox/ui-kit/nui';
    import AppPage from '../../components/common/AppPage.svelte';
    import Sheet from '../../components/common/Sheet.svelte';
    import { data } from '../../state/data.svelte.js';
    import { chatter } from '../../state/misc.svelte.js';
    import { openApp, navigate } from '../../state/router.svelte.js';
    import { showAlert } from '../../state/notify.svelte.js';
    import { toMs, clockTime, longDate, stamp, plain } from '../../lib/format.js';
    import { copyText, splitLinks } from '../../lib/clipboard.js';

    /** One group chat. Members are anonymous: your own messages sit on the right. */
    let { group, id } = $props();

    const MAX = 256;
    const sid = $derived(data.player?.SID);
    const own = $derived(group ? String(group.owner) === String(sid) : false);

    let list = $state([]);
    let total = $state(0);
    let loading = $state(true);
    let failed = $state(false);
    let text = $state('');
    let sending = $state(false);
    let sendError = $state('');
    let body = $state();
    let options = $state(false);
    let inviting = $state(false);
    let inviteSid = $state('');
    let inviteError = $state('');
    let confirm = $state(null); // 'leave' | 'delete'

    const ordered = $derived(list.slice().sort((a, b) => toMs(a.timestamp) - toMs(b.timestamp)));
    const hasMore = $derived(list.length < total);
    const dayOf = (t) => new Date(toMs(t)).toDateString();

    async function scrollEnd() {
        await tick();
        if (body) body.scrollTop = body.scrollHeight;
    }

    async function load(older = false) {
        loading = true;
        failed = false;
        try {
            if (!older) total = Number(await fetchNui('Chatter:GetMessageCount', Number(id))) || 0;
            const res = total > 0 ? await fetchNui('Chatter:LoadMessages', { channel: Number(id), offset: older ? list.length : 0 }) : [];
            if (res === false) throw new Error('load');
            const rows = Array.isArray(res) ? res : Object.values(res ?? {});
            list = older ? [...list, ...rows] : rows;
            if (!older) scrollEnd();
        } catch {
            failed = true;
        }
        loading = false;
    }

    let seen = 0;
    onMount(() => {
        seen = chatter.messages[id]?.length ?? 0;
        load();
    });

    // New messages Lua pushed for this group while it is open.
    $effect(() => {
        const incoming = chatter.messages[id] ?? [];
        if (incoming.length > seen) {
            const fresh = incoming.slice(seen).filter((m) => String(m.author) !== String(sid));
            seen = incoming.length;
            if (fresh.length) {
                list = [...list, ...fresh];
                total += fresh.length;
                scrollEnd();
            }
        }
    });

    async function send(e) {
        e?.preventDefault();
        const message = text.trim();
        if (!message || sending) return;
        sending = true;
        sendError = '';
        try {
            const res = await fetchNui('Chatter:SendMessage', { channel: Number(id), message: message.slice(0, MAX) });
            if (res) {
                list = [...list, { id: res, message, author: sid, timestamp: Math.floor(Date.now() / 1000) }];
                total += 1;
                if (group) group.last_message = Math.floor(Date.now() / 1000);
                text = '';
                scrollEnd();
            } else sendError = 'Your message was not sent. Try again.';
        } catch {
            sendError = 'Your message was not sent. Try again.';
        }
        sending = false;
    }

    async function invite(e) {
        e?.preventDefault();
        const target = String(inviteSid).trim();
        if (!/^\d{1,6}$/.test(target)) {
            inviteError = 'Enter a State ID, for example 4021.';
            return;
        }
        try {
            const ok = await fetchNui('Chatter:Invite:Send', { channel: Number(id), sid: target });
            showAlert(ok ? 'Invite sent' : 'The invite was not sent. Check the State ID.', ok ? 'success' : 'error');
            if (ok) {
                inviting = false;
                inviteSid = '';
            }
        } catch {
            showAlert('The invite was not sent. Try again.', 'error');
        }
    }

    async function leaveOrDelete() {
        const kind = confirm;
        confirm = null;
        try {
            const ok = await fetchNui(kind === 'delete' ? 'Chatter:DeleteGroup' : 'Chatter:LeaveGroup', Number(id));
            if (ok) {
                chatter.groups = chatter.groups.filter((g) => String(g.id) !== String(id));
                showAlert(kind === 'delete' ? 'Group deleted' : 'You left the group', 'success');
                navigate('/apps/chatter', { replace: true });
            } else showAlert('That did not work. Try again.', 'error');
        } catch {
            showAlert('That did not work. Try again.', 'error');
        }
    }

    function copy(url) {
        const ok = copyText(url);
        showAlert(ok ? 'Link copied' : 'The link could not be copied.', ok ? 'neutral' : 'error');
    }
</script>

<AppPage title={group ? plain(group.label) : 'Group'} bind:bodyEl={body}>
    {#snippet actions()}
        {#if group}<Button size="sm" variant="tertiary" onclick={() => (options = true)}>Options</Button>{/if}
    {/snippet}

    {#if !group}
        <div class="ph-pad">
            <p>This group was deleted, or you are no longer in it.</p>
            <Button variant="secondary" onclick={() => openApp('chatter')}>See your groups</Button>
        </div>
    {:else}
        <div class="chat">
            {#if hasMore && !loading}<Button size="sm" variant="tertiary" onclick={() => load(true)}>Show earlier messages</Button>{/if}
            {#if loading && !list.length}
                <p class="state"><Spinner size={18} /> Loading messages</p>
            {:else if failed && !list.length}
                <p class="state state--err" role="alert">Messages could not be loaded.</p>
                <Button size="sm" variant="secondary" onclick={() => load()}>Try again</Button>
            {:else if !list.length}
                <p class="state">No messages yet. Say hello below; nobody sees who wrote what.</p>
            {/if}
            {#each ordered as m, i (m.id ?? `${m.timestamp}-${i}`)}
                {#if i === 0 || dayOf(m.timestamp) !== dayOf(ordered[i - 1].timestamp)}
                    <div class="day">{longDate(m.timestamp)}</div>
                {/if}
                <div class="msg" class:msg--mine={String(m.author) === String(sid)} title={stamp(m.timestamp)}>
                    <div class="msg__text">
                        {#each splitLinks(m.message) as part, j (j)}
                            {#if part.url}<button type="button" class="msg__link" onclick={() => copy(part.url)}>{part.url}</button>{:else}{part.text}{/if}
                        {/each}
                    </div>
                    <div class="msg__time ph-num">{clockTime(m.timestamp)}</div>
                </div>
            {/each}
        </div>
    {/if}

    {#snippet footer()}
        {#if group}
            <form class="compose" onsubmit={send}>
                {#if sendError}<p class="compose__err" role="alert"><span class="au-hidden">Error:</span> {sendError}</p>{/if}
                <label class="au-hidden" for="ch-text">Message to {plain(group.label)}</label>
                <div class="compose__row">
                    <input id="ch-text" class="compose__input" maxlength={MAX} placeholder="Write a message" bind:value={text} autocomplete="off" />
                    <Button type="submit" loading={sending}>Send</Button>
                </div>
            </form>
        {/if}
    {/snippet}
</AppPage>

<Sheet open={options} title={group ? plain(group.label) : ''} onclose={() => (options = false)}>
    {#snippet actions()}
        <Button variant="secondary" onclick={() => ((options = false), (inviting = true), (inviteError = ''))}>Invite someone</Button>
        {#if own}
            <Button variant="secondary" onclick={() => ((options = false), openApp('chatter', `config/${id}`))}>Group settings</Button>
            <Button variant="danger" onclick={() => ((options = false), (confirm = 'delete'))}>Delete group</Button>
        {:else}
            <Button variant="danger" onclick={() => ((options = false), (confirm = 'leave'))}>Leave group</Button>
        {/if}
    {/snippet}
</Sheet>

<Sheet open={inviting} title="Invite someone" onclose={() => (inviting = false)}>
    <form id="ch-invite" onsubmit={invite} novalidate>
        <Field label="State ID" hint="They get an invite in Chatter" id="ch-sid" error={inviteError}>
            <TextInput id="ch-sid" bind:value={inviteSid} inputmode="numeric" maxlength="6" width="50%" block={false} invalid={Boolean(inviteError)} />
        </Field>
    </form>
    {#snippet actions()}
        <Button type="submit" form="ch-invite">Send invite</Button>
        <Button variant="secondary" onclick={() => (inviting = false)}>Cancel</Button>
    {/snippet}
</Sheet>

<Sheet open={Boolean(confirm)} title={confirm === 'delete' ? 'Delete this group?' : 'Leave this group?'} onclose={() => (confirm = null)}>
    <p>{confirm === 'delete' ? 'Every member loses the group and its messages.' : 'You need a new invite to come back.'}</p>
    {#snippet actions()}
        <Button variant="danger" onclick={leaveOrDelete}>{confirm === 'delete' ? 'Delete group' : 'Leave group'}</Button>
        <Button variant="secondary" onclick={() => (confirm = null)}>Stay</Button>
    {/snippet}
</Sheet>

<style>
    .chat {
        display: flex;
        flex-direction: column;
        gap: var(--au-s2);
        min-height: 100%;
        justify-content: flex-end;
        padding: var(--au-s3) var(--au-s3) var(--au-s4);
    }
    .state {
        display: flex;
        align-items: center;
        gap: var(--au-s2);
        margin: 0;
        color: var(--au-muted);
    }
    .state--err {
        color: var(--au-error);
        font-weight: 700;
    }
    .day {
        align-self: center;
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
        overflow-wrap: anywhere;
        cursor: pointer;
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
        padding: 0 var(--au-s3);
        border: 2px solid var(--au-input-border);
        background: var(--au-input-bg);
        color: var(--au-input-text);
        font: inherit;
        font-size: var(--au-fs-xs);
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
