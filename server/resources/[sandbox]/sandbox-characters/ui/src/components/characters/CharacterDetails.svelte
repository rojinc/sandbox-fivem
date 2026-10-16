<script>
    import { Button } from '@sandbox/ui-kit';
    import { ageFrom, formatDob, formatSid, fullName, genderLabel, jobLines } from '../../lib/format.js';

    /** The selected row's record with the Play / Delete actions, under the table. */
    let { character, disabled = false, onplay, ondelete } = $props();

    const jobs = $derived(jobLines(character.Jobs));
    const age = $derived(ageFrom(character.DOB));
</script>

<section class="details" aria-label="Selected character">
    <div class="details__who">
        <div class="details__name">
            <h3>{fullName(character)}</h3>
            <span class="au-mono au-muted">{formatSid(character.SID)}</span>
        </div>
        <dl class="details__facts">
            <div>
                <dt>Phone</dt>
                <dd class="au-mono">{character.Phone || '—'}</dd>
            </div>
            <div>
                <dt>Date of birth</dt>
                <dd>{formatDob(character.DOB)}{#if age !== null}<span class="au-muted">{` (age ${age})`}</span>{/if}</dd>
            </div>
            <div>
                <dt>Gender</dt>
                <dd>{genderLabel(character.Gender)}</dd>
            </div>
            <div class="details__jobs">
                <dt>Jobs</dt>
                <dd class="au-truncate">{jobs.length ? jobs.join('; ') : 'Unemployed'}</dd>
            </div>
        </dl>
    </div>
    <div class="details__actions">
        <Button variant="secondary" size="lg" icon="trash" onclick={ondelete} {disabled}>Delete</Button>
        <Button size="lg" icon="player-play" onclick={onplay} {disabled}>Play</Button>
    </div>
</section>

<style>
    .details {
        display: flex;
        align-items: center;
        gap: 40px;
        margin-top: 24px;
        padding: 20px 24px;
        background: var(--au-bg-shade);
        border: 1px solid var(--au-border);
        border-radius: var(--au-radius-lg);
    }
    .details__who {
        flex: 1;
        min-width: 0;
    }
    .details__name {
        display: flex;
        align-items: baseline;
        gap: 12px;
        margin-bottom: 12px;
    }
    .details__name h3 {
        margin: 0;
        font-size: var(--au-fs-md);
        font-weight: 500;
    }
    .details__facts {
        display: flex;
        gap: 40px;
        margin: 0;
        font-size: var(--au-fs-xs);
    }
    .details__facts > div {
        flex-shrink: 0;
        min-width: 0;
    }
    .details__facts .details__jobs {
        flex: 1 1 auto;
        flex-shrink: 1;
    }
    .details__facts dt {
        color: var(--au-hint);
        font-size: 13px;
    }
    .details__facts dd {
        margin: 2px 0 0;
    }
    .details__actions {
        display: flex;
        gap: 12px;
        flex-shrink: 0;
    }
    .details__actions :global(.au-btn--primary) {
        min-width: 160px;
    }
</style>
