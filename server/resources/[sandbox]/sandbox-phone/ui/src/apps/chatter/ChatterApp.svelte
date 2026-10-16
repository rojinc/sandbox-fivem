<script>
    import { Button, EmptyState, Field, TextInput } from '@sandbox/ui-kit';
    import { fetchNui } from '@sandbox/ui-kit/nui';
    import AppPage from '../../components/common/AppPage.svelte';
    import Avatar from '../../components/common/Avatar.svelte';
    import Sheet from '../../components/common/Sheet.svelte';
    import ChatterChannel from './ChatterChannel.svelte';
    import { data } from '../../state/data.svelte.js';
    import { chatter } from '../../state/misc.svelte.js';
    import { openApp, navigate } from '../../state/router.svelte.js';
    import { showAlert } from '../../state/notify.svelte.js';
    import { clock } from '../../state/clock.svelte.js';
    import { when, toMs, plain } from '../../lib/format.js';

    /**
     * Chatter: anonymous group chats. Root lists your groups; channel/:id is one
     * group; invites (and join/:id) answers invites; config/:id renames a group.
     */
    let { app, segs = [] } = $props();

    const sid = $derived(data.player?.SID);
    const groups = $derived(chatter.groups.slice().sort((a, b) => toMs(b.last_message ?? b.joined_date ?? 0) - toMs(a.last_message ?? a.joined_date ?? 0)));
    const invites = $derived(Object.values(chatter.invites ?? {}).filter(Boolean));
    const group = $derived(segs[1] ? (chatter.groups.find((g) => String(g.id) === String(segs[1])) ?? null) : null);

    /* new group */
    let creating = $state(false);
    let label = $state('');
    let labelError = $state('');
    async function create(e) {
        e?.preventDefault();
        const l = label.trim();
        if (!l) {
            labelError = 'Enter a name for the group.';
            return;
        }
        try {
            const res = await fetchNui('Chatter:CreateGroup', { label: l.slice(0, 32) });
            if (res?.id !== undefined) {
                chatter.groups.push({ id: res.id, label: l.slice(0, 32), create_date: res.create_date, owner: sid, joined_date: res.create_date, last_message: null, icon: null });
                creating = false;
                label = '';
                showAlert('Group created', 'success');
                openApp('chatter', `channel/${res.id}`);
            } else showAlert('The group could not be created. Try again.', 'error');
        } catch {
            showAlert('The group could not be created. Try again.', 'error');
        }
    }

    /* invites */
    async function accept(inv) {
        try {
            const g = await fetchNui('Chatter:Invite:Accept', inv.group);
            if (g) {
                delete chatter.invites[inv.group];
                if (typeof g === 'object' && !chatter.groups.some((x) => x.id == g.id)) chatter.groups.push(g);
                showAlert(`You joined ${plain(inv.label)}`, 'success');
                navigate(`/apps/chatter/channel/${inv.group}`, { replace: true });
            } else showAlert('That invite has expired.', 'error');
        } catch {
            showAlert('The invite could not be accepted. Try again.', 'error');
        }
    }
    async function decline(inv) {
        try {
            const ok = await fetchNui('Chatter:Invite:Decline', inv.group);
            if (ok) {
                delete chatter.invites[inv.group];
                showAlert('Invite declined');
            } else showAlert('The invite could not be declined. Try again.', 'error');
        } catch {
            showAlert('The invite could not be declined. Try again.', 'error');
        }
    }

    /* config */
    let cLabel = $state('');
    let cIcon = $state('');
    let cErrors = $state({});
    $effect.pre(() => {
        if (segs[0] === 'config' && group) {
            cLabel = group.label ?? '';
            cIcon = group.icon ?? '';
        }
    });
    async function saveConfig(e) {
        e.preventDefault();
        const next = {};
        if (!cLabel.trim()) next.label = 'Enter a name for the group.';
        if (cIcon.trim() && !/^https:\/\/\S+$/i.test(cIcon.trim())) next.icon = 'Enter a link that starts with https://, or leave it empty.';
        cErrors = next;
        if (Object.keys(next).length) return;
        const patch = { label: cLabel.trim().slice(0, 32), icon: cIcon.trim() || null };
        try {
            const ok = await fetchNui('Chatter:UpdateGroup', { channel: group.id, data: patch });
            if (ok) {
                Object.assign(group, patch);
                showAlert('Group updated', 'success');
                navigate(`/apps/chatter/channel/${group.id}`, { replace: true });
            } else showAlert('The group could not be updated. Try again.', 'error');
        } catch {
            showAlert('The group could not be updated. Try again.', 'error');
        }
    }
