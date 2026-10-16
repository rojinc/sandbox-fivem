<script>
    import { Button, Breadcrumbs, Callout, EmptyState, Tag, onKey } from '@sandbox/ui-kit';
    import { faPlay, faArrowLeft, faMapLocationDot } from '@fortawesome/free-solid-svg-icons';
    import { app, STATE_CHARACTERS } from '../../state/app.svelte.js';
    import { characters, selectedCharacter } from '../../state/characters.svelte.js';
    import { spawn, chooseSpawn, selectedSpawn } from '../../state/spawn.svelte.js';
    import { spawnCharacter } from '../../lib/flows.js';
    import { formatSid, fullName, jobLines, spawnHint } from '../../lib/format.js';
    import Frame from '../common/Frame.svelte';
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
    const name = $derived(character ? fullName(character) : 'your character');
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

    onKey(['ArrowDown', 'ArrowRight'], () => (app.loading ? false : move(1)));
    onKey(['ArrowUp', 'ArrowLeft'], () => (app.loading ? false : move(-1)));
    onKey('Enter', (e) => (app.loading || e.repeat ? false : play()));
    onKey(['Escape', 'Backspace'], () => (app.loading ? false : goBack()));

    const hints = [
        { keys: ['↑', '↓'], label: 'Choose' },
        { keys: ['Enter'], label: 'Spawn' },
        { keys: ['Esc'], label: 'Back' },
    ];
</script>

{#snippet info()}
    <InfoColumn>
        {#if character}
            <Callout title="Playing as">
                <dl class="au-dl who">
                    <dt>Name</dt>
                    <dd>{fullName(character)}</dd>
                    <dt>State ID</dt>
                    <dd class="au-mono">{formatSid(character.SID)}</dd>
                    <dt>Job</dt>
                    <dd>{jobs.length ? jobs.join('; ') : 'Unemployed'}</dd>
                </dl>
            </Callout>
        {/if}
    </InfoColumn>
{/snippet}

<Frame title="Choose where to spawn" subline={character ? `SandboxRP · ${fullName(character)} (${formatSid(character.SID)})` : 'SandboxRP'} {hints} side={info}>
    <Breadcrumbs items={[{ label: 'Characters', onclick: goBack }, { label: 'Spawn point' }]} />
    <Notice />

    {#if list.length}
        <p class="lead">Pick where {name} wakes up, then press Spawn here.</p>
        <table class="au-table au-table--striped au-table--hover cs-table" aria-label="Spawn points">
            <thead>
                <tr>
                    <th>Location</th>
                    <th>Note</th>
                    <th class="status">Selected</th>
                </tr>
            </thead>
            <tbody>
                {#each list as s, i (i)}
                    {@const isSelected = i === spawn.selected}
                    <tr
                        class="is-clickable"
                        class:is-selected={isSelected}
                        aria-current={isSelected ? 'true' : undefined}
                        onclick={() => chooseSpawn(i)}
                        ondblclick={() => {
                            chooseSpawn(i);
                            play();
                        }}
                    >
                        <td><span class="cs-name">{s.label || 'Spawn point'}</span></td>
                        <td>{#if spawnHint(s)}{spawnHint(s)}{:else}<span class="au-muted">—</span>{/if}</td>
                        <td class="status">{#if isSelected}<Tag tone="action" solid>Selected</Tag>{/if}</td>
                    </tr>
                {/each}
            </tbody>
        </table>

        <div class="actions">
            <Button variant="secondary" icon={faArrowLeft} onclick={goBack} disabled={app.loading}>Back to characters</Button>
            <Button size="lg" icon={faPlay} onclick={play} disabled={!canPlay}>Spawn here</Button>
        </div>
    {:else}
        <EmptyState icon={faMapLocationDot} title="No spawn points">
            Go back and pick another character, or try again in a moment.
            {#snippet actions()}
                <Button variant="secondary" icon={faArrowLeft} onclick={goBack}>Back to characters</Button>
            {/snippet}
        </EmptyState>
    {/if}
</Frame>

<style>
    .lead {
        max-width: none;
    }
    .status {
        width: 120px;
    }
    .actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
        margin-top: 24px;
    }
    .who {
        margin: 0;
        grid-template-columns: 80px 1fr;
    }
</style>
