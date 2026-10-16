<script>
    import { onMount } from 'svelte';
    import { Button, EmptyState, Spinner, Tag } from '@sandbox/ui-kit';
    import { fetchNui } from '@sandbox/ui-kit/nui';
    import AppPage from '../../components/common/AppPage.svelte';
    import { data, setData } from '../../state/data.svelte.js';
    import { openApp } from '../../state/router.svelte.js';
    import { showAlert } from '../../state/notify.svelte.js';
    import { clock } from '../../state/clock.svelte.js';
    import { stamp, toMs, plain } from '../../lib/format.js';

    /** Garage: your vehicles (root) and one vehicle (view/:vin) with where it is and its condition. */
    let { app, segs = [] } = $props();

    let loading = $state(false);
    let failed = $state(false);

    async function load() {
        if (loading) return;
        loading = true;
        failed = false;
        try {
            const res = await fetchNui('Garage:GetCars');
            setData('myVehicles', Array.isArray(res) ? res : Object.values(res ?? {}));
        } catch {
            failed = true;
        }
        loading = false;
    }
    onMount(() => {
        if (!segs.length || !Array.isArray(data.myVehicles)) load();
    });

    const cars = $derived((Array.isArray(data.myVehicles) ? data.myVehicles : []).filter(Boolean));
    const car = $derived(segs[0] === 'view' ? (cars.find((v) => String(v.VIN) === String(segs[1])) ?? null) : null);

    function garageOf(v) {
        const t = Number(v?.Storage?.Type);
        if (t === 0) return data.garages?.impound?.label ?? 'Impound lot';
        if (t === 1) return data.garages?.[v.Storage.Id]?.label ?? 'A garage';
        if (t === 2) return v.PropertyStorage?.label ?? 'A property';
        return 'Unknown';
    }
    function status(v) {
        if (v.Spawned) return { text: 'Out', tone: 'info' };
        if (Number(v?.Storage?.Type) === 0) return { text: 'Impounded', tone: 'warning' };
        return { text: 'Stored', tone: 'default' };
    }
    function condition(pct) {
        const n = Math.ceil(Number(pct));
        if (!Number.isFinite(n)) return 'Unknown';
        if (n >= 90) return 'Excellent';
        if (n >= 70) return 'Good';
        if (n >= 50) return 'Fair';
        if (n >= 30) return 'Needs work';
        return 'Badly damaged';
    }
    const partName = (k) => k.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (c) => c.toUpperCase());

    async function track() {
        try {
            const ok = await fetchNui('Garage:TrackVehicle', car.VIN);
            showAlert(ok ? 'Vehicle marked on your GPS' : 'This vehicle cannot be tracked right now.', ok ? 'success' : 'error');
        } catch {
            showAlert('This vehicle cannot be tracked right now.', 'error');
        }
    }
</script>

{#if segs[0] === 'view'}
    <AppPage title={car ? `${plain(car.Make)} ${plain(car.Model)}` : 'Vehicle'}>
        {#if car}
            {@const st = status(car)}
            <div class="ph-actions">
                <Button onclick={track}>Show on GPS</Button>
            </div>
            <h2 class="ph-section">Where it is</h2>
            <dl class="ph-facts">
                <div><dt>Status</dt><dd><Tag tone={st.tone}>{st.text}</Tag></dd></div>
                <div><dt>Location</dt><dd>{car.Spawned ? 'Out on the road' : garageOf(car)}</dd></div>
                {#if Number(car.Storage?.Type) === 0}
                    <div><dt>Fine</dt><dd class="ph-num">${Number(car.Storage?.Fine ?? 0).toLocaleString('en-US')}</dd></div>
                    {#if car.Storage?.TimeHold?.ExpiresAt}
                        <div><dt>Held until</dt><dd>{toMs(car.Storage.TimeHold.ExpiresAt) > clock.now ? stamp(car.Storage.TimeHold.ExpiresAt) : 'Released'}</dd></div>
                    {/if}
                {/if}
                <div><dt>Plate</dt><dd class="au-mono">{car.RegisteredPlate ?? 'None'}</dd></div>
                <div><dt>VIN</dt><dd class="au-mono">{car.VIN}</dd></div>
            </dl>
            <h2 class="ph-section">Condition</h2>
            <dl class="ph-facts">
                <div><dt>Mileage</dt><dd class="ph-num">{Math.round(Number(car.Mileage) || 0).toLocaleString('en-US')} miles</dd></div>
                <div><dt>Body</dt><dd>{condition(((car.Damage?.Body ?? 1000) / 1000) * 100)}</dd></div>
                <div><dt>Engine</dt><dd>{condition(((car.Damage?.Engine ?? 1000) / 1000) * 100)}</dd></div>
                {#each Object.entries(car.DamagedParts ?? {}) as [part, pct] (part)}
                    <div><dt>{partName(part)}</dt><dd>{condition(pct)}</dd></div>
                {/each}
            </dl>
        {:else if loading}
            <div class="state"><Spinner size={20} /> Loading your vehicle</div>
        {:else}
            <div class="ph-pad">
                <p>This vehicle is no longer registered to you.</p>
                <Button variant="secondary" onclick={() => openApp('garage')}>See your vehicles</Button>
            </div>
        {/if}
    </AppPage>
{:else}
    <AppPage title={app?.label ?? 'Garage'}>
        {#snippet actions()}
            <Button size="sm" variant="secondary" loading={loading} onclick={load}>Refresh</Button>
        {/snippet}
        {#if loading && !cars.length}
            <div class="state"><Spinner size={20} /> Loading your vehicles</div>
        {:else if failed}
            <div class="ph-pad">
                <p class="err" role="alert">Your vehicles could not be loaded.</p>
                <Button variant="secondary" onclick={load}>Try again</Button>
            </div>
        {:else if cars.length}
            <ul class="ph-list">
                {#each cars as v (v.VIN)}
                    {@const st = status(v)}
                    <li>
                        <button type="button" class="ph-row" onclick={() => openApp('garage', `view/${encodeURIComponent(v.VIN)}`)}>
                            <span class="ph-row__main">
                                <span class="ph-row__title">{plain(v.Make)} {plain(v.Model)}</span>
                                <span class="ph-row__sub"><span class="au-mono">{v.RegisteredPlate ?? 'No plate'}</span>, {v.Spawned ? 'out on the road' : garageOf(v)}</span>
                            </span>
                            <span class="ph-row__side"><Tag tone={st.tone}>{st.text}</Tag></span>
                        </button>
                    </li>
                {/each}
            </ul>
        {:else}
            <EmptyState title="No vehicles registered to you">Vehicles you buy or are given show here with where they are parked.</EmptyState>
        {/if}
    </AppPage>
{/if}

<style>
    .state {
        display: flex;
        align-items: center;
        gap: var(--au-s3);
        padding: var(--au-s5) var(--au-s4);
        color: var(--au-muted);
    }
    .err {
        color: var(--au-error);
        font-weight: 700;
    }
</style>
