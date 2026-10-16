<script>
    import { Button, Field, TextInput } from '@sandbox/ui-kit';
    import { fetchNui } from '@sandbox/ui-kit/nui';
    import AppPage from '../../components/common/AppPage.svelte';
    import Avatar from '../../components/common/Avatar.svelte';
    import { data } from '../../state/data.svelte.js';
    import { showAlert } from '../../state/notify.svelte.js';

    /** Your Spammer name and picture. Names are unique; the server refuses one that is taken. */
    const current = $derived(data.player?.Profiles?.twitter ?? null);

    let name = $state('');
    let picture = $state('');
    let errors = $state({});
    let saving = $state(false);
    $effect.pre(() => {
        name = current?.name ?? '';
        picture = current?.picture ?? '';
    });

    async function save(e) {
        e.preventDefault();
        const n = name.trim();
        const p = picture.trim();
        const next = {};
        if (!n) next.name = 'Enter a name.';
        else if (n.length > 24) next.name = 'Use 24 characters or fewer.';
        if (p && !/^https:\/\/\S+$/i.test(p)) next.picture = 'Enter a link that starts with https://, or leave it empty.';
        errors = next;
        if (Object.keys(next).length) return;
        saving = true;
        try {
            const ok = await fetchNui('UpdateProfile', { app: 'twitter', name: n, picture: p });
            if (ok) {
                if (data.player) {
                    if (!data.player.Profiles) data.player.Profiles = {};
                    data.player.Profiles.twitter = { ...(current ?? {}), sid: data.player.SID, app: 'twitter', name: n, picture: p };
                }
                showAlert('Profile saved', 'success');
            } else {
                errors = { name: 'That name could not be saved. It may be taken; try another.' };
            }
        } catch {
            showAlert('Your profile could not be saved. Try again.', 'error');
        }
        saving = false;
    }
</script>

<AppPage title="Your Spammer profile">
    <div class="who">
        <Avatar name={name} src={picture} size={64} />
        <div>
            <strong>@{name || 'no name yet'}</strong>
            <div class="au-muted">This is how people see your posts.</div>
        </div>
    </div>
    <form class="ph-form" onsubmit={save} novalidate>
        <Field label="Name" hint="Up to 24 characters. Nobody else can use it." id="tw-name" error={errors.name}>
            <TextInput id="tw-name" bind:value={name} maxlength="24" autocomplete="off" invalid={Boolean(errors.name)} />
        </Field>
        <Field label="Picture link (optional)" id="tw-pic" error={errors.picture}>
            <TextInput id="tw-pic" bind:value={picture} autocomplete="off" invalid={Boolean(errors.picture)} />
        </Field>
        <Button type="submit" loading={saving}>Save profile</Button>
    </form>
</AppPage>

<style>
    .who {
        display: flex;
        align-items: center;
        gap: var(--au-s3);
        padding: var(--au-s4) var(--au-s4) 0;
    }
</style>
