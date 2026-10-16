<script>
    import { Button } from '@sandbox/ui-kit';
    import AppPage from '../../components/common/AppPage.svelte';
    import Avatar from '../../components/common/Avatar.svelte';
    import { call, acceptCall, hangUp } from '../../state/call.svelte.js';
    import { clock } from '../../state/clock.svelte.js';
    import { phone } from '../../state/phone.svelte.js';
    import { back, home, openApp } from '../../state/router.svelte.js';
    import { findContact } from '../../lib/contacts.js';
    import { elapsed } from '../../lib/format.js';

    /** One call: who, its state and the controls for it. */
    let { number = '' } = $props();

    const c = $derived(call.current);
    const hidden = $derived(Boolean(c?.limited) || (!c && Boolean(call.ended?.limited)));
    const contact = $derived(hidden || phone.limited ? null : findContact(number));
    const name = $derived(hidden ? 'Unknown number' : (contact?.name ?? number));
    const status = $derived.by(() => {
        if (!c) return 'Call ended';
        if (c.state === 0) return 'Calling';
        if (c.state === 1) return 'Incoming call';
        return `Connected ${elapsed(c.start ?? clock.now, clock.now)}`;
    });

    // When the call ends, show "Call ended" for a moment, then leave (old behaviour).
    $effect(() => {
        if (c) return undefined;
        const t = setTimeout(() => (phone.limited ? home() : back()), 2500);
        return () => clearTimeout(t);
    });

    let ending = $state(false);
    function end() {
        if (!c || ending) return;
        ending = true;
        hangUp();
        setTimeout(() => (ending = false), 1500);
    }
</script>

<AppPage title="Call" backable={!phone.limited}>
    <div class="call">
        <div class="call__who">
            <Avatar name={contact?.name ?? ''} src={contact?.avatar ?? ''} mark={contact ? '' : '#'} size={72} />
            <div class="call__text">
                <h2 class="call__name">{name}</h2>
                {#if !hidden && contact}<div class="call__number au-mono">{number}</div>{/if}
                <div class="call__status ph-num" aria-live="polite">{status}</div>
            </div>
        </div>

        <div class="call__actions">
            {#if c?.state === 1}
                <Button size="lg" block icon="phone" onclick={acceptCall}>Answer</Button>
                <Button size="lg" block variant="danger" icon="phone-off" onclick={end}>Decline</Button>
            {:else if c}
                <Button size="lg" block variant="danger" icon="phone-off" loading={ending} onclick={end}>End call</Button>
            {:else if !phone.limited}
                <Button size="lg" block variant="secondary" onclick={() => openApp('phone')}>Back to keypad</Button>
            {/if}
        </div>
    </div>
</AppPage>

<style>
    .call {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        height: 100%;
        padding: var(--au-s6) var(--au-s4) var(--au-s5);
    }
    .call__who {
        display: flex;
        align-items: center;
        gap: var(--au-s4);
    }
    .call__text {
        min-width: 0;
    }
    .call__name {
        margin: 0;
        font-size: var(--au-fs-md);
        overflow-wrap: anywhere;
    }
    .call__number {
        font-size: var(--au-fs-xs);
    }
    .call__status {
        margin-top: var(--au-s1);
        color: var(--au-muted);
        font-size: var(--au-fs-xs);
    }
    .call__actions {
        display: flex;
        flex-direction: column;
        gap: var(--au-s3);
    }
</style>
