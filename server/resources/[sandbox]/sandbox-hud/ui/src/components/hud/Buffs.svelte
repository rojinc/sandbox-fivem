<script>
    import { Icon } from '@sandbox/ui-kit';
    import { status } from '../../state/status.svelte.js';
    import { clock } from '../../lib/clock.svelte.js';

    /** Remaining fraction for a timed buff: val is the duration in seconds, startTime an epoch in seconds. */
    function timedRemaining(buff, now) {
        const elapsed = Math.floor(now / 1000) - (buff.startTime ?? Math.floor(now / 1000));
        const total = Number(buff.val) || 0;
        if (total <= 0) return 0;
        return Math.max(0, Math.min(1, (total - Math.max(0, elapsed - 1)) / total));
    }

    const items = $derived.by(() =>
        status.buffs
            .map((buff) => {
                const def = buff && status.buffDefs[buff.buff];
                if (!def) return null;
                let fraction = null;
                if (def.type === 'timed') {
                    fraction = timedRemaining(buff, clock.now);
                    if (fraction <= 0) return null;
                } else if (def.type === 'value') {
                    fraction = Math.max(0, Math.min(1, (Number(buff.val) || 0) / 100));
                }
                return { buff, def, fraction };
            })
            .filter(Boolean),
    );
</script>

{#if items.length}
    <div class="buffs">
        {#each items as { buff, def, fraction }, i (`${buff.buff}-${i}`)}
            <div class="buff hud-shadow" title={buff.buff}>
                <span class="buff__icon" style="color:{def.color || 'var(--hud-white)'}">
                    {#if buff.override}
                        <span class="buff__text hud-text" class:is-long={String(buff.override).length > 2}>{buff.override}</span>
                    {:else}
                        <Icon icon={def.icon} />
                    {/if}
                </span>
                <span class="buff__track">
                    <span class="buff__fill" style="width:{(fraction ?? 1) * 100}%;background:{def.color || 'var(--hud-white)'}"></span>
                </span>
            </div>
        {/each}
    </div>
{/if}

<style>
    .buffs {
        display: flex;
        flex-wrap: wrap-reverse;
        gap: 0.5em;
        justify-content: flex-end;
    }
    .buff {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.25em;
        width: 1.8em;
    }
    .buff__icon {
        font-size: 1em;
        line-height: 1;
        display: flex;
        height: 1em;
        align-items: center;
    }
    .buff__text {
        font-size: 0.7em;
        font-family: var(--au-font-mono);
    }
    .buff__text.is-long {
        font-size: 0.55em;
    }
    .buff__track {
        width: 100%;
        height: 0.25em;
        border-radius: 999px;
        background: rgba(0, 0, 0, 0.35);
        overflow: hidden;
    }
    .buff__fill {
        display: block;
        height: 100%;
        border-radius: 999px;
        transition: width 500ms linear;
    }
</style>
