<script>
    import { Callout, Kbd } from '@sandbox/ui-kit';
    import { TIPS } from '../lib/tips.js';

    /** Rules and tips, one at a time, advancing on a timer. Nothing to click. */
    let { tips = TIPS, interval = 9000 } = $props();
    let index = $state(0);

    $effect(() => {
        if (tips.length < 2) return undefined;
        const timer = setInterval(() => (index = (index + 1) % tips.length), interval);
        return () => clearInterval(timer);
    });

    const tip = $derived(tips[index % tips.length]);
</script>

{#if tip}
    <aside class="tips au-light" aria-label="Rules and tips">
        <div class="tips__head">
            <span class="tips__kind">{tip.kind ?? 'Tip'}</span>
            <span class="tips__count au-mono">{index + 1} of {tips.length}</span>
        </div>
        {#key index}
            <Callout title={tip.title}>
                <p>{tip.body}</p>
                {#if tip.keys?.length}
                    <ul class="tips__keys">
                        {#each tip.keys as [key, label] (key + label)}
                            <li><Kbd>{key}</Kbd><span>{label}</span></li>
                        {/each}
                    </ul>
                {/if}
            </Callout>
        {/key}
    </aside>
{/if}

<style>
    .tips {
        width: 440px;
        padding: 16px;
        border: 1px solid var(--au-border);
        border-radius: var(--au-radius);
        background: var(--au-bg);
        color: var(--au-text);
        box-shadow: var(--au-shadow-1);
    }
    .tips__head {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 12px;
        font-size: var(--au-fs-xs);
    }
    .tips__kind {
        font-weight: 700;
    }
    .tips__count {
        color: var(--au-hint);
    }
    .tips :global(.au-callout) {
        margin: 0;
    }
    .tips :global(.au-callout__title) {
        font-size: var(--au-fs-sm);
    }
    .tips :global(.au-callout__body p) {
        font-size: var(--au-fs-xs);
        max-width: none;
    }
    .tips__keys {
        display: flex;
        flex-wrap: wrap;
        gap: 8px 20px;
        margin: 12px 0 0;
        padding: 0;
        list-style: none;
        font-size: var(--au-fs-xs);
    }
    .tips__keys li {
        display: inline-flex;
        align-items: center;
        gap: 8px;
    }
</style>
