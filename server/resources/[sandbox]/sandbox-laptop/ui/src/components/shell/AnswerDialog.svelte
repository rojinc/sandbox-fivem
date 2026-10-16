<script>
    import { Modal, Button, RichText } from '@sandbox/ui-kit';
    import { fetchNui } from '@sandbox/ui-kit/nui';
    import { notify, needsAnswer, markAnswered } from '../../state/notify.svelte.js';
    import { laptop } from '../../state/laptop.svelte.js';
    import { env } from '../../state/env.svelte.js';
    import { notificationApp } from '../../lib/apps.js';

    /**
     * A notification with accept/cancel actions (team invites, join requests,
     * boosting contract requests) opens as a dialog while the laptop is open.
     * Accept -> AcceptPopup, Decline -> CancelPopup, both { event, data }.
     * Closing the dialog leaves the request unanswered.
     */
    const current = $derived(laptop.visible ? (notify.list.find((n) => needsAnswer(n) && !notify.answered[n._id] && notificationApp(n)) ?? null) : null);
    const app = $derived(current ? notificationApp(current) : null);
    const secondsLeft = $derived(current && current.duration > 0 ? Math.max(0, Math.ceil((current.received + current.duration - env.now) / 1000)) : null);

    function answer(kind) {
        const n = current;
        if (!n) return;
        const event = kind === 'accept' ? n.action.accept : n.action.cancel;
        markAnswered(n._id);
        if (event) fetchNui(kind === 'accept' ? 'AcceptPopup' : 'CancelPopup', { event, data: n.data ?? {} });
    }
</script>

{#if current}
    <Modal title={current.title || 'Request'} eyebrow={app?.label} onclose={() => markAnswered(current._id)} closeLabel="Close without answering" width="480px">
        {#if current.description}
            <RichText text={current.description} tag="p" class="answer__text" />
        {/if}
        {#if secondsLeft !== null}
            <p class="answer__time au-muted">This request ends in {secondsLeft} {secondsLeft === 1 ? 'second' : 'seconds'}.</p>
        {/if}
        {#snippet actions()}
            {#if current.action.cancel}<Button variant="secondary" onclick={() => answer('cancel')}>Decline</Button>{/if}
            {#if current.action.accept}<Button onclick={() => answer('accept')}>Accept</Button>{/if}
        {/snippet}
    </Modal>
{/if}

<style>
    :global(.answer__text) {
        margin: 0 0 var(--au-s3);
    }
    .answer__time {
        margin: 0;
    }
</style>
