<script>
    import { Button, Checkbox, Radio } from '@sandbox/ui-kit';
    import { fetchNui } from '@sandbox/ui-kit/nui';
    import AppPage from '../../components/common/AppPage.svelte';
    import Avatar from '../../components/common/Avatar.svelte';
    import { data, updateSetting } from '../../state/data.svelte.js';
    import { phone, setExpanded, startMove } from '../../state/phone.svelte.js';
    import { openApp } from '../../state/router.svelte.js';
    import { WALLPAPERS } from '../../lib/assets.js';
    import { RINGTONES, TEXTTONES, labelOf } from './sounds.js';

    /** Settings: who you are, notifications, sound and display. Each change saves straight away. */
    let { app } = $props();

    const p = $derived(data.player ?? {});
    const s = $derived(p.PhoneSettings ?? {});
    const set = (type, val) => updateSetting(type, val, fetchNui);

    let volume = $state(0);
    $effect.pre(() => {
        volume = Number(s.volume ?? 100);
    });

    let size = $state('standard');
    $effect.pre(() => {
        size = phone.expanded ? 'larger' : 'standard';
    });

    const wallLabel = $derived(WALLPAPERS[s.wallpaper]?.label ?? (s.wallpaper ? 'Your image link' : WALLPAPERS.wallpaper.label));
</script>

{#snippet link(label, value, path)}
    <li>
        <button type="button" class="ph-row" onclick={() => openApp('settings', path)}>
            <span class="ph-row__main">
                <span class="ph-row__title">{label}</span>
                {#if value}<span class="ph-row__sub">{value}</span>{/if}
            </span>
        </button>
    </li>
{/snippet}

<AppPage title={app?.label ?? 'Settings'}>
    <ul class="ph-list">
        <li>
            <button type="button" class="ph-row me" onclick={() => openApp('settings', 'profile')}>
                <Avatar name={p.First} src={p.Mugshot} size={48} />
                <span class="ph-row__main">
                    <span class="ph-row__title">{p.First} {p.Last}</span>
                    <span class="ph-row__sub au-mono">{p.Phone}</span>
                </span>
            </button>
        </li>
    </ul>

    <h2 class="ph-section">Notifications</h2>
    <div class="opt">
        <Checkbox checked={Boolean(s.notifications)} label="Show notifications" onchange={(e) => set('notifications', e.currentTarget.checked)} />
    </div>
    <ul class="ph-list">
        {@render link('Notifications by app', s.notifications ? 'Choose which apps can notify you' : 'Turn on notifications first', 'app_notifs')}
    </ul>

    <h2 class="ph-section">Sound</h2>
    <div class="opt">
        <label class="opt__label" for="vol">Volume <span class="ph-num">{volume}%</span></label>
        <div class="vol">
            <input id="vol" class="range" type="range" min="0" max="100" step="5" bind:value={volume} onchange={() => set('volume', Number(volume))} />
            <Button size="sm" variant="secondary" onclick={() => set('volume', (volume = Number(s.volume) > 0 ? 0 : 100))}>{Number(s.volume) > 0 ? 'Mute' : 'Unmute'}</Button>
        </div>
    </div>
    <ul class="ph-list">
        {@render link('Ringtone and text tone', `${labelOf(RINGTONES, s.ringtone)}, ${labelOf(TEXTTONES, s.texttone).toLowerCase()}`, 'sounds')}
    </ul>

    <h2 class="ph-section">Display</h2>
    <ul class="ph-list">
        {@render link('Wallpaper', wallLabel, 'wallpaper')}
    </ul>
    <fieldset class="opt">
        <legend class="opt__label">Phone size</legend>
        <Radio bind:group={size} value="standard" name="size" label="Standard" onchange={() => setExpanded(false)} />
        <Radio bind:group={size} value="larger" name="size" label="Larger" onchange={() => setExpanded(true)} />
    </fieldset>
    <div class="opt">
        <p class="opt__label">Phone position</p>
        <p class="opt__hint">{phone.position ? 'You moved the phone to your own spot.' : 'Docked in the bottom right corner.'}</p>
        <Button variant="secondary" onclick={startMove}>Move phone</Button>
    </div>
</AppPage>

<style>
    .me {
        min-height: 72px;
    }
    .opt {
        margin: 0;
        padding: var(--au-s3) var(--au-s4);
        border: 0;
        border-bottom: 1px solid var(--au-border);
    }
    .opt__label {
        display: flex;
        justify-content: space-between;
        margin: 0 0 var(--au-s1);
        padding: 0;
        font-weight: 700;
        font-size: var(--au-fs-xs);
    }
    .opt__hint {
        margin: 0 0 var(--au-s3);
        color: var(--au-muted);
        font-size: var(--au-fs-xs);
    }
    fieldset.opt {
        display: flex;
        flex-direction: column;
    }
    .vol {
        display: flex;
        align-items: center;
        gap: var(--au-s3);
    }
    .range {
        flex: 1;
        min-width: 0;
        height: 28px;
        margin: 0;
        appearance: none;
        background: transparent;
        cursor: pointer;
    }
    .range::-webkit-slider-runnable-track {
        height: 4px;
        background: var(--au-ink);
    }
    .range::-webkit-slider-thumb {
        appearance: none;
        width: 20px;
        height: 20px;
        margin-top: -8px;
        background: var(--au-ink);
        border: 2px solid var(--au-bg);
    }
    .range:focus-visible {
        outline: 3px solid var(--au-focus);
        outline-offset: 2px;
    }
</style>
