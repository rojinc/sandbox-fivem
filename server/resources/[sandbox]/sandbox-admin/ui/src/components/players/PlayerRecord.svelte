<script>
    import { onMount } from 'svelte';
    import { Button, PageAlert, Tag } from '@sandbox/ui-kit';
    import { call, errorText, readResult } from '../../lib/api.js';
    import { LEVEL } from '../../lib/permissions.js';
    import { ago, asList, charName, day, jobsText, text, vec3, vehicleName, when } from '../../lib/format.js';
    import { app } from '../../state/app.svelte.js';
    import { nav, openPlayer, closePlayer } from '../../state/nav.svelte.js';
    import { toast, report } from '../../state/toasts.svelte.js';
    import Loading from '../shared/Loading.svelte';
    import Problem from '../shared/Problem.svelte';
    import Copyable from '../shared/Copyable.svelte';
    import PunishDialog from './PunishDialog.svelte';
    import VehicleRecord from '../vehicle/VehicleRecord.svelte';

    /** GetPlayer(source) -> online record, a recent-disconnect record (Disconnected = true), or false. */
    let { source } = $props();

    let player = $state(null);
    let status = $state('loading');
    let error = $state('');
    let busy = $state(null);
    let dialog = $state(null); // 'kick' | 'ban'

    async function load() {
        status = 'loading';
        try {
            const res = await call('GetPlayer', Number(source));
            if (res && typeof res === 'object') {
                player = res;
                status = 'ready';
            } else status = 'missing';
        } catch (e) {
            error = errorText(e);
            status = 'error';
        }
    }

    onMount(async () => {
        await load();
        // Preview scenarios open a dialog straight away.
        if (nav.dialog && status === 'ready') dialog = nav.dialog;
        nav.dialog = null;
    });

    const me = $derived(Boolean(app.user && player && Number(app.user.Source) === Number(player.Source)));
    const offline = $derived(Boolean(player?.Disconnected));
    const char = $derived(player?.Character && typeof player.Character === 'object' ? player.Character : null);
    const outranks = $derived(app.level >= (Number(player?.Level) || 0));
    const sensitive = $derived(app.level >= LEVEL.SENSITIVE);
    const vehicle = $derived(player?.Vehicle && typeof player.Vehicle === 'object' ? player.Vehicle : null);
    const others = $derived(asList(player?.Characters).sort((a, b) => Number(Boolean(a.Deleted)) - Number(Boolean(b.Deleted))));

    /** Every action with whether it shows and, when shown but blocked, why. */
    const actions = $derived.by(() => {
        if (!player || offline) return [];
        const noChar = char ? null : 'They have not picked a character, so only kick and ban work on them.';
        const rank = outranks ? null : 'Their staff level is higher than yours.';
        return [
            { key: 'goto', label: 'Go to player', show: !me, why: noChar },
            { key: 'bring', label: 'Bring to you', show: !me, why: noChar || rank },
            { key: 'heal', label: me ? 'Heal yourself' : 'Heal player', show: !me || app.level >= LEVEL.SENIOR, why: noChar },
            { key: 'attach', label: 'Spectate', show: !me, why: noChar || rank },
            { key: 'marker', label: 'Set GPS marker', show: !me && sensitive, why: noChar },
        ].filter((a) => a.show);
    });
    const reasons = $derived([...new Set(actions.map((a) => a.why).filter(Boolean))]);
    const canKick = $derived(Boolean(player) && !me && !offline);
    const canBan = $derived(canKick && app.level >= LEVEL.SENIOR);
    // Opening a player's vehicle needs level 75, as in the old console.
    const canOpenVehicle = $derived(app.level >= LEVEL.SENIOR);

    async function act(a) {
        if (a.key === 'marker') {
            // Lua never calls cb for "marker" (CONTRACT.md), so do not wait for a reply.
            call('ActionPlayer', { targetSource: Number(player.Source), action: 'marker' }, { timeout: 2000 }).catch(() => {});
            toast('info', `GPS marker set on ${player.Name}`);
            return;
        }
        busy = a.key;
        try {
            const res = await call('ActionPlayer', { targetSource: Number(player.Source), action: a.key });
            report(readResult(res, `${a.label}: done`, `${a.label} did not work. Their staff level may be the same as yours or higher.`));
        } catch (e) {
            toast('error', errorText(e));
        } finally {
            busy = null;
        }
    }

    function punished() {
        dialog = null;
        nav.reload += 1;
        closePlayer();
    }

    function seat(v) {
        return v.Driver ? 'Driver' : 'Passenger';
    }
