<script>
    import { onMount } from 'svelte';
    import { Checkbox } from '@sandbox/ui-kit';
    import { call, errorText, readResult } from '../lib/api.js';
    import { LEVEL } from '../lib/permissions.js';
    import { asList, charName, jobsText, text, vec3 } from '../lib/format.js';
    import { app } from '../state/app.svelte.js';
    import { openPlayer } from '../state/nav.svelte.js';
    import { toast, report } from '../state/toasts.svelte.js';
    import ActionRow from './shared/ActionRow.svelte';
    import Copyable from './shared/Copyable.svelte';
    import Loading from './shared/Loading.svelte';

    /**
     * Your own tools. Toggles: ToggleIDs ("OK") and ToggleInvisible (true/false,
     * level 100). One-off: StopAllAttach ("OK"), ActionPlayer heal on yourself.
     * Your character and coordinates come from GetPlayer(your server ID).
     */
    let me = $state(null);
    let status = $state('loading');
    let busy = $state(null);

    async function loadMe() {
        status = 'loading';
        try {
            const res = await call('GetPlayer', Number(app.user?.Source));
            me = res && typeof res === 'object' ? res : null;
            status = 'ready';
        } catch {
            status = 'error';
        }
    }

    onMount(loadMe);

    const char = $derived(me?.Character && typeof me.Character === 'object' ? me.Character : null);
    const coords = $derived(vec3(char?.Coords));

    async function toggle(name, key, e, labels) {
        const want = e.currentTarget.checked;
        busy = key;
        try {
            const res = await call(name, {});
            if (res === false) {
                app.toggles[key] = !want;
                toast('error', labels.refused);
            } else {
                app.toggles[key] = want;
                toast('success', want ? labels.on : labels.off);
            }
        } catch (err) {
            app.toggles[key] = !want;
            toast('error', errorText(err));
        } finally {
            busy = null;
        }
    }

    async function stopSpectating() {
        busy = 'detach';
        try {
            await call('StopAllAttach', {});
            toast('success', 'Spectating stopped');
        } catch (err) {
            toast('error', errorText(err));
        } finally {
            busy = null;
        }
    }

    async function healSelf() {
        busy = 'heal';
        try {
            const res = await call('ActionPlayer', { targetSource: Number(app.user.Source), action: 'heal' });
            report(readResult(res, 'You are healed', 'Healing yourself needs the admin permission.'));
        } catch (err) {
            toast('error', errorText(err));
        } finally {
            busy = null;
        }
    }
</script>

<div class="page">
    <div class="page-head">
        <div>
            <h1>Your staff tools</h1>
            <p>Toggles stay on until you switch them off or log out of your character.</p>
        </div>
    </div>

    <div class="cols">
        <div>
            <section class="section" aria-labelledby="self-toggles">
                <h2 id="self-toggles">Toggles</h2>
                <ul class="toggles">
                    <li>
                        <Checkbox
                            bind:checked={app.toggles.ids}
                            disabled={busy === 'ids'}
                            label="Show player IDs above heads"
                            onchange={(e) => toggle('ToggleIDs', 'ids', e, { on: 'Player IDs are showing', off: 'Player IDs are hidden', refused: 'Player IDs need staff permission.' })}
                        />
                        <p class="hint">Server IDs and state IDs of players within 150 metres.</p>
                    </li>
                    {#if app.level >= LEVEL.INVISIBLE}
                        <li>
                            <Checkbox
                                bind:checked={app.toggles.invisible}
                                disabled={busy === 'invisible'}
                                label="Invisible to other players"
                                onchange={(e) => toggle('ToggleInvisible', 'invisible', e, { on: 'You are invisible', off: 'You are visible again', refused: 'Invisibility needs the admin permission.' })}
                            />
                            <p class="hint">Logged to the staff channel each time you switch it.</p>
                        </li>
                    {/if}
                </ul>
            </section>

            <section class="section" aria-labelledby="self-actions">
                <h2 id="self-actions">Actions</h2>
                <ul class="rows">
                    <ActionRow label="Stop spectating" hint="Detaches you from the player you are watching and puts you back." busy={busy === 'detach'} onclick={stopSpectating} />
                    {#if app.level >= LEVEL.SENIOR}
                        <ActionRow label="Heal yourself" hint="Restores your health. Logged like any staff action." busy={busy === 'heal'} disabled={!char} onclick={healSelf} />
                    {/if}
                </ul>
                <p class="note"><button type="button" class="link" onclick={() => openPlayer(app.user.Source)}>Open your player record</button> to see your account as other staff see it.</p>
            </section>
        </div>

        <section class="section" aria-labelledby="self-details">
            <h2 id="self-details">Your details</h2>
            <dl class="au-dl facts">
                <dt>Name</dt>
                <dd>{text(app.user?.Name, 'Unknown')}</dd>
                <dt>Staff group</dt>
                <dd>{text(app.permissionName, text(app.permission, 'Staff'))}</dd>
                <dt>Staff level</dt>
                <dd class="au-mono">{app.level}</dd>
                <dt>Server ID</dt>
                <dd><Copyable value={app.user?.Source} what="server ID" /></dd>
                <dt>Account ID</dt>
                <dd><Copyable value={app.user?.AccountID} what="account ID" /></dd>
                <dt>Identifier</dt>
                <dd>{#if app.user?.Identifier}<Copyable value={app.user.Identifier} what="identifier" />{:else}Unknown{/if}</dd>
                <dt>Groups</dt>
                <dd>{asList(app.user?.Groups).join(', ') || 'None'}</dd>
            </dl>

            <div class="sub">
                <h3>Character</h3>
                {#if status === 'loading'}
                    <Loading text="Loading your character" />
                {:else if status === 'error'}
                    <p class="note">Your character did not load. Switch to another section and back to try again.</p>
                {:else if char}
                    <dl class="au-dl facts">
                        <dt>Name</dt>
                        <dd>{charName(char) || 'Unnamed'}</dd>
                        <dt>State ID</dt>
                        <dd><Copyable value={char.SID} what="state ID" /></dd>
                        {#if coords}
                            <dt>Coordinates</dt>
                            <dd><Copyable value={coords} what="coordinates" /></dd>
                        {/if}
                        <dt>Jobs</dt>
                        <dd>{jobsText(char.Jobs) || 'No job'}</dd>
                    </dl>
                {:else}
                    <p class="note">You have not picked a character yet.</p>
                {/if}
            </div>
        </section>
    </div>
</div>

<style>
    .cols {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        gap: var(--au-s8);
    }
    .cols > div > .section:first-child,
    .cols > .section {
        margin-top: 0;
    }
    .toggles {
        list-style: none;
        margin: 0;
        padding: 0;
    }
    .toggles li {
        padding: var(--au-s2) 0 var(--au-s3);
        border-bottom: 1px solid var(--au-border);
    }
    .toggles .hint {
        margin: 2px 0 0 40px;
        color: var(--au-muted);
        font-size: var(--au-fs-xs);
    }
    .rows {
        list-style: none;
        margin: 0;
        padding: 0;
    }
    .link {
        padding: 0;
        border: 0;
        background: none;
        color: var(--au-action);
        font: inherit;
        text-decoration: underline;
        text-underline-offset: 0.18em;
        cursor: pointer;
    }
    .link:hover {
        color: var(--au-action-hover);
        text-decoration-thickness: 3px;
    }
    .link:focus-visible {
        outline: 3px solid transparent;
        background: var(--au-focus);
        color: var(--au-on-focus);
        text-decoration: none;
        box-shadow: 0 4px var(--au-on-focus);
    }
</style>
