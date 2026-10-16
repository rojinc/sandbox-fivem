<script>
    import { Button } from '@sandbox/ui-kit';
    import AppPage from '../../components/common/AppPage.svelte';
    import { phone } from '../../state/phone.svelte.js';
    import { call } from '../../state/call.svelte.js';
    import { openApp, home } from '../../state/router.svelte.js';
    import { maskPhone, fullPhone } from '../../lib/format.js';
    import { contactList, callNumber } from '../../lib/contacts.js';

    /** Keypad: type or tap a number, see who it is, call it. In limited mode it is the whole phone. */
    let { app } = $props();

    let digits = $state('');
    let error = $state('');
    let busy = $state(false);

    const shown = $derived(maskPhone(digits));
    const match = $derived(
        !phone.limited && digits.length >= 3 ? (contactList().find((c) => String(c.number ?? '').replace(/\D/g, '').startsWith(digits)) ?? null) : null,
    );

    function press(d) {
        error = '';
        if (digits.length < 10) digits += d;
    }
    function del() {
        error = '';
        digits = digits.slice(0, -1);
    }
    async function dial() {
        const number = fullPhone(digits);
        if (!number) {
            error = 'Enter all 10 digits of the number, for example 555-010-0100.';
            return;
        }
        if (call.current) {
            error = 'You are already on a call. End it first.';
            return;
        }
        busy = true;
        const ok = await callNumber(number);
        busy = false;
        if (ok) digits = '';
    }

    // Typing on the keyboard works too, unless a text field has focus.
    $effect(() => {
        const onKey = (e) => {
            if (e.target instanceof HTMLElement && e.target.closest('input, textarea, select')) return;
            if (/^[0-9]$/.test(e.key)) press(e.key);
            else if (e.key === 'Backspace') del();
            else if (e.key === 'Enter') dial();
            else return;
            e.preventDefault();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    });

    const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
</script>

<AppPage title={app?.label ?? 'Phone'} backable={!phone.limited} onback={home}>
    {#snippet actions()}
        {#if !phone.limited}
            <Button variant="tertiary" size="sm" onclick={() => openApp('phone', 'recent')}>Recent calls</Button>
        {/if}
    {/snippet}

    <div class="dial">
        <div class="dial__display">
            <output class="dial__number au-mono" class:is-empty={!digits} aria-live="polite">{shown || 'Enter a number'}</output>
            <div class="dial__who">
                {#if phone.limited}
                    You can only make calls from this phone.
                {:else if match}
                    <strong>{match.name}</strong>
                {:else if digits.length === 10}
                    Not in your contacts
                {:else}
                    &nbsp;
                {/if}
            </div>
        </div>

        {#if error}<p class="dial__error" role="alert"><span class="au-hidden">Error:</span> {error}</p>{/if}

        <div class="dial__keys">
            {#each KEYS as k (k)}
                <button type="button" class="key" onclick={() => press(k)}>{k}</button>
            {/each}
            <button type="button" class="key key--text" onclick={() => ((digits = ''), (error = ''))} disabled={!digits}>Clear</button>
            <button type="button" class="key" onclick={() => press('0')}>0</button>
            <button type="button" class="key key--text" onclick={del} disabled={!digits}>Delete</button>
        </div>

        <Button size="lg" block icon="phone" loading={busy} onclick={dial}>Call</Button>
    </div>
</AppPage>

<style>
    .dial {
        display: flex;
        flex-direction: column;
        gap: var(--au-s4);
        padding: var(--au-s4);
    }
    .dial__display {
        min-height: 76px;
    }
    .dial__number {
        display: block;
        font-size: 30px;
        font-weight: 700;
        line-height: 1.3;
        min-height: 40px;
        white-space: nowrap;
    }
    .dial__number.is-empty {
        color: var(--au-muted);
        font-family: var(--au-font);
        font-size: var(--au-fs-md);
        font-weight: 400;
        line-height: 40px;
    }
    .dial__who {
        color: var(--au-muted);
        font-size: var(--au-fs-xs);
        min-height: 24px;
    }
    .dial__who strong {
        color: var(--au-text);
    }
    .dial__error {
        margin: 0;
        padding: var(--au-s2) var(--au-s3);
        background: var(--au-error-bg);
        color: var(--au-error);
        font-weight: 700;
        font-size: var(--au-fs-xs);
    }
    .dial__keys {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: var(--au-s2);
    }
    .key {
        height: 56px;
        border: 0;
        background: var(--au-bg-alt);
        color: var(--au-text);
        box-shadow: 0 3px 0 var(--au-border);
        margin-bottom: 3px;
        font: inherit;
        font-size: 24px;
        font-weight: 700;
        font-variant-numeric: tabular-nums;
        cursor: pointer;
    }
    .key--text {
        font-size: var(--au-fs-xs);
    }
    .key:hover {
        background: var(--au-bg-alt-shade);
    }
    .key:active {
        transform: translateY(3px);
        box-shadow: none;
    }
    .key:focus-visible {
        outline: 3px solid transparent;
        background: var(--au-focus);
        color: var(--au-on-focus);
        box-shadow: 0 3px 0 var(--au-on-focus);
    }
    .key:disabled {
        color: var(--au-muted);
        cursor: default;
        opacity: 0.6;
    }
</style>