</script>

{#if segs[0] === 'channel'}
    {#key segs[1]}<ChatterChannel {group} id={segs[1]} />{/key}
{:else if segs[0] === 'invites' || segs[0] === 'join'}
    <AppPage title="Group invites">
        {#if invites.length}
            <ul class="ph-list">
                {#each invites as inv (inv.group)}
                    <li class="inv" class:is-selected={segs[0] === 'join' && String(segs[1]) === String(inv.group)}>
                        <div class="inv__text">
                            <strong>{plain(inv.label)}</strong>
                            <span class="au-muted">Invited {when(inv.timestamp, clock.now)}</span>
                        </div>
                        <div class="inv__actions">
                            <Button size="sm" onclick={() => accept(inv)}>Join group</Button>
                            <Button size="sm" variant="secondary" onclick={() => decline(inv)}>Decline</Button>
                        </div>
                    </li>
                {/each}
            </ul>
        {:else}
            <EmptyState title="No invites">When someone invites you to a group, it shows here.</EmptyState>
        {/if}
    </AppPage>
{:else if segs[0] === 'config'}
    <AppPage title="Group settings">
        {#if group && String(group.owner) === String(sid)}
            <form class="ph-form" onsubmit={saveConfig} novalidate>
                <Field label="Group name" id="ch-label" error={cErrors.label}>
                    <TextInput id="ch-label" bind:value={cLabel} maxlength="32" invalid={Boolean(cErrors.label)} />
                </Field>
                <Field label="Picture link (optional)" id="ch-icon" error={cErrors.icon}>
                    <TextInput id="ch-icon" bind:value={cIcon} autocomplete="off" invalid={Boolean(cErrors.icon)} />
                </Field>
                <Button type="submit">Save group</Button>
            </form>
        {:else}
            <p class="ph-note">Only the person who made this group can change it.</p>
        {/if}
    </AppPage>
{:else}
    <AppPage title={app?.label ?? 'Chatter'}>
        {#snippet actions()}
            <Button size="sm" variant="tertiary" onclick={() => openApp('chatter', 'invites')}>Invites{invites.length ? ` (${invites.length})` : ''}</Button>
            <Button size="sm" variant="secondary" onclick={() => ((creating = true), (labelError = ''))}>New group</Button>
        {/snippet}
        {#if groups.length}
            <ul class="ph-list">
                {#each groups as g (g.id)}
                    <li>
                        <button type="button" class="ph-row" onclick={() => openApp('chatter', `channel/${g.id}`)}>
                            <Avatar name={g.label} src={g.icon} size={40} />
                            <span class="ph-row__main">
                                <span class="ph-row__title">{plain(g.label)}</span>
                                <span class="ph-row__sub">{g.last_message ? `Last message ${when(g.last_message, clock.now)}` : 'No messages yet'}</span>
                            </span>
                            {#if String(g.owner) === String(sid)}<span class="ph-row__side">Yours</span>{/if}
                        </button>
                    </li>
                {/each}
            </ul>
        {:else}
            <EmptyState title="No groups yet">
                Groups are anonymous chats. Make one and invite people by State ID.
                {#snippet actions()}
                    <Button onclick={() => (creating = true)}>Make a group</Button>
                {/snippet}
            </EmptyState>
        {/if}
    </AppPage>

    <Sheet open={creating} title="New group" onclose={() => (creating = false)}>
        <form id="ch-new" onsubmit={create} novalidate>
            <Field label="Group name" hint="Members see this name" id="ch-new-label" error={labelError}>
                <TextInput id="ch-new-label" bind:value={label} maxlength="32" invalid={Boolean(labelError)} />
            </Field>
        </form>
        {#snippet actions()}
            <Button type="submit" form="ch-new">Make group</Button>
            <Button variant="secondary" onclick={() => (creating = false)}>Cancel</Button>
        {/snippet}
    </Sheet>
{/if}

<style>
    .inv {
        padding: var(--au-s3) var(--au-s4);
    }
    .inv.is-selected {
        background: var(--au-bg-alt-shade);
    }
    .inv__text {
        display: flex;
        flex-direction: column;
        margin-bottom: var(--au-s2);
    }
    .inv__actions {
        display: flex;
        gap: var(--au-s2);
    }
</style>
