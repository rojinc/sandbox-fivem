<script>
    import { Button, Field, TextInput, PageAlert, Spinner } from '@sandbox/ui-kit';
    import { fetchNui } from '@sandbox/ui-kit/nui';
    import { showAlert } from '../../../state/notify.svelte.js';

    /** The business's Spammer picture (GetBusinessTwitter / SetBusinessTwitter). */
    let link = $state('');
    let saved = $state('');
    let loading = $state(true);
    let failed = $state(false);
    let error = $state(null);
    let busy = $state(false);
    let broken = $state(false);

    async function load() {
        loading = true;
        const res = await fetchNui('GetBusinessTwitter', {});
        loading = false;
        if (res && typeof res === 'object' && res.success) {
            saved = typeof res.pfp === 'string' ? res.pfp : '';
            link = saved;
            failed = false;
        } else failed = true;
    }

    async function save() {
        error = null;
        const url = link.trim();
        if (!/^https:\/\/\S+$/i.test(url)) {
            error = 'Enter an image link that starts with https://';
            return;
        }
        busy = true;
        const res = await fetchNui('SetBusinessTwitter', { profile: url });
        busy = false;
        if (typeof res === 'string' && res) {
            saved = res;
            showAlert('Post profile picture saved', 'success');
        } else error = 'The picture was not saved. Only managers can change it.';
    }

    load();
</script>

<h3 class="heading">Post profile</h3>
<p class="lead">The picture shown beside your business's posts on Spammer.</p>
{#if loading}
    <div class="loading"><Spinner /> Loading profile</div>
{:else if failed}
    <PageAlert type="error" compact>The profile did not load. Only managers can change it.</PageAlert>
{:else}
    <div class="profile">
        {#if saved && !broken}
            <img class="avatar" src={saved} alt="Your business post profile" onerror={() => (broken = true)} />
        {:else}
            <span class="avatar avatar--empty">No picture</span>
        {/if}
        <form
            class="form"
            onsubmit={(e) => {
                e.preventDefault();
                save();
            }}
        >
            <Field label="Picture link" hint="A square image works best" id="pfp-link" {error}>
                <TextInput id="pfp-link" bind:value={link} placeholder="https://" invalid={Boolean(error)} autocomplete="off" />
            </Field>
            <Button type="submit" loading={busy}>Save picture</Button>
        </form>
    </div>
{/if}

<style>
    .profile {
        display: flex;
        gap: var(--au-s6);
        align-items: flex-start;
        max-width: 48em;
    }
    .form {
        flex: 1;
    }
    .avatar {
        width: 96px;
        height: 96px;
        object-fit: cover;
        flex-shrink: 0;
    }
    .avatar--empty {
        display: grid;
        place-items: center;
        background: var(--au-bg-shade);
        color: var(--au-muted);
        text-align: center;
    }
</style>
