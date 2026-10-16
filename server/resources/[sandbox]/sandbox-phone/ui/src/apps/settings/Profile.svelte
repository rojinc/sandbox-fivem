<script>
    import { Button } from '@sandbox/ui-kit';
    import { fetchNui } from '@sandbox/ui-kit/nui';
    import AppPage from '../../components/common/AppPage.svelte';
    import Avatar from '../../components/common/Avatar.svelte';
    import { data } from '../../state/data.svelte.js';
    import { showAlert } from '../../state/notify.svelte.js';
    import { myApps } from '../../lib/apps.js';
    import { copyText } from '../../lib/clipboard.js';

    /** Your details, licences and the names you use in apps. */
    const p = $derived(data.player ?? {});
    const apps = $derived(myApps());
    const licences = $derived(
        Object.entries(p.Licenses ?? {})
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([k, v]) => ({ name: k, status: v?.Suspended ? 'Suspended' : v?.Active ? 'Valid' : 'None' })),
    );
    const aliases = $derived(
        Object.entries(p.Alias ?? {})
            .filter(([k]) => apps[k])
            .map(([k, v]) => ({ app: apps[k].label, name: v && typeof v === 'object' ? v.name : v })),
    );

    async function shareNumber() {
        try {
            const ok = await fetchNui('ShareMyContact');
            showAlert(ok ? 'Your number was shared with people near you' : 'Your number could not be shared. Try again.', ok ? 'success' : 'error');
        } catch {
            showAlert('Your number could not be shared. Try again.', 'error');
        }
    }
</script>

<AppPage title="Your profile">
    <div class="who">
        <Avatar name={p.First} src={p.Mugshot} size={72} />
        <div class="who__text">
            <h2 class="who__name">{p.First} {p.Last}</h2>
            <div class="au-mono">{p.Phone}</div>
        </div>
    </div>
    <div class="ph-actions">
        <Button onclick={shareNumber}>Share my number nearby</Button>
        <Button variant="secondary" onclick={() => showAlert(copyText(p.Phone) ? 'Number copied' : 'The number could not be copied.')}>Copy number</Button>
    </div>

    <h2 class="ph-section">Identity</h2>
    <dl class="ph-facts">
        <div><dt>State ID</dt><dd class="au-mono">{p.SID ?? 'Unknown'}</dd></div>
        <div><dt>Server ID</dt><dd class="au-mono">{p.Source ?? 'Unknown'}</dd></div>
        <div><dt>Passport ID</dt><dd class="au-mono">{p.User ?? 'Unknown'}</dd></div>
    </dl>

    <h2 class="ph-section">Licences</h2>
    {#if licences.length}
        <dl class="ph-facts">
            {#each licences as l (l.name)}
                <div><dt>{l.name}</dt><dd class:bad={l.status === 'Suspended'}>{l.status}</dd></div>
            {/each}
        </dl>
    {:else}
        <p class="ph-note">You hold no licences.</p>
    {/if}

    <h2 class="ph-section">Names in apps</h2>
    {#if aliases.length}
        <dl class="ph-facts">
            {#each aliases as a (a.app)}
                <div><dt>{a.app}</dt><dd>{a.name}</dd></div>
            {/each}
        </dl>
    {:else}
        <p class="ph-note">You have not picked a name in any app yet.</p>
    {/if}
</AppPage>

<style>
    .who {
        display: flex;
        align-items: center;
        gap: var(--au-s4);
        padding: var(--au-s5) var(--au-s4) var(--au-s1);
    }
    .who__name {
        margin: 0;
        font-size: var(--au-fs-md);
    }
    .bad {
        color: var(--au-error);
        font-weight: 700;
    }
</style>
