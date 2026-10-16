<script>
    import { Button } from '@sandbox/ui-kit';
    import { faPlay, faTrashCan } from '@fortawesome/free-solid-svg-icons';
    import { ageFrom, formatCash, formatDob, formatSid, fullName, genderLabel, jobLines, lastPlayed } from '../../lib/format.js';

    /** The selected row's record and the Play / Delete actions. */
    let { character, disabled = false, onplay, ondelete } = $props();

    const jobs = $derived(jobLines(character.Jobs));
    const played = $derived(lastPlayed(character.LastPlayed));
    const age = $derived(ageFrom(character.DOB));
</script>

<section class="details" aria-label="Selected character">
    <div class="details__head">
        <h2 class="details__title">{fullName(character)}</h2>
        <span class="details__sid au-mono">{formatSid(character.SID)}</span>
    </div>
    <div class="details__body">
        <dl class="au-dl details__dl">
            <dt>Phone</dt>
            <dd class="au-mono">{character.Phone || '—'}</dd>
            <dt>Date of birth</dt>
            <dd>{formatDob(character.DOB)}{#if age !== null} (age {age}){/if}</dd>
            <dt>Gender</dt>
            <dd>{genderLabel(character.Gender)}</dd>
            <dt>Jobs</dt>
            <dd>
                {#if jobs.length}
                    {#each jobs as line, i (i)}<div>{line}</div>{/each}
                {:else}
                    Unemployed
                {/if}
            </dd>
            <dt>Last played</dt>
            <dd>{#if played.never}Never played{:else}{played.relative} <span class="au-muted">({played.absolute})</span>{/if}</dd>
            <dt>Cash</dt>
            <dd class="au-mono">{formatCash(character.Cash)}</dd>
        </dl>
        <div class="details__actions">
            <Button size="lg" icon={faPlay} onclick={onplay} {disabled}>Play</Button>
            <Button variant="secondary" icon={faTrashCan} onclick={ondelete} {disabled}>Delete character</Button>
        </div>
    </div>
</section>

<style>
    .details {
        margin-top: 24px;
        border: 1px solid var(--au-border);
        border-radius: var(--au-radius);
    }
    .details__head {
        display: flex;
        align-items: baseline;
        gap: 12px;
        padding: 12px 20px;
        background: var(--au-bg-shade);
        border-bottom: 1px solid var(--au-bg-alt-shade);
    }
    .details__title {
        margin: 0;
        font-size: var(--au-fs-md);
    }
    .details__sid {
        color: var(--au-muted);
    }
    .details__body {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 32px;
        padding: 16px 20px 20px;
    }
    .details__dl {
        margin: 0;
        font-size: var(--au-fs-xs);
        grid-template-columns: 120px 1fr;
    }
    .details__actions {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: 8px;
        flex-shrink: 0;
        min-width: 220px;
    }
</style>
