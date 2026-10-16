<script>
    import { Tag } from '@sandbox/ui-kit';
    import { ageFrom, formatCash, formatDob, formatSid, fullName, genderLabel, jobSummary, lastPlayed } from '../../lib/format.js';

    /** The roster as a striped table. Click selects, double-click plays. */
    let { rows = [], selected = null, disabled = false, onselect, onplay } = $props();
</script>

<table class="au-table au-table--striped au-table--hover cs-table" aria-label="Your characters">
    <thead>
        <tr>
            <th>Name</th>
            <th>State ID</th>
            <th>Job</th>
            <th>Last played</th>
            <th class="is-numeric">Cash</th>
        </tr>
    </thead>
    <tbody>
        {#each rows as c, i (c.ID ?? i)}
            {@const job = jobSummary(c.Jobs)}
            {@const played = lastPlayed(c.LastPlayed)}
            {@const age = ageFrom(c.DOB)}
            {@const isSelected = c.ID === selected}
            <tr
                class="is-clickable"
                class:is-selected={isSelected}
                aria-current={isSelected ? 'true' : undefined}
                onclick={() => !disabled && onselect?.(c)}
                ondblclick={() => !disabled && onplay?.(c)}
            >
                <td>
                    <div class="name">
                        <span class="cs-name">{fullName(c)}</span>
                        {#if played.never}<Tag tone="info">New</Tag>{/if}
                    </div>
                    <div class="au-hint">{genderLabel(c.Gender)}{#if age !== null} · {age}{/if} · {formatDob(c.DOB)}</div>
                </td>
                <td class="au-mono">{formatSid(c.SID)}</td>
                <td>
                    {#if job.employed}
                        <span class="job">{job.label}</span>
                        {#if job.detail}<span class="au-muted"> · {job.detail}</span>{/if}
                        {#if job.extra > 0}<Tag>+{job.extra} more</Tag>{/if}
                    {:else}
                        <span class="au-muted">Unemployed</span>
                    {/if}
                </td>
                <td title={played.absolute ?? undefined}>
                    {#if played.never}<span class="au-muted">Never played</span>{:else}{played.relative}{/if}
                </td>
                <td class="is-numeric">{formatCash(c.Cash)}</td>
            </tr>
        {/each}
    </tbody>
</table>

<style>
    .name {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: var(--au-fs-sm);
    }
    .job {
        font-weight: 500;
    }
    td :global(.au-tag) {
        margin-left: 4px;
    }
</style>
