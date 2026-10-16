<script>
    import { TIPS } from '../lib/tips.js';

    /** Rules and tips as plain text on the photo, one at a time on a timer. Nothing to click. */
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
    <aside class="tip au-overworld" aria-label="Rules and tips">
        {#key index}
            <div class="tip__body">
                <h3 class="tip__title">{tip.title}</h3>
                <p class="tip__text">{tip.body}</p>
            </div>
        {/key}
    </aside>
{/if}

<style>
    .tip {
        width: 480px;
        flex-shrink: 0;
    }
    .tip__body {
        animation: au-fade-in var(--au-normal) var(--au-ease);
    }
    .tip__title {
        margin: 0 0 4px;
        font-size: var(--au-fs-sm);
        font-weight: 700;
        line-height: 24px;
    }
    .tip__text {
        margin: 0;
        max-width: none;
        font-size: var(--au-fs-xs);
        line-height: 24px;
        color: var(--au-muted);
    }
</style>
