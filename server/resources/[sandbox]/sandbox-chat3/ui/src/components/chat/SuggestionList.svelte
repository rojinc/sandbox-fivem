<script>
    import { MAX_SHOWN, helpFor } from '../../lib/suggestions.js';

    /**
     * List under the input strip of the commands matching the draft. The first
     * row is what Tab completes; its parameters are listed and the one being
     * typed is highlighted, with that parameter's help.
     */
    let { matches = [], paramIdx = -1 } = $props();

    const shown = $derived(matches.slice(0, MAX_SHOWN));
    const extra = $derived(matches.length - shown.length);
</script>

<div class="sugg" role="listbox" aria-label="Matching commands">
    {#if shown.length === 0}
        <div class="sugg__note au-muted">No matching commands</div>
    {:else}
        {#each shown as s, i (s.name)}
            {@const active = i === 0}
            {@const help = helpFor(s, paramIdx, active)}
            <div class="sugg__row" class:is-active={active} role="option" aria-selected={active}>
                <span class="sugg__name">{s.name}</span>
                {#if active}
                    {#each s.params as p, j (j)}
                        {@const current = paramIdx === j || (paramIdx >= s.params.length && j === s.params.length - 1)}
                        <span class="sugg__param" class:is-current={current}>[{p?.name ?? '?'}]</span>
                    {/each}
                {/if}
                {#if help}<span class="sugg__help au-muted" class:au-truncate={!active}>{help}</span>{/if}
            </div>
        {/each}
        {#if extra > 0}
            <div class="sugg__note au-muted">{extra} more. Keep typing to narrow the list.</div>
        {/if}
    {/if}
</div>

<style>
    .sugg {
        background: var(--au-bg);
        color: var(--au-text);
        border-radius: var(--au-radius);
        box-shadow: var(--au-shadow-2);
        padding: 4px 0;
        font-size: var(--au-fs-xs);
        line-height: var(--au-lh);
    }
    .sugg__row {
        display: flex;
        align-items: baseline;
        gap: 8px;
        min-width: 0;
        padding: 4px 12px 4px 9px;
        border-left: 3px solid transparent;
    }
    .sugg__row.is-active {
        background: var(--au-bg-shade);
        border-left-color: var(--au-action);
    }
    .sugg__name {
        font-weight: 700;
        flex-shrink: 0;
    }
    .sugg__param {
        color: var(--au-muted);
        flex-shrink: 0;
    }
    .sugg__param.is-current {
        color: var(--au-action);
        font-weight: 700;
    }
    .sugg__help {
        flex: 1;
        min-width: 0;
    }
    .sugg__note {
        padding: 4px 12px;
    }
</style>
