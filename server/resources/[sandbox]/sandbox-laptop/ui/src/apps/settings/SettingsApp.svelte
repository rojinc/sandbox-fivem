<script>
    import { Radio, Field, TextInput, Button, Checkbox, Select } from '@sandbox/ui-kit';
    import { fetchNui } from '@sandbox/ui-kit/nui';
    import { data, asMap, saveSetting } from '../../state/data.svelte.js';
    import { showAlert } from '../../state/notify.svelte.js';
    import { desktopApps } from '../../lib/apps.js';
    import { WALLPAPERS, isPreset, wallpaperUrl } from '../../lib/wallpapers.js';

    /**
     * Laptop settings: wallpaper (a preset or your own image link) and
     * notifications. Each change saves straight away through UpdateSetting.
     */
    const s = $derived(asMap(data.player?.LaptopSettings));
    const current = $derived(s.wallpaper ?? 'wallpaper');
    const custom = $derived(!isPreset(current) && typeof current === 'string' && /^https:\/\//i.test(current));

    let choice = $state('wallpaper');
    let link = $state('');
    let linkError = $state(null);
    let checking = $state(false);
    $effect.pre(() => {
        choice = custom ? 'custom' : isPreset(current) ? current : 'wallpaper';
        if (custom) link = current;
    });

    function save(type, val) {
        saveSetting(type, val, fetchNui);
    }

    function pick(key) {
        choice = key;
        if (key === 'custom') return;
        save('wallpaper', key);
        showAlert('Wallpaper changed', 'success');
    }

    function testImage(url) {
        return new Promise((resolve) => {
            const img = new Image();
            const timer = setTimeout(() => resolve(false), 8000);
            img.onload = () => {
                clearTimeout(timer);
                resolve(true);
            };
            img.onerror = () => {
                clearTimeout(timer);
                resolve(false);
            };
            img.src = url;
        });
    }

    async function useLink() {
        linkError = null;
        const url = link.trim();
        if (!/^https:\/\/\S+$/i.test(url)) {
            linkError = 'Enter an image link that starts with https://';
            return;
        }
        checking = true;
        const ok = await testImage(url);
        checking = false;
        if (!ok) {
            linkError = 'That link did not load as an image. Copy the direct image link, ending in .png, .jpg or .webp.';
            return;
        }
        save('wallpaper', url);
        showAlert('Wallpaper changed', 'success');
    }

    /* ------------------------------------------------- notifications */
    const notificationsOn = $derived(s.notifications !== false);
    const muted = $derived(asMap(s.appNotifications));
    const apps = $derived(desktopApps().filter((a) => !a.fake && a.name !== 'settings'));
    const VOLUMES = [0, 10, 25, 50, 75, 100].map((v) => ({ value: String(v), label: v === 0 ? 'Silent' : `${v}%` }));
    const volume = $derived(String(Number.isFinite(Number(s.volume)) ? Number(s.volume) : 100));

    function setMuted(app, on) {
        const next = { ...muted };
        if (on) delete next[app];
        else next[app] = true;
        save('appNotifications', next);
    }
</script>

<div class="pane">
    <div class="split">
    <section class="section" aria-labelledby="wp-h">
        <h3 class="heading" id="wp-h">Wallpaper</h3>
        <fieldset class="wallpapers">
            <legend class="au-hidden">Choose a wallpaper</legend>
            {#each WALLPAPERS as w (w.key)}
                <Radio group={choice} value={w.key} name="wallpaper" class="wallpaper" onchange={() => pick(w.key)}>
                    <span class="wallpaper__body" class:is-current={choice === w.key}>
                        <img class="wallpaper__thumb" src={w.thumb} alt="" draggable="false" />
                        <span class="wallpaper__label">{w.label}</span>
                    </span>
                </Radio>
            {/each}
            <Radio group={choice} value="custom" name="wallpaper" class="wallpaper" onchange={() => pick('custom')}>
                <span class="wallpaper__body" class:is-current={choice === 'custom'}>
                    {#if custom}
                        <img class="wallpaper__thumb" src={wallpaperUrl(current)} alt="" draggable="false" />
                    {:else}
                        <span class="wallpaper__thumb wallpaper__thumb--empty">No image yet</span>
                    {/if}
                    <span class="wallpaper__label">Your own image</span>
                </span>
            </Radio>
        </fieldset>
        {#if choice === 'custom'}
            <form
                class="link-form"
                onsubmit={(e) => {
                    e.preventDefault();
                    useLink();
                }}
            >
                <Field label="Image link" hint="A direct link to a picture, ideally 1920 by 1080 or larger" id="wp-link" error={linkError}>
                    <TextInput id="wp-link" bind:value={link} placeholder="https://" invalid={Boolean(linkError)} autocomplete="off" />
                </Field>
                <Button type="submit" loading={checking}>Use this image</Button>
            </form>
        {/if}
    </section>

    <section class="section notifications" aria-labelledby="nt-h">
        <h3 class="heading" id="nt-h">Notifications</h3>
        <div class="notif">
            <Checkbox checked={notificationsOn} label="Show laptop notifications" onchange={(e) => save('notifications', e.currentTarget.checked)} />
            {#if notificationsOn}
                <fieldset class="apps">
                    <legend class="apps__legend">Apps that can notify you</legend>
                    {#each apps as a (a.name)}
                        <Checkbox checked={!muted[a.name]} label={a.label} onchange={(e) => setMuted(a.name, e.currentTarget.checked)} />
                    {:else}
                        <p class="au-muted">No apps send notifications yet.</p>
                    {/each}
                </fieldset>
            {/if}
            <div class="volume">
                <Field label="Notification sound" id="nt-volume">
                    <Select id="nt-volume" value={volume} options={VOLUMES} block={false} onchange={(e) => save('volume', Number(e.currentTarget.value))} />
                </Field>
            </div>
        </div>
    </section>
    </div>
</div>

<style>
    .wallpapers {
        border: 0;
        margin: 0 0 var(--au-s4);
        padding: 0;
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: var(--au-s5) var(--au-s4);
    }
    .wallpapers :global(.wallpaper) {
        align-items: flex-start;
        gap: var(--au-s2);
        width: 100%;
    }
    .wallpapers :global(.wallpaper .au-radio__label) {
        flex: 1;
        min-width: 0;
    }
    .wallpaper__body {
        display: grid;
        gap: var(--au-s2);
        width: 100%;
    }
    .wallpaper__thumb {
        width: 100%;
        aspect-ratio: 16 / 9;
        object-fit: cover;
        border: 2px solid transparent;
    }
    .is-current .wallpaper__thumb {
        border-color: var(--au-ink);
        box-shadow: 0 0 0 2px var(--au-ink);
    }
    .is-current .wallpaper__label {
        font-weight: 700;
    }
    .wallpaper__thumb--empty {
        display: grid;
        place-items: center;
        background: var(--au-bg-shade);
        border: 2px dashed var(--au-border);
        color: var(--au-muted);
    }
    .link-form {
        display: flex;
        align-items: flex-end;
        gap: var(--au-s3);
        max-width: 48em;
    }
    .link-form :global(.au-field) {
        flex: 1;
        margin-bottom: 3px;
    }
    .notifications {
        margin-top: 0 !important;
    }
    .notif {
        display: grid;
        gap: var(--au-s4);
        justify-items: start;
    }
    .apps {
        border: 0;
        margin: 0;
        padding: 0 0 0 var(--au-s5);
        display: grid;
        gap: var(--au-s1);
    }
    .apps__legend {
        padding: 0;
        margin-bottom: var(--au-s2);
        font-weight: 700;
    }
    .volume {
        min-width: 14em;
    }
</style>
