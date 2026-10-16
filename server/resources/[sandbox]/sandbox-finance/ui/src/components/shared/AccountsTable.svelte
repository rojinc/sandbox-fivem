<script>
    import { Tag, formatMoney } from '@sandbox/ui-kit';
    import { app } from '../../state/app.svelte.js';
    import { same } from '../../state/accounts.svelte.js';
    import { accountName, accountType, accessOf } from '../../lib/format.js';

    /**
     * Striped accounts table. Rows select an account when `onselect` is given.
     * `compact` (ATM) drops the type, access and joint owner columns.
     */
    let { rows = [], selected = null, onselect, compact = false } = $props();

    function pick(a) {
        onselect?.(a.Account);
    }
    function onkey(e, a) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            pick(a);
        }
    }
</script>

<table class="au-table au-table--striped au-table--hover" class:au-table--dense={compact}>
    <thead>
        <tr>
            <th>Account</th>
            <th>Name</th>
            {#if !compact}
                <th>Type</th>
                <th>Access</th>
                <th>Joint owners</th>
            {/if}
            <th class="is-numeric">Balance</th>
        </tr>
    </thead>
    <tbody>
        {#each rows as a (a.Account)}
            {@const access = accessOf(a, app.character)}
            {@const type = accountType(a)}
            <tr
                class:is-clickable={Boolean(onselect)}
                class:is-selected={Boolean(onselect) && same(a.Account, selected)}
                aria-selected={onselect ? same(a.Account, selected) : undefined}
                tabindex={onselect ? 0 : undefined}
                onclick={onselect ? () => pick(a) : undefined}
                onkeydown={onselect ? (e) => onkey(e, a) : undefined}
            >
                <td class="au-mono">{a.Account}</td>
                <td>{accountName(a)}</td>
                {#if !compact}
                    <td><Tag tone={type.tone}>{type.label}</Tag></td>
                    <td><Tag tone={access.tone}>{access.label}</Tag></td>
                    <td class="au-mono">{a.JointOwners?.length ? a.JointOwners.join(', ') : '—'}</td>
                {/if}
                <td class="is-numeric">{formatMoney(a.Balance)}</td>
            </tr>
        {/each}
    </tbody>
</table>

<style>
    tr.is-selected td:first-child {
        box-shadow: inset 4px 0 0 var(--au-action);
    }
    tr.is-clickable:focus-visible {
        outline: 3px solid var(--au-focus);
        outline-offset: -3px;
    }
</style>
