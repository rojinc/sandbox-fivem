<script>
    import { Modal, Button, Field, TextInput, Spinner, PageAlert } from '@sandbox/ui-kit';
    import { fetchNui } from '@sandbox/ui-kit/nui';
    import { showAlert } from '../../state/notify.svelte.js';
    import { asList } from '../../state/data.svelte.js';
    import { person } from '../../lib/format.js';

    /** LS Underground admins: ban a State ID from boosting, and lift bans. */
    let { onclose } = $props();

    let sid = $state('');
    let error = $state(null);
    let bans = $state([]);
    let loading = $state(true);
    let failed = $state(false);
    let busy = $state(false);

    async function load() {
        loading = true;
        const res = await fetchNui('Boosting:Admin:GetBans', {});
        loading = false;
        if (Array.isArray(res) || (res && typeof res === 'object' && !('success' in res))) {
            bans = asList(res);
            failed = false;
        } else {
            bans = [];
            failed = true;
        }
    }

    async function ban() {
        error = null;
        if (!/^\d+$/.test(sid.trim())) {
            error = 'Enter a State ID, like 1042';
            return;
        }
        busy = true;
        const res = await fetchNui('Boosting:Admin:Ban', { SID: parseInt(sid, 10) });
        busy = false;
        if (res === true) {
            showAlert(`State ID ${sid.trim()} banned from boosting`, 'success');
            sid = '';
            load();
        } else {
            error = `No character has State ID ${sid.trim()}. Check the number and try again.`;
        }
    }

    async function unban(b) {
        busy = true;
        const res = await fetchNui('Boosting:Admin:Unban', { SID: Number(b.SID) });
        busy = false;
        if (res === true) {
            showAlert(`Ban lifted for ${person(b)}`, 'success');
            load();
        } else {
            showAlert('The ban was not lifted. Try again.', 'error');
        }
    }

    load();
</script>

<Modal title="Boosting bans" eyebrow="Admin" {onclose} width="760px">
    <div class="ban-form">
        <Field label="State ID to ban" id="ban-sid" error={error}>
            <TextInput id="ban-sid" bind:value={sid} inputmode="numeric" invalid={Boolean(error)} width="12em" block={false} />
        </Field>
        <Button variant="danger" loading={busy} onclick={ban}>Ban from boosting</Button>
    </div>

    <h3 class="subheading">Banned players</h3>
    {#if loading}
        <div class="loading"><Spinner /> Loading bans</div>
    {:else if failed}
        <PageAlert type="error" compact>The ban list did not load. Close this window and try again.</PageAlert>
    {:else if bans.length}
        <table class="au-table">
            <thead>
                <tr>
                    <th scope="col">Racing alias</th>
                    <th scope="col">Name</th>
                    <th scope="col" class="is-numeric">State ID</th>
                    <th scope="col">Banned from</th>
                    <th scope="col" class="cell-actions"><span class="au-hidden">Actions</span></th>
                </tr>
            </thead>
            <tbody>
                {#each bans as b (b.SID)}
                    <tr>
                        <td>{b.RacingAlias ?? 'No alias'}</td>
                        <td>{person(b)}</td>
                        <td class="is-numeric">{b.SID}</td>
                        <td>{asList(b.LSUNDGBan).join(', ') || 'Boosting'}</td>
                        <td class="cell-actions"><Button variant="secondary" size="sm" disabled={busy} onclick={() => unban(b)}>Lift ban</Button></td>
                    </tr>
                {/each}
            </tbody>
        </table>
    {:else}
        <p class="au-muted">Nobody is banned from boosting.</p>
    {/if}
</Modal>

<style>
    .ban-form {
        display: flex;
        align-items: flex-end;
        gap: var(--au-s3);
        margin-bottom: var(--au-s6);
    }
    .ban-form :global(.au-field) {
        margin-bottom: 3px;
    }
</style>
