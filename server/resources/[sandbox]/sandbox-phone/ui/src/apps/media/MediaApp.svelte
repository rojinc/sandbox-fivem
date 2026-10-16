<script>
    import { onMount } from 'svelte';
    import { Button, EmptyState, Spinner } from '@sandbox/ui-kit';
    import { fetchNui } from '@sandbox/ui-kit/nui';
    import AppPage from '../../components/common/AppPage.svelte';
    import Sheet from '../../components/common/Sheet.svelte';
    import { showAlert } from '../../state/notify.svelte.js';
    import { copyText } from '../../lib/clipboard.js';

    /** Media: photos you took with the camera. Copy a link to share one, or delete it. */
    let { app } = $props();

    let photos = $state([]);
    let loading = $state(false);
    let failed = $state(false);
    let deleting = $state(null);

    async function load() {
        if (loading) return;
        loading = true;
        failed = false;
        try {
            const res = await fetchNui('Media:GetMedia');
            photos = (Array.isArray(res) ? res : Object.values(res ?? {})).filter((p) => p && /^https:\/\//i.test(p.image_url ?? ''));
        } catch {
            failed = true;
        }
        loading = false;
    }
    onMount(load);

    async function remove() {
        const p = deleting;
        deleting = null;
        try {
            const ok = await fetchNui('Media:DeleteMedia', { id: p.id });
            if (ok) {
                photos = photos.filter((x) => x.id !== p.id);
                showAlert('Photo deleted', 'success');
            } else showAlert('The photo could not be deleted. Try again.', 'error');
        } catch {
            showAlert('The photo could not be deleted. Try again.', 'error');
        }
    }
</script>

<AppPage title={app?.label ?? 'Media'}>
    {#if loading && !photos.length}
        <p class="ph-note state"><Spinner size={18} /> Loading your photos</p>
    {:else if failed}
        <div class="ph-pad">
            <p class="err" role="alert">Your photos could not be loaded.</p>
            <Button variant="secondary" onclick={load}>Try again</Button>
        </div>
    {:else if photos.length}
        <ul class="grid">
            {#each photos as p (p.id)}
                <li>
                    <img src={p.image_url} alt="Photo {p.id}" loading="lazy" />
                    <div class="acts">
                        <Button size="sm" variant="tertiary" onclick={() => showAlert(copyText(p.image_url) ? 'Photo link copied' : 'The link could not be copied.')}>Copy link</Button>
                        <Button size="sm" variant="tertiary" onclick={() => (deleting = p)}>Delete</Button>
                    </div>
                </li>
            {/each}
        </ul>
    {:else}
        <EmptyState title="No photos yet">Photos you take with the camera are saved here.</EmptyState>
    {/if}
</AppPage>

<Sheet open={Boolean(deleting)} title="Delete this photo?" onclose={() => (deleting = null)}>
    <p>Links you shared to it stop working.</p>
    {#snippet actions()}
        <Button variant="danger" onclick={remove}>Delete photo</Button>
        <Button variant="secondary" onclick={() => (deleting = null)}>Keep it</Button>
    {/snippet}
</Sheet>

<style>
    .grid {
        list-style: none;
        margin: 0;
        padding: var(--au-s3);
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--au-s3);
    }
    img {
        width: 100%;
        aspect-ratio: 1;
        object-fit: cover;
        background: var(--au-bg-alt);
    }
    .acts {
        display: flex;
        justify-content: space-between;
    }
    .state {
        display: flex;
        align-items: center;
        gap: var(--au-s2);
    }
    .err {
        color: var(--au-error);
        font-weight: 700;
    }
</style>
