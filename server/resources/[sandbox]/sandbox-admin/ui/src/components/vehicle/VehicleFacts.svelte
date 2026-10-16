<script>
    import { formatMoney, percent, round, text, vec3, vehicleName } from '../../lib/format.js';
    import Copyable from '../shared/Copyable.svelte';

    /**
     * Facts and condition of a vehicle from GetVehicle / GetCurrentVehicle.
     * Damage.Engine and Damage.Body run 0..1000; DamagedParts run 0..100.
     */
    let { vehicle, extra = [], headingLevel = 'h3' } = $props();

    const PARTS = [
        ['Axle', 'Axle'],
        ['Radiator', 'Radiator'],
        ['Transmission', 'Transmission'],
        ['FuelInjectors', 'Fuel injectors'],
        ['Brakes', 'Brakes'],
        ['Clutch', 'Clutch'],
        ['Electronics', 'Electronics'],
    ];

    const owner = $derived(vehicle?.Owner && typeof vehicle.Owner === 'object' ? vehicle.Owner.Id : vehicle?.Owner);
    const coords = $derived(vec3(vehicle?.Coords));
    const heading = $derived(round(vehicle?.Heading, 1));
    const fuel = $derived(round(vehicle?.Fuel, 0));
    const condition = $derived.by(() => {
        const rows = [
            ['Engine', percent(vehicle?.Damage?.Engine ?? 1000, 1000)],
            ['Body', percent(vehicle?.Damage?.Body ?? 1000, 1000)],
        ];
        const dp = vehicle?.DamagedParts && typeof vehicle.DamagedParts === 'object' ? vehicle.DamagedParts : {};
        for (const [key, label] of PARTS) if (dp[key] !== undefined && dp[key] !== null) rows.push([label, percent(dp[key], 100)]);
        return rows;
    });
</script>

<section class="sub">
    <svelte:element this={headingLevel}>Details</svelte:element>
    <dl class="au-dl facts">
        <dt>Vehicle</dt>
        <dd>{vehicleName(vehicle)}</dd>
        <dt>Plate</dt>
        <dd class="au-mono">{text(vehicle?.Plate, 'No plate')}</dd>
        <dt>VIN</dt>
        <dd>{#if vehicle?.VIN}<Copyable value={vehicle.VIN} what="VIN" />{:else}Unknown{/if}</dd>
        <dt>Owner</dt>
        <dd>{#if vehicle?.Owned}Owned by ID <span class="au-mono">{text(owner, 'unknown')}</span>{:else}Not owned{/if}</dd>
        <dt>Value</dt>
        <dd class="au-mono">{vehicle?.Value ? formatMoney(vehicle.Value) : 'Not set'}</dd>
        <dt>Model hash</dt>
        <dd>{#if vehicle?.EntityModel !== undefined}<Copyable value={vehicle.EntityModel} what="model hash" />{/if}</dd>
        {#if coords}
            <dt>Coordinates</dt>
            <dd><Copyable value={coords} what="coordinates" /></dd>
        {/if}
        <dt>Heading</dt>
        <dd class="au-mono">{heading === null ? '' : `${heading}°`}</dd>
        <dt>Fuel</dt>
        <dd class="au-mono">{fuel === null ? 'Unknown' : `${fuel}%`}</dd>
        {#each extra as row (row.label)}
            <dt>{row.label}</dt>
            <dd class:au-mono={row.mono}>{row.value}</dd>
        {/each}
    </dl>
</section>

<section class="sub">
    <svelte:element this={headingLevel}>Condition</svelte:element>
    <table class="au-table au-table--dense">
        <thead>
            <tr>
                <th scope="col">Part</th>
                <th scope="col" class="num">Health</th>
                <th scope="col">State</th>
            </tr>
        </thead>
        <tbody>
            {#each condition as [label, value] (label)}
                <tr>
                    <td>{label}</td>
                    <td class="num au-mono">{value === null ? '' : `${value}%`}</td>
                    <td>
                        {#if value !== null}
                            {#if value <= 25}<span class="state state--bad">Failing</span>{:else if value <= 60}<span class="state state--worn">Worn</span>{:else}<span class="state">Good</span>{/if}
                        {/if}
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
</section>

<style>
    .state {
        color: var(--au-muted);
    }
    .state--worn {
        color: var(--au-warning);
        font-weight: 700;
    }
    .state--bad {
        color: var(--au-error);
        font-weight: 700;
    }
    .sub :global(h2),
    .sub :global(h3) {
        margin: 0 0 var(--au-s2);
        font-size: var(--au-fs-sm);
    }
</style>
