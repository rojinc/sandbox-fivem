<script>
    import { onMount } from 'svelte';
    import { fetchNui } from '@sandbox/ui-kit/nui';
    import Dialer from './Dialer.svelte';
    import CallScreen from './CallScreen.svelte';
    import Recents from './Recents.svelte';
    import { data } from '../../state/data.svelte.js';
    import { call } from '../../state/call.svelte.js';
    import { openApp } from '../../state/router.svelte.js';

    /** Phone: keypad (root), recent calls, and the call screen. */
    let { app, segs = [] } = $props();

    onMount(() => {
        if (segs.length) return;
        // Opening Phone while a call is up shows that call (old behaviour); unread missed calls are marked read.
        if (call.current && call.current.state !== 1) openApp('phone', `call/${encodeURIComponent(call.current.number)}`);
        const calls = Array.isArray(data.calls) ? data.calls : [];
        if (calls.some((c) => c && c.unread)) {
            fetchNui('ReadCalls', null);
            for (const c of calls) if (c?.unread) c.unread = false;
        }
    });
</script>

{#if segs[0] === 'call'}
    <CallScreen number={segs[1] ?? call.current?.number ?? ''} />
{:else if segs[0] === 'recent'}
    <Recents />
{:else}
    <Dialer {app} />
{/if}
