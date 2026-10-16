<script>
    import { onMount } from 'svelte';
    import { Button, EmptyState, Tag } from '@sandbox/ui-kit';
    import { call, errorText, readResult } from '../../lib/api.js';
    import { text, vehicleName } from '../../lib/format.js';
    import { app } from '../../state/app.svelte.js';
    import { toast, report } from '../../state/toasts.svelte.js';
    import { vehicleActions } from './vehicleActions.js';
    import Loading from '../shared/Loading.svelte';
    import Problem from '../shared/Problem.svelte';
    import ActionRow from '../shared/ActionRow.svelte';
    import ConfirmAction from '../shared/ConfirmAction.svelte';
    import VehicleFacts from './VehicleFacts.svelte';

    /**
     * The vehicle you are in (or last sat in): GetCurrentVehicle -> record with
     * Seat, or false. CurrentVehicleAction { action } -> { success, message } or false.
     */
    let vehicle = $state(null);
    let status = $state('loading');
    let error = $state('');
    let busy = $state(null);
    let confirming = $state(null);

    async function load() {
        status = 'loading';
        try {
            const res = await call('GetCurrentVehicle', {});
            if (res && typeof res === 'object') {
                vehicle = res;
                status = 'ready';
            } else status = 'none';
        } catch (e) {
            error = errorText(e);
            status = 'error';
        }
    }

    onMount(load);

    const actions = $derived(vehicleActions('current', app.level));
    const safe = $derived(actions.filter((a) => !a.danger));
    const danger = $derived(actions.filter((a) => a.danger));

    function seatText(seat) {
        const n = Number(seat);
        if (seat !== null && seat !== '' && Number.isInteger(n)) return n === -1 ? "You are in the driver's seat" : `You are in passenger seat ${n + 1}`;
        return 'You are not inside it any more';
    }

    async function run(a) {
        busy = a.key;
        try {
            const res = await call('CurrentVehicleAction', { action: a.key });
            const r = readResult(res, `${a.label}: done`, `${a.label} did not work. Vehicle actions need the admin permission and staff level 90.`);
            report(r);
            if (r.ok && a.refresh) load();
        } catch (e) {
            toast('error', errorText(e));
        } finally {
            busy = null;
            confirming = null;
        }
    }
</script>

<div class="page">
    {#if status === 'loading'}
        <Loading text="Checking your vehicle" />
    {:else if status === 'error'}
        <Problem title="Your vehicle could not be read" retry={load}>{error}</Problem>
    {:else if status === 'none'}
        <EmptyState title="You are not in a vehicle">
            Get into a vehicle, then check again. The actions here apply to the vehicle you are sitting in.
            {#snippet actions()}
                <Button variant="secondary" onclick={load}>Check again</Button>
            {/snippet}
        </EmptyState>
    {:else if vehicle}
        <div class="page-head">
            <div>
                <div class="title">
                    <h1>{vehicleName(vehicle)}</h1>
                    {#if vehicle.Owned}<Tag tone="info">Owned</Tag>{:else}<Tag>Not owned</Tag>{/if}
                </div>
                <p>Plate <span class="au-mono">{text(vehicle.Plate, 'none')}</span>. {seatText(vehicle.Seat)}.</p>
            </div>
            <Button variant="secondary" onclick={load}>Check again</Button>
        </div>

        <div class="cols">
            <section class="section" aria-labelledby="cur-actions">
                <h2 id="cur-actions">Actions</h2>
                <ul class="rows">
                    {#each safe as a (a.key)}
                        <ActionRow label={a.label} hint={a.hint} busy={busy === a.key} disabled={Boolean(busy) && busy !== a.key} onclick={() => run(a)} />
                    {/each}
                    {#each danger as a (a.key)}
                        <ActionRow variant="danger" label={a.label} hint={a.hint} disabled={Boolean(busy)} onclick={() => (confirming = a)} />
                    {/each}
                </ul>
                {#if actions.length < 3}
                    <p class="note">Full repair, refuel, alarm, customs and explode need staff level 90.</p>
                {/if}
            </section>
            <section class="section facts-col" aria-label="Vehicle details">
                <VehicleFacts {vehicle} />
            </section>
        </div>

        {#if confirming}
            <ConfirmAction
                title="{confirming.verb} {vehicleName(vehicle)}?"
                body={confirming.confirmCurrent ?? confirming.confirm}
                confirmLabel={confirming.label}
                busy={busy === confirming.key}
                onconfirm={() => run(confirming)}
                onclose={() => (confirming = null)}
            />
        {/if}
    {/if}
</div>

<style>
    .title {
        display: flex;
        align-items: center;
        gap: var(--au-s3);
    }
    .cols {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        gap: var(--au-s8);
    }
    .cols > .section {
        margin-top: 0;
    }
    .rows {
        list-style: none;
        margin: 0;
        padding: 0;
    }
    .facts-col :global(.sub:first-child) {
        margin-top: 0;
    }
</style>
