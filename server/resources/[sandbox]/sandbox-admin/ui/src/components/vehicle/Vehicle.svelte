<script>
    import { Tabs } from '@sandbox/ui-kit';
    import { nav } from '../../state/nav.svelte.js';
    import CurrentVehicle from './CurrentVehicle.svelte';
    import OwnedVehicles from './OwnedVehicles.svelte';

    const TABS = [
        { id: 'current', label: 'Your vehicle' },
        { id: 'owned', label: 'Owned vehicles' },
    ];
</script>

<div class="vehicle">
    <div class="tabs"><Tabs items={TABS} bind:active={nav.vehicleView} label="Vehicle views" /></div>
    <div class="body">
        {#if nav.vehicleView === 'owned'}
            <OwnedVehicles />
        {:else}
            <CurrentVehicle />
        {/if}
    </div>
</div>

<style>
    .vehicle {
        display: grid;
        grid-template-rows: auto minmax(0, 1fr);
        height: 100%;
    }
    .tabs {
        padding: var(--au-s3) var(--au-s6) 0;
    }
    .body {
        min-height: 0;
    }
</style>
