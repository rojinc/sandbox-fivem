<script>
    import { Tag, formatMoney } from '@sandbox/ui-kit';
    import { app } from '../../state/app.svelte.js';
    import { same } from '../../state/accounts.svelte.js';
    import { accountName, accountType, accessOf } from '../../lib/format.js';

    /** Accounts as a table. Rows select an account when `onselect` is given; the selected row uses the selected surface. */
    let { rows = [], selected = null, onselect } = $props();

    function onkey(e, a) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onselect?.(a.Account);
        }
    }
</script>

<table class="au-table au-table--hover accounts">
    <thead>
        <tr>
            <th>Account</th>
            <th>Name</th>
            <th>Type</th>
            <th>Access</th>
            <th>Joint owners</th>
            <th class="is-numeric">Balance</th>
        </tr>
    </thead>
    <tbody>
        {#each rows as a (a.Account)}
            {@const type = accountType(a)}
            {@const isSelected = Boolean(onselect) && same(a.Account, selected)}
            <tr
                class:is-clickable={Boolean(onselect)}
                class:is-selected={isSelected}
                aria-selected={onselect ? isSelected : undefined}
                tabindex={onselect ? 0 : undefined}
                onclick={onselect ? () => onselect(a.Account) : undefined}
                onkeydown={onselect ? (e) => onkey(e, a) : undefined}
            >
                <td class="au-mono">{a.Account}</td>
                <td class="name">{accountName(a)}</td>
                <td><Tag tone={type.tone}>{type.label}</Tag></td>
                <td class="au-muted">{accessOf(a, app.character).label}</td>
                <td class="au-mono au-muted">
                    {#if a.Type === 'personal_savings' && a.JointOwners?.length}
                        {a.JointOwners.join(', ')}
                    {:else}
                        <span class="au-hint">—</span>
                    {/if}
                </td>
                <td class="is-numeric balance">{formatMoney(a.Balance)}</td>
            </tr>
        {/each}
    </tbody>
</table>

<style>
    .accounts td {
        height: 48px;
    }
    .name {
        font-weight: 500;
    }
    .balance {
        font-size: var(--au-fs-sm);
        font-weight: 500;
    }
    .au-hint {
        font-family: var(--au-font);
    }
    tr.is-clickable:focus-visible {
        outline: 3px solid var(--au-focus);
        outline-offset: -3px;
    }
</style>
