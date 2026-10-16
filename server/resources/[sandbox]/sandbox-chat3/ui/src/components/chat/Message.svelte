<script>
    import { Tag } from '@sandbox/ui-kit';
    import { kindOf } from '../../lib/kinds.js';
    import { isCfxMessage, renderCfxMessage, rgbString } from '../../lib/template.js';
    import { chatHtml, escapeHtml, looksLikeHtml } from '../../lib/html.js';
    import { colorize } from '../../lib/colorize.js';
    import { formatTime } from '../../lib/format.js';

    /**
     * One line of the log: a sandbox-format message (channel tag, author, body)
     * or a stock cfx message (template + args, optional colour as a left rule).
     */
    let { message, templates } = $props();

    const cfx = $derived(isCfxMessage(message));
    const kind = $derived(kindOf(message.type));

    /** Author line for the sandbox kinds: name, state id, phone, reply target. */
    const author = $derived.by(() => {
        const a = message.author;
        if (!a || typeof a !== 'object') return { name: null, meta: null };
        if (a.Anonymous) return { name: 'Anonymous', meta: a.SID !== undefined ? `#${a.SID}` : null };
        const bits = [];
        if (a.SID !== undefined) bits.push(`#${a.SID}`);
        if (a.Phone) bits.push(String(a.Phone));
        if (a.Reply !== undefined) bits.push(`to #${a.Reply}`);
        return { name: [a.First, a.Last].filter(Boolean).join(' ') || null, meta: bits.join(' · ') || null };
    });

    // Body as sanitised HTML. Plain-text kinds are escaped first so a "<b>" typed by a player stays text.
    const html = $derived.by(() => {
        if (cfx) return chatHtml(renderCfxMessage(message, templates));
        const text = String(message.message ?? '').trim();
        return chatHtml(colorize(kind.html && looksLikeHtml(text) ? text : escapeHtml(text)));
    });
    const tint = $derived(cfx ? rgbString(message.color) : null);
</script>

<div class="msg" style={tint ? `border-left-color:${tint}` : undefined}>
    <div class="msg__line">
        {#if !cfx}
            <Tag tone={kind.tone} solid={kind.solid}>{kind.label}</Tag>
            {#if author.name}<span class="msg__name">{author.name}</span>{/if}
            {#if author.meta}<span class="msg__meta au-mono au-muted">{author.meta}</span>{/if}
        {/if}
        <span class="msg__body" class:msg__body--pre={!cfx || Boolean(message.multiline)}>{@html html}</span>
    </div>
    <span class="msg__time au-mono au-muted">{formatTime(message.receivedAt)}</span>
</div>

<style>
    .msg {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        column-gap: 12px;
        align-items: start;
        padding: 6px 12px 6px 9px;
        border-left: 3px solid transparent;
        border-bottom: 1px solid var(--au-bg-alt);
        font-size: var(--au-fs-xs);
        line-height: var(--au-lh);
    }
    .msg:last-child {
        border-bottom: 0;
    }
    .msg__line {
        min-width: 0;
        overflow-wrap: anywhere;
    }
    .msg__line :global(.au-tag) {
        margin-right: 6px;
        padding: 0 6px;
        line-height: 1.25;
        vertical-align: 1px;
    }
    .msg__name {
        font-weight: 700;
        margin-right: 6px;
    }
    .msg__meta {
        margin-right: 8px;
    }
    .msg__body--pre {
        white-space: pre-wrap;
    }
    .msg__body :global(b),
    .msg__body :global(strong) {
        font-weight: 700;
    }
    .msg__body :global(pre) {
        margin: 2px 0 0;
        font-family: var(--au-font-mono);
        font-size: var(--au-fs-xs);
        white-space: pre-wrap;
    }
    .msg__body :global(p) {
        margin: 0;
    }
    .msg__body :global(img) {
        display: inline-block;
        max-width: 100%;
        vertical-align: middle;
        border-radius: var(--au-radius);
    }
    .msg__time {
        font-size: var(--au-fs-xs);
        white-space: nowrap;
    }
</style>
