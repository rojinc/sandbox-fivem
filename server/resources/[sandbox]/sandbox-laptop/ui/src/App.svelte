<script>
    import { onKey } from '@sandbox/ui-kit/nui';
    import LaptopDevice from './components/shell/LaptopDevice.svelte';
    import ClosedNotifications from './components/shell/ClosedNotifications.svelte';
    import { laptop, requestClose } from './state/laptop.svelte.js';
    import { sweep } from './state/notify.svelte.js';
    import { env, startEnv } from './state/env.svelte.js';

    startEnv();

    // Escape and F3 close the laptop (the old KeyListener). A dialog takes Escape first.
    onKey(['Escape', 'F3'], () => {
        if (!laptop.visible) return false;
        if (document.querySelector('.au-modal')) return false;
        requestClose();
        return true;
    });

    $effect(() => {
        sweep(env.now);
    });
</script>

<LaptopDevice />
{#if !laptop.visible}
    <ClosedNotifications />
{/if}
