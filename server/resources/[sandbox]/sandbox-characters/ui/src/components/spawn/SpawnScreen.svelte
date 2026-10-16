<script>
    import { Button, onKey } from '@sandbox/ui-kit';
    import { app, STATE_CHARACTERS } from '../../state/app.svelte.js';
    import { characters, selectedCharacter } from '../../state/characters.svelte.js';
    import { spawn, chooseSpawn, selectedSpawn } from '../../state/spawn.svelte.js';
    import { spawnCharacter } from '../../lib/flows.js';
    import { formatCash, formatSid, fullName, jobLines, spawnHint, spawnKind } from '../../lib/format.js';
    import Dock from '../common/Dock.svelte';
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

{#snippet foot()}
    {#if list.length}
        <div class="cs-label">Spawning at</div>
        <h2 class="place">{current?.label || 'Spawn point'}</h2>
    {/if}
    <div class="actions">
        {#if list.length}<Button size="lg" onclick={play} disabled={!canPlay}>Spawn here</Button>{/if}
        <Button variant="secondary" size="lg" onclick={goBack} disabled={app.loading}>Back to characters</Button>
    </div>
{/snippet}

<Dock title="Choose where to spawn" subline="Connected to {characters.serverName}" footer={foot}>
    <div class="cs-section-head">
        <h2>Spawn points</h2>
        {#if list.length}<span class="cs-meta">{list.length} {list.length === 1 ? 'place' : 'places'} available</span>{/if}
    </div>

    <Notice />

    {#if list.length}
        <table class="au-table au-table--hover cs-table" aria-label="Spawn points">
            <colgroup>
                <col />
                <col style="width:220px" />
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
                        <td>{s.label || 'Spawn point'}</td>
                        <td>
                            <div>{spawnKind(s)}</div>
                            {#if hint}<div class="cs-sub">{hint}</div>{/if}
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    {:else}
        <p class="none au-muted">There are no spawn points for this character right now. Go back and choose another character, or try again in a minute.</p>
    {/if}

    <InfoColumn>
        {#if character}
            <section class="cs-note">
                <h2>Playing as</h2>
                <dl class="au-dl who">
                    <dt>Name</dt>
                    <dd>{fullName(character)}</dd>
                    <dt>State ID</dt>
                    <dd class="au-mono">{formatSid(character.SID)}</dd>
                    <dt>Job</dt>
                    <dd>{jobs.length ? jobs.join('; ') : 'Unemployed'}</dd>
                    <dt>Cash</dt>
                    <dd class="au-mono">{formatCash(character.Cash)}</dd>
                </dl>
            </section>
        {/if}
    </InfoColumn>
</Dock>

<style>
    .place {
        margin: 2px 0 16px;
        font-size: var(--au-fs-md);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .actions {
        display: flex;
        gap: 12px;
    }
    .none {
        margin: 8px 0 0;
        max-width: none;
    }
    .who {
        margin: 0;
        grid-template-columns: 112px 1fr;
    }
    .who dd {
        color: var(--au-text);
    }
</style>
