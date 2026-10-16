<script>
    import { Button } from '@sandbox/ui-kit';
    import { ageFrom, formatDob, formatSid, fullName, genderLabel } from '../../lib/format.js';

    /** The selected row's record with Play / Delete, pinned at the foot of the panel. */
    let { character, disabled = false, onplay, ondelete } = $props();

    const age = $derived(ageFrom(character.DOB));
</script>

<section class="rec" aria-label="Selected character">
    <div class="rec__name">
        <h2>{fullName(character)}</h2>
        <span class="au-mono au-muted">{formatSid(character.SID)}</span>
    </div>
    <dl class="rec__facts">
        <div>
            <dt class="cs-label">Phone</dt>
            <dd class="au-mono">{character.Phone || '—'}</dd>
        </div>
        <div>
            <dt class="cs-label">Date of birth</dt>
            <dd>{formatDob(character.DOB)}{#if age !== null}<span class="au-muted">{` (age ${age})`}</span>{/if}</dd>
        </div>
        <div>
            <dt class="cs-label">Gender</dt>
            <dd>{genderLabel(character.Gender)}</dd>
        </div>
    </dl>
    <div class="rec__actions">
        <Button size="lg" onclick={onplay} {disabled}>Play as {character.First || 'this character'}</Button>
        <Button variant="secondary" size="lg" onclick={ondelete} {disabled}>Delete character</Button>
    </div>
</section>

<style>
    .rec__name {
        display: flex;
        align-items: baseline;
        gap: 12px;
        min-width: 0;
    }
    .rec__name h2 {
        margin: 0;
        font-size: var(--au-fs-md);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .rec__facts {
        display: grid;
        grid-template-columns: 1fr 1.6fr 1fr;
        gap: 16px;
        margin: 12px 0 20px;
    }
    .rec__facts dd {
        margin: 2px 0 0;
    }
    .rec__actions {
        display: flex;
        gap: 12px;
    }
</style>
