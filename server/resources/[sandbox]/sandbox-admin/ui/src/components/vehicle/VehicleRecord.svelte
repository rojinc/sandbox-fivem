<script>
    import { onMount } from 'svelte';
    import { Button, Tag } from '@sandbox/ui-kit';
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
     * Any vehicle by entity: GetVehicle(entity) -> record or false;
     * ActionVehicle { model, target, action } -> { success, message } or false.
     */
    let { entity, backLabel, onback, onremoved } = $props();

    let vehicle = $state(null);
    let status = $state('loading');
    let error = $state('');
    let busy = $state(null);
    let confirming = $state(null);

    async function load() {
        status = 'loading';
        try {
            const res = await call('GetVehicle', Number(entity));
            if (res && typeof res === 'object') {
                vehicle = res;
                status = 'ready';
            } else status = 'missing';
        } catch (e) {
            error = errorText(e);
            status = 'error';
        }
    }

    onMount(load);

    const actions = $derived(vehicleActions('remote', app.level));
    const safe = $derived(actions.filter((a) => !a.danger));
    const danger = $derived(actions.filter((a) => a.danger));

    async function run(a) {
        busy = a.key;
        try {
            const res = await call('ActionVehicle', { model: vehicle.EntityModel, target: Number(vehicle.Entity ?? entity), action: a.key });
            const r = readResult(res, `${a.label}: done`, `${a.label} did not work. You need the admin permission for vehicle actions.`);
            report(r);
            if (r.ok && a.key === 'delete') onremoved?.();
            else if (r.ok && a.refresh) load();
        } catch (e) {
            toast('error', errorText(e));
        } finally {
            busy = null;
            confirming = null;
        }
    }
</script>

{#if onback}
    <p class="back"><Button variant="tertiary" onclick={onback}>{backLabel}</Button></p>
{/if}

{#if status === 'loading'}
    <Loading text="Loading vehicle" />
{:else if status === 'missing'}
    <h2 class="name">Vehicle not found</h2>
    <p class="note">Entity {entity} no longer exists in the world. It may have been stored or deleted.</p>
{:else if status === 'error'}
    <Problem title="The vehicle record did not load" retry={load}>{error}</Problem>
{:else if vehicle}
    <div class="head">
        <h2 class="name">{vehicleName(vehicle)}</h2>
        {#if vehicle.Owned}<Tag tone="info">Owned</Tag>{:else}<Tag>Not owned</Tag>{/if}
    </div>
    <p class="lead">Plate <span class="au-mono">{text(vehicle.Plate, 'none')}</span>, entity <span class="au-mono">{text(vehicle.Entity ?? entity)}</span></p>

    <section class="sub" aria-labelledby="veh-actions">
        <h3 id="veh-actions">Actions</h3>
        <ul class="rows">
            {#each safe as a (a.key)}
                <ActionRow label={a.label} hint={a.hint} busy={busy === a.key} disabled={Boolean(busy) && busy !== a.key} onclick={() => run(a)} />
            {/each}
            {#each danger as a (a.key)}
                <ActionRow variant="danger" label={a.label} hint={a.hint} disabled={Boolean(busy)} onclick={() => (confirming = a)} />
            {/each}
        </ul>
    </section>

    <VehicleFacts {vehicle} />

    {#if confirming}
        <ConfirmAction
            title="{confirming.verb} {vehicleName(vehicle)}?"
            body={confirming.confirm}
            confirmLabel={confirming.label}
            busy={busy === confirming.key}
            onconfirm={() => run(confirming)}
            onclose={() => (confirming = null)}
        />
    {/if}
{/if}

<style>
    .back {
        margin: 0 0 var(--au-s3);
    }
    .head {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: var(--au-s3);
    }
    .name {
        margin: 0;
        font-size: var(--au-fs-lg);
    }
    .lead {
        margin: var(--au-s1) 0 var(--au-s4);
        color: var(--au-muted);
    }
    .rows {
        list-style: none;
        margin: 0;
        padding: 0;
    }
</style>
