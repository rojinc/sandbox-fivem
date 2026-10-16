<script>
    import { onKey } from '@sandbox/ui-kit/nui';
    import { fetchNui } from '@sandbox/ui-kit/nui';
    import PhoneDevice from './components/shell/PhoneDevice.svelte';
    import { phone, cancelMove } from './state/phone.svelte.js';
    import { data } from './state/data.svelte.js';
    import { closeTopSheet } from './state/sheet.svelte.js';
    import { startClock } from './state/clock.svelte.js';

    startClock();

    // Escape or F3: close the top dialog, leave move mode, or close the phone. Lua drops focus.
    onKey(['Escape', 'F3'], () => {
        if (!phone.visible) return false;
        if (closeTopSheet()) return true;
        if (phone.moving) {
            cancelMove();
            return true;
        }
        phone.visible = false;
        phone.limited = false;
        fetchNui('ClosePhone');
        return true;
    });
</script>

<!-- Nothing shows until Lua has sent the character (as the old phone did). -->
{#if data.player}
    <PhoneDevice />
{/if}