</script>

{#if nav.playerVehicle && player}
    <VehicleRecord entity={nav.playerVehicle} backLabel="Back to {player.Name}" onback={() => (nav.playerVehicle = null)} />
{:else if status === 'loading'}
    <Loading text="Loading player" />
{:else if status === 'missing'}
    <h2 class="name">Player not found</h2>
    <p class="note">Nobody with server ID {source} is online, and they are not in the list of recent disconnects.</p>
    <div class="after-note"><Button variant="secondary" onclick={closePlayer}>Close record</Button></div>
{:else if status === 'error'}
    <Problem title="The player record did not load" retry={load}>{error}</Problem>
{:else if player}
    <div class="head">
        <div class="head__text">
            <h2 class="name">{text(player.Name, 'Unknown player')}</h2>
            <div class="tags">
                {#if offline}<Tag tone="warning">Disconnected</Tag>{:else}<Tag tone="success">Online</Tag>{/if}
                {#if me}<Tag tone="info">You</Tag>{/if}
            </div>
        </div>
        <Button variant="tertiary" onclick={closePlayer}>Close record</Button>
    </div>
    <p class="lead">
        {#if char && offline}Was playing as {charName(char) || 'an unnamed character'}{:else if char}Playing as {charName(char) || 'an unnamed character'}{:else if offline}No character when they left{:else}In character selection{/if}
    </p>

    {#if offline}
        <PageAlert type="warning" title="Left the server {when(player.DisconnectedTime)} ({ago(player.DisconnectedTime)})">
            Reason given: {text(player.Reason, 'none recorded')}.
            {#if player.Reconnected}They have joined again as server ID {player.Reconnected}.{:else}Actions need them to be online.{/if}
            {#if player.Reconnected}
                <div class="alert-action"><Button variant="secondary" size="sm" onclick={() => openPlayer(player.Reconnected)}>Open current session</Button></div>
            {/if}
        </PageAlert>
    {/if}

    {#if actions.length || canKick}
        <section class="sub" aria-labelledby="rec-actions">
            <h3 id="rec-actions">Actions</h3>
            {#if actions.length}
                <div class="buttons">
                    {#each actions as a (a.key)}
                        <Button variant="secondary" size="sm" disabled={Boolean(a.why) || (busy && busy !== a.key)} loading={busy === a.key} onclick={() => act(a)}>{a.label}</Button>
                    {/each}
                </div>
            {/if}
            {#if canKick}
                <div class="buttons danger">
                    <Button variant="danger" size="sm" disabled={!outranks} onclick={() => (dialog = 'kick')}>Kick player</Button>
                    {#if canBan}<Button variant="danger" size="sm" disabled={!outranks} onclick={() => (dialog = 'ban')}>Ban player</Button>{/if}
                </div>
            {/if}
            {#each reasons as r (r)}<p class="note">{r}</p>{/each}
            {#if canKick && !outranks && !reasons.length}<p class="note">Their staff level is higher than yours.</p>{/if}
        </section>
    {/if}

    <section class="sub" aria-labelledby="rec-account">
        <h3 id="rec-account">Account</h3>
        <dl class="au-dl facts">
            <dt>Server ID</dt>
            <dd class="au-mono">{text(player.Source)}</dd>
            <dt>Account ID</dt>
            <dd>{#if player.AccountID !== undefined && player.AccountID !== null}<Copyable value={player.AccountID} what="account ID" />{/if}</dd>
            <dt>Game name</dt>
            <dd>{text(player.GameName, text(player.Name))}</dd>
            <dt>Discord ID</dt>
            <dd class="au-mono">{text(player.Discord, 'Not linked')}</dd>
            <dt>Identifier</dt>
            <dd>{#if player.Identifier}<Copyable value={player.Identifier} what="identifier" />{/if}</dd>
            <dt>Staff group</dt>
            <dd>{text(player.StaffGroup, 'None')}</dd>
            <dt>Staff level</dt>
            <dd class="au-mono">{text(player.Level, '0')}</dd>
            <dt>Groups</dt>
            <dd>
                {#if asList(player.Groups).length}
                    <span class="tags">{#each asList(player.Groups) as g (String(g))}<Tag>{String(g)}</Tag>{/each}</span>
                {:else}None{/if}
            </dd>
        </dl>
    </section>

    <section class="sub" aria-labelledby="rec-char">
        <h3 id="rec-char">Character</h3>
        {#if char}
            <dl class="au-dl facts">
                <dt>Name</dt>
                <dd>{charName(char) || 'Unnamed'}</dd>
                <dt>State ID</dt>
                <dd>{#if char.SID !== undefined}<Copyable value={char.SID} what="state ID" />{/if}</dd>
                <dt>Date of birth</dt>
                <dd>{typeof char.DOB === 'number' ? day(char.DOB) : text(char.DOB)}</dd>
                {#if sensitive}
                    <dt>Phone</dt>
                    <dd class="au-mono">{text(char.Phone, 'None')}</dd>
                    {#if vec3(char.Coords)}
                        <dt>Coordinates</dt>
                        <dd><Copyable value={vec3(char.Coords)} what="coordinates" /></dd>
                    {/if}
                {/if}
                <dt>Jobs</dt>
                <dd>{jobsText(char.Jobs) || 'No job'}</dd>
            </dl>
        {:else}
            <p class="note">{offline ? 'No character was recorded when they left.' : 'They are on the character selection screen.'}</p>
        {/if}
    </section>

    {#if !offline}
        <section class="sub" aria-labelledby="rec-vehicle">
            <h3 id="rec-vehicle">Vehicle</h3>
            {#if vehicle}
                <dl class="au-dl facts">
                    <dt>Vehicle</dt>
                    <dd>{vehicleName(vehicle)}</dd>
                    <dt>Plate</dt>
                    <dd class="au-mono">{text(vehicle.Plate, 'No plate')}</dd>
                    <dt>VIN</dt>
                    <dd class="au-mono">{text(vehicle.VIN, 'Unknown')}</dd>
                    <dt>Seat</dt>
                    <dd>{seat(vehicle)}</dd>
                </dl>
                {#if canOpenVehicle && vehicle.Entity}
                    <p class="vehicle-open"><Button variant="secondary" size="sm" onclick={() => (nav.playerVehicle = Number(vehicle.Entity))}>Open vehicle record</Button></p>
                {/if}
            {:else}
                <p class="note">Not in a vehicle.</p>
            {/if}
        </section>
    {/if}

    {#if !offline}
        <section class="sub" aria-labelledby="rec-chars">
            <h3 id="rec-chars">{char ? 'Other characters' : 'Characters'} on this account</h3>
            {#if others.length}
                <table class="au-table au-table--dense">
                    <thead>
                        <tr>
                            <th scope="col">State ID</th>
                            <th scope="col">Name</th>
                            <th scope="col">Last played</th>
                            <th scope="col">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each others as c (`${c.SID}-${c.First}`)}
                            <tr>
                                <td class="au-mono">{text(c.SID)}</td>
                                <td>{charName(c) || 'Unnamed'}</td>
                                <td>{ago(c.LastPlayed) || 'Never'}</td>
                                <td>{#if c.Deleted}<Tag tone="error">Deleted</Tag>{:else}<Tag>Active</Tag>{/if}</td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            {:else}
                <p class="note">No {char ? 'other ' : ''}characters on record.</p>
            {/if}
        </section>
    {/if}

    {#if dialog}
        <PunishDialog kind={dialog} {player} onclose={() => (dialog = null)} ondone={punished} />
    {/if}
{/if}

<style>
    .head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: var(--au-s4);
    }
    .head__text {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: var(--au-s3);
        min-width: 0;
    }
    .name {
        margin: 0;
        font-size: var(--au-fs-lg);
        overflow-wrap: anywhere;
    }
    .tags {
        display: flex;
        flex-wrap: wrap;
        gap: var(--au-s1);
    }
    .lead {
        margin: var(--au-s1) 0 var(--au-s4);
        color: var(--au-muted);
    }
    .buttons {
        display: flex;
        flex-wrap: wrap;
        gap: var(--au-s2);
    }
    .buttons.danger {
        margin-top: var(--au-s3);
    }
    .after-note {
        margin-top: var(--au-s4);
    }
    .alert-action {
        margin-top: var(--au-s3);
    }
    .vehicle-open {
        margin: var(--au-s3) 0 0;
    }
    .sub:first-of-type {
        margin-top: var(--au-s4);
    }
</style>
