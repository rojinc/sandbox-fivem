<script>
    import { Button, Field, TextInput } from '@sandbox/ui-kit';
    import { fetchNui } from '@sandbox/ui-kit/nui';
    import AppPage from '../../components/common/AppPage.svelte';
    import { hasState } from '../../state/data.svelte.js';
    import { showAlert } from '../../state/notify.svelte.js';

    /** FINDR: send your location to someone by State ID. They choose whether to accept it. */
    let { app } = $props();

    let target = $state('');
    let error = $state('');
    let busy = $state(false);

    async function send(anon) {
        const t = String(target).trim();
        if (!/^\d{1,6}$/.test(t)) {
            error = 'Enter a State ID, for example 4021.';
            return;
        }
        error = '';
        busy = true;
        try {
            const ok = await fetchNui('PingEm:Send', { target: Number(t), type: anon });
            showAlert(ok ? 'Location sent. They will see it if they accept.' : 'Your location was not sent. Check the State ID.', ok ? 'success' : 'error');
        } catch {
            showAlert('Your location was not sent. Try again.', 'error');
        }
        busy = false;
    }
</script>

<AppPage title={app?.label ?? 'FINDR'}>
    <form
        class="ph-form"
        onsubmit={(e) => {
            e.preventDefault();
            send(false);
        }}
        novalidate
    >
        <p>Send your location to someone. It shows on their map for 30 seconds if they accept.</p>
        <Field label="State ID" hint="The State ID of the person you want to find you" id="ping-sid" {error}>
            <TextInput id="ping-sid" bind:value={target} inputmode="numeric" maxlength="6" width="50%" block={false} invalid={Boolean(error)} />
        </Field>
        <div class="acts">
            <Button type="submit" loading={busy}>Send my location</Button>
            {#if hasState('PHONE_VPN')}<Button variant="secondary" disabled={busy} onclick={() => send(true)}>Send without my name</Button>{/if}
        </div>
    </form>
</AppPage>

<style>
    p {
        font-size: var(--au-fs-xs);
    }
    .acts {
        display: flex;
        flex-wrap: wrap;
        gap: var(--au-s3);
    }
</style>
