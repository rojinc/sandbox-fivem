<script>
    import { Button, Field, TextInput } from '@sandbox/ui-kit';
    import { fetchNui } from '@sandbox/ui-kit/nui';
    import AppPage from '../../components/common/AppPage.svelte';
    import { data, updateSetting } from '../../state/data.svelte.js';
    import { showAlert } from '../../state/notify.svelte.js';
    import { WALLPAPERS } from '../../lib/assets.js';

    /** Choose a wallpaper that ships with the phone, or use your own image link. */
    const current = $derived(data.player?.PhoneSettings?.wallpaper ?? 'wallpaper');
    const custom = $derived(!WALLPAPERS[current] && /^https:\/\//i.test(String(current)) ? current : '');

    let link = $state('');
    let error = $state('');
    $effect.pre(() => {
        link = custom;
    });

    function pick(key) {
        updateSetting('wallpaper', key, fetchNui);
        showAlert('Wallpaper changed', 'success');
    }
    function useLink(e) {
        e.preventDefault();
        const v = link.trim();
        if (!/^https:\/\/\S+$/i.test(v)) {
            error = 'Enter a link to an image that starts with https://';
            return;
        }
        error = '';
        updateSetting('wallpaper', v, fetchNui);
        showAlert('Wallpaper changed', 'success');
    }
</script>

<AppPage title="Wallpaper">
    <ul class="ph-list" aria-label="Wallpapers">
        {#each Object.entries(WALLPAPERS) as [key, w] (key)}
            <li>
                <button type="button" class="ph-row" class:is-selected={current === key} aria-pressed={current === key} onclick={() => pick(key)}>
                    <img class="thumb" src={w.src} alt="" />
                    <span class="ph-row__main">
                        <span class="ph-row__title">{w.label}</span>
                        {#if current === key}<span class="ph-row__sub">In use</span>{/if}
                    </span>
                </button>
            </li>
        {/each}
    </ul>
    <form class="ph-form" onsubmit={useLink} novalidate>
        <Field label="Your own image" hint="A link to a picture, starting with https://" id="wp-link" {error}>
            <TextInput id="wp-link" bind:value={link} autocomplete="off" invalid={Boolean(error)} />
        </Field>
        <Button type="submit" variant="secondary">Use this image</Button>
        {#if custom}<p class="ph-note in-use">Your own image is in use.</p>{/if}
    </form>
</AppPage>

<style>
    .thumb {
        width: 36px;
        height: 72px;
        object-fit: cover;
        flex-shrink: 0;
    }
    .in-use {
        padding: var(--au-s3) 0 0;
    }
</style>
