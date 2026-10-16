<script>
    import { tick, untrack } from 'svelte';
    import { Button } from '@sandbox/ui-kit';
    import { chat } from '../../state/chat.svelte.js';
    import Message from './Message.svelte';

    /**
     * Scrolling list of messages. Sticks to the newest line unless the player
     * has scrolled up, in which case a "jump to latest" button appears.
     * scrollBy()/scrollToBottom() serve PageUp / PageDown in the input bar.
     */
    let { interactive = false } = $props();

    const BOTTOM_SLACK = 24;
    let scroller = $state(null);
    let pinned = $state(true);
    let unread = $state(0);
    let lastCount = 0;

    export function scrollToBottom(smooth = false) {
        if (!scroller) return;
        scroller.scrollTo({ top: scroller.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
        pinned = true;
        unread = 0;
    }

    export function scrollBy(delta) {
        if (!scroller) return;
        scroller.scrollTo({ top: scroller.scrollTop + delta, behavior: 'smooth' });
    }

    // New lines: follow them when pinned, count them otherwise.
    $effect(() => {
        const count = chat.messages.length;
        untrack(() => {
            const added = count - lastCount;
            lastCount = count;
            if (count === 0) {
                pinned = true;
                unread = 0;
                return;
            }
            if (added <= 0) return;
            if (pinned) tick().then(() => scrollToBottom());
            else unread += added;
        });
    });

    function onScroll() {
        if (!scroller) return;
        const atBottom = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight <= BOTTOM_SLACK;
        pinned = atBottom;
        if (atBottom) unread = 0;
    }
</script>

<div class="log">
    <div class="log__scroll" bind:this={scroller} onscroll={onScroll} role="log" aria-label="Chat messages">
        {#if chat.messages.length === 0}
            <div class="log__empty au-muted">No messages yet.</div>
        {:else}
            {#each chat.messages as message (message.id)}
                <Message {message} templates={chat.templates} />
            {/each}
        {/if}
    </div>
    {#if interactive && !pinned && unread > 0}
        <div class="log__jump">
            <Button size="sm" icon="arrow-down" onclick={() => scrollToBottom(true)}>{unread} new</Button>
        </div>
    {/if}
</div>

<style>
    .log {
        position: relative;
    }
    .log__scroll {
        max-height: 320px;
        overflow-y: auto;
        overflow-x: hidden;
        overscroll-behavior: contain;
        scrollbar-gutter: stable;
    }
    .log__empty {
        padding: 8px 12px;
        font-size: var(--au-fs-xs);
    }
    .log__jump {
        position: absolute;
        left: 50%;
        bottom: 8px;
        transform: translateX(-50%);
    }
</style>
