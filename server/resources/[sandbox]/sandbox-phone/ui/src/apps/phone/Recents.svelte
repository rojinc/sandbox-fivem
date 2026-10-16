<script>
    import { Button, EmptyState } from '@sandbox/ui-kit';
    import AppPage from '../../components/common/AppPage.svelte';
    import Sheet from '../../components/common/Sheet.svelte';
    import { data } from '../../state/data.svelte.js';
    import { openApp } from '../../state/router.svelte.js';
    import { findContact, callNumber } from '../../lib/contacts.js';
    import { when, toMs } from '../../lib/format.js';
    import { formatDuration } from '@sandbox/ui-kit';

    /** Recent calls, newest first. Calls from payphones or hidden numbers cannot be returned. */
    const calls = $derived(
        (Array.isArray(data.calls) ? data.calls : Object.values(data.calls ?? {}))
            .filter(Boolean)
            .filter((c) => !(c.limited && c.method))
            .sort((a, b) => toMs(b.time) - toMs(a.time)),
    );

    function kind(c) {
        const answered = Number(c.duration) > -1;
        if (c.method) return answered ? `Outgoing, ${formatDuration(c.duration)}` : 'Outgoing, not answered';
        return answered ? `Incoming, ${formatDuration(c.duration)}` : 'Missed call';
    }
    const hiddenCaller = (c) => Boolean(c.limited || c.anonymous);

    let picked = $state(null);
    const pickedContact = $derived(picked ? findContact(picked.number) : null);
</script>

<AppPage title="Recent calls">
    {#snippet actions()}
        <Button variant="tertiary" size="sm" onclick={() => openApp('phone')}>Keypad</Button>
    {/snippet}

    {#if calls.length}
        <ul class="ph-list">
            {#each calls as c, i (c.id ?? `${c.number}-${c.time}-${i}`)}
                {@const contact = hiddenCaller(c) ? null : findContact(c.number)}
                <li>
                    <button type="button" class="ph-row" disabled={hiddenCaller(c)} onclick={() => (picked = c)}>
                        <span class="ph-row__main">
                            <span class="ph-row__title" class:missed={!c.method && Number(c.duration) <= -1}>{hiddenCaller(c) ? 'Unknown caller' : (contact?.name ?? c.number)}</span>
                            <span class="ph-row__sub">{kind(c)}</span>
                        </span>
                        <span class="ph-row__side">{when(c.time)}</span>
                    </button>
                </li>
            {/each}
        </ul>
    {:else}
        <EmptyState title="No recent calls">
            Calls you make and receive show here.
            {#snippet actions()}
                <Button variant="secondary" onclick={() => openApp('phone')}>Open keypad</Button>
            {/snippet}
        </EmptyState>
    {/if}
</AppPage>

<Sheet open={Boolean(picked)} title={pickedContact?.name ?? picked?.number} onclose={() => (picked = null)}>
    {#if picked}<p class="au-mono">{picked.number}</p>{/if}
    {#snippet actions()}
        <Button
            icon="phone"
            onclick={() => {
                const n = picked.number;
                picked = null;
                callNumber(n);
            }}>Call</Button
        >
        <Button
            variant="secondary"
            onclick={() => {
                const n = picked.number;
                picked = null;
                openApp('messages', `convo/${encodeURIComponent(n)}`);
            }}>Send text</Button
        >
        <Button
            variant="secondary"
            onclick={() => {
                const n = picked.number;
                const ct = pickedContact;
                picked = null;
                openApp('contacts', ct ? `view/${ct.id}` : `caller/${encodeURIComponent(n)}`);
            }}>{pickedContact ? 'View contact' : 'Add to contacts'}</Button
        >
    {/snippet}
</Sheet>

<style>
    .missed {
        color: var(--au-error);
    }
    button.ph-row:disabled {
        cursor: default;
    }
</style>
