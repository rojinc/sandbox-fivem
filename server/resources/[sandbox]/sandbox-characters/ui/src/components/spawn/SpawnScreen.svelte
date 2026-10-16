<script>
    import { Button, EmptyState, onKey } from '@sandbox/ui-kit';
    import { app, STATE_CHARACTERS } from '../../state/app.svelte.js';
    import { characters, selectedCharacter } from '../../state/characters.svelte.js';
    import { spawn, chooseSpawn, selectedSpawn } from '../../state/spawn.svelte.js';
    import { spawnCharacter } from '../../lib/flows.js';
    import { formatCash, formatSid, fullName, jobLines, lastPlayed, spawnHint, spawnKind } from '../../lib/format.js';
    import Page from '../common/Page.svelte';
    import Notice from '../common/Notice.svelte';
    import InfoColumn from '../common/InfoColumn.svelte';

    /**
     * STATE_SPAWN: pick where the selected character wakes up, then
     * `PlayCharacter`. Back returns to the roster without telling Lua (the old
     * UI did the same; Lua only cares about the next SelectCharacter).
     */
    const character = $derived(selectedCharacter());
    const list = $derived(spawn.list);
    const current = $derived(selectedSpawn());
    const canPlay = $derived(Boolean(character && current) && !app.loading);
    const jobs = $derived(jobLines(character?.Jobs));
    const played = $derived(lastPlayed(character?.LastPlayed));

    function goBack() {
        app.state = STATE_CHARACTERS;
    }
    function move(delta) {
        if (!list.length) return;
        chooseSpawn((spawn.selected + delta + list.length) % list.length);
    }
    function play() {
        if (canPlay) spawnCharacter(character, current);
    }

    onKey('ArrowDown', () => (app.loading ? false : move(1)));
    onKey('ArrowUp', () => (app.loading ? false : move(-1)));
    onKey('Enter', (e) => (app.loading || e.repeat || !canPlay ? false : play()));
    onKey('Escape', () => (app.loading ? false : goBack()));
</script>

{#snippet info()}
    <InfoColumn>
        {#if character}
            <section class="cs-note">
                <h2>Playing as</h2>
                <dl class="au-dl who">
                    <dt>Name</dt>
                    <dd>{fullName(character)}</dd>
                    <dt>State ID</dt>
                    <dd class="au-mono">{formatSid(character.SID)}</dd>
                    <dt>Phone</dt>
                    <dd class="au-mono">{character.Phone || '—'}</dd>
                    <dt>Job</dt>
                    <dd>{jobs.length ? jobs.join('; ') : 'Unemployed'}</dd>
                    <dt>Cash</dt>
                    <dd class="au-mono">{formatCash(character.Cash)}</dd>
                    <dt>Last played</dt>
                    <dd>{played.never ? 'Never' : played.relative}</dd>
                </dl>
            </section>
        {/if}
    </InfoColumn>
{/snippet}

<Page title="Choose where to spawn" subline="Connected to {characters.serverName}" side={info}>
    <div class="cs-section-head">
        <h2>Spawn points</h2>
        {#if list.length}<span class="cs-meta">{list.length} {list.length === 1 ? 'place' : 'places'} available</span>{/if}
        <div class="cs-push">
            <Button variant="tertiary" icon="arrow-left" onclick={goBack} disabled={app.loading}>Back to characters</Button>
        </div>
    </div>

    <Notice />

    {#if list.length}
        <div class="spawns">
            <table class="au-table au-table--hover cs-table" aria-label="Spawn points">
                <colgroup>
                    <col />
                    <col style="width:36%" />
                </colgroup>
                <thead>
                    <tr>
                        <th>Location</th>
                        <th>Type</th>
                    </tr>
                </thead>
                <tbody>
                    {#each list as s, i (i)}
                        {@const isSelected = i === spawn.selected}
                        {@const hint = spawnHint(s)}
                        <tr
                            class="is-clickable"
                            class:is-selected={isSelected}
                            aria-selected={isSelected}
                            onclick={() => chooseSpawn(i)}
                            ondblclick={() => {
                                chooseSpawn(i);
                                play();
                            }}
                        >
                            <td><span class="cs-name">{s.label || 'Spawn point'}</span></td>
                            <td>
                                <div>{spawnKind(s)}</div>
                                {#if hint}<div class="sub">{hint}</div>{/if}
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>

        <div class="go">
            <div class="go__text">
                <div class="go__label">Spawning at</div>
                <div class="go__place">{current?.label || 'Spawn point'}</div>
            </div>
            <Button size="lg" icon="map-pin" onclick={play} disabled={!canPlay}>Spawn here</Button>
        </div>
    {:else}
        <div class="empty">
            <EmptyState icon="map-pin-off" title="No spawn points">
                Go back and pick another character, or try again in a moment.
                {#snippet actions()}
                    <Button variant="secondary" icon="arrow-left" onclick={goBack}>Back to characters</Button>
                {/snippet}
            </EmptyState>
        </div>
    {/if}
</Page>

<style>
    .spawns {
        flex: 0 1 auto;
        min-height: 0;
        overflow: auto;
        border: 1px solid var(--au-border);
        border-radius: var(--au-radius-lg);
    }
    .spawns :global(.au-table tbody tr:last-child td) {
        border-bottom: 0;
    }
    .spawns :global(.au-table thead th) {
        position: sticky;
        top: 0;
        background: var(--au-bg);
        z-index: 1;
    }
    .sub {
        margin-top: 2px;
        color: var(--au-hint);
        font-size: 13px;
    }
    .go {
        display: flex;
        align-items: center;
        gap: 24px;
        margin-top: 24px;
        padding: 20px 24px;
        background: var(--au-bg-shade);
        border: 1px solid var(--au-border);
        border-radius: var(--au-radius-lg);
    }
    .go__text {
        flex: 1;
        min-width: 0;
    }
    .go__label {
        color: var(--au-hint);
        font-size: 13px;
    }
    .go__place {
        font-size: var(--au-fs-md);
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .go :global(.au-btn) {
        min-width: 200px;
    }
    .who {
        margin: 0;
        grid-template-columns: 96px 1fr;
        font-size: var(--au-fs-xs);
    }
    .who dd {
        color: var(--au-text);
    }
    .empty {
        border: 1px dashed var(--au-border-strong);
        border-radius: var(--au-radius-lg);
        padding: 32px 0;
    }
</style>
