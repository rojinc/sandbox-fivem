<script>
    import { phone } from '../../state/phone.svelte.js';
    import { call } from '../../state/call.svelte.js';
    import { share } from '../../state/misc.svelte.js';
    import { hasState } from '../../state/data.svelte.js';
    import { clock } from '../../state/clock.svelte.js';
    import { parse, openApp } from '../../state/router.svelte.js';
    import { elapsed, pad } from '../../lib/format.js';

    /** Clock on the left; call, share and connection status on the right. `overlay` = drawn on the wallpaper. */
    let { overlay = false } = $props();

    const onCallScreen = $derived(parse().app === 'phone' && parse().segs[0] === 'call');
    const callLabel = $derived.by(() => {
        const c = call.current;
        if (!c) return null;
        if (c.state === 0) return 'Calling';
        if (c.state === 1) return 'Incoming call';
        return `On call ${elapsed(c.start ?? clock.now, clock.now)}`;
    });
</script>

<div class="bar" class:bar--overlay={overlay} class:au-overworld={overlay}>
    <span class="bar__time ph-num">{pad(phone.time.hour)}:{pad(phone.time.minute)}</span>
    {#if callLabel && !onCallScreen}
        <button type="button" class="bar__call" onclick={() => openApp('phone', `call/${encodeURIComponent(call.current.number)}`)}>{callLabel}</button>
    {/if}
    <span class="bar__fill"></span>
    {#if share.sharing && !phone.limited}
        <button type="button" class="bar__link" onclick={() => (share.open = true)}>Shared item</button>
    {/if}
    {#if phone.limited}
        <span class="bar__status">Calls only</span>
    {:else}
        {#if hasState('PHONE_VPN')}<span class="bar__status">VPN</span>{/if}
        {#if hasState('RACE_DONGLE')}<span class="bar__status">Race</span>{/if}
    {/if}
</div>

<style>
    .bar {
        display: flex;
        align-items: center;
        gap: var(--au-s3);
        height: 36px;
        padding: 0 var(--au-s5);
        background: var(--au-bg);
        color: var(--au-text);
        font-size: var(--au-fs-xs);
        flex-shrink: 0;
        white-space: nowrap;
    }
    .bar--overlay {
        background: transparent;
    }
    .bar__time {
        font-weight: 700;
    }
    .bar__fill {
        flex: 1;
    }
    .bar__status {
        font-weight: 700;
    }
    .bar__call,
    .bar__link {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        padding: 2px 8px;
        border: 0;
        font: inherit;
        font-weight: 700;
        cursor: pointer;
    }
    .bar__call {
        background: var(--au-success-bg);
        color: var(--au-success);
        font-variant-numeric: tabular-nums;
    }
    .bar__link {
        background: var(--au-info-bg);
        color: var(--au-info);
    }
    .bar__call:focus-visible,
    .bar__link:focus-visible {
        outline: 3px solid var(--au-focus);
        outline-offset: 0;
    }
</style>
