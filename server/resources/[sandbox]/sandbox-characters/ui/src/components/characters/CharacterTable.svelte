<script>
    import { Tag } from '@sandbox/ui-kit';
    import { ageFrom, formatCash, formatSid, fullName, genderLabel, jobSummary, lastPlayed } from '../../lib/format.js';

    /** The roster as a table. Click selects, double-click plays. */
    let { rows = [], selected = null, disabled = false, onselect, onplay } = $props();
</script>

<table class="au-table au-table--hover cs-table" aria-label="Your characters">
    <colgroup>
        <col />
        <col style="width:84px" />
        <col style="width:150px" />
        <col style="width:108px" />
        <col style="width:96px" />
    </colgroup>
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
                aria-selected={isSelected}
                onclick={() => !disabled && onselect?.(c)}
                ondblclick={() => !disabled && onplay?.(c)}
            >
                <td>
                    <div class="name">
                        <span class="cs-name au-truncate">{fullName(c)}</span>
                        {#if played.never}<Tag tone="info">New</Tag>{/if}
                    </div>
                    <div class="cs-sub">{genderLabel(c.Gender)}{#if age !== null}, {age}{/if}</div>
                </td>
                <td class="au-mono">{formatSid(c.SID)}</td>
                <td>
                    {#if job.employed}
                        <div class="au-truncate" title={job.detail ? `${job.label}, ${job.detail}` : job.label}>
                            {job.label}{#if job.extra > 0}<span class="au-muted">{` +${job.extra}`}</span>{/if}
                        </div>
                        {#if job.detail}<div class="cs-sub au-truncate">{job.detail}</div>{/if}
                    {:else}
                        <span class="au-muted">Unemployed</span>
                    {/if}
                </td>
                <td title={played.absolute ?? undefined}>
                    {#if played.never}<span class="au-muted">Never</span>{:else}{played.relative}{/if}
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
        min-width: 0;
    }
    td {
        font-size: var(--au-fs-xs);
    }
</style>
