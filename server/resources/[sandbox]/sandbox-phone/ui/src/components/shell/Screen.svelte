<script>
    import StatusBar from './StatusBar.svelte';
    import HomeScreen from './HomeScreen.svelte';
    import AllApps from './AllApps.svelte';
    import Popups from './Popups.svelte';
    import Alerts from './Alerts.svelte';
    import QuickShare from './QuickShare.svelte';
    import MoveControls from './MoveControls.svelte';
    import NotAvailable from '../common/NotAvailable.svelte';
    import { phone } from '../../state/phone.svelte.js';
    import { data } from '../../state/data.svelte.js';
    import { parse, home, navigate } from '../../state/router.svelte.js';
    import { myApps } from '../../lib/apps.js';
    import { wallpaperSrc } from '../../lib/assets.js';
    import { REGISTRY } from '../../apps/registry.js';

    /** Everything inside the glass: status bar, the current view, the bottom bar and overlays. */
    let { popupHeight = $bindable(0), onCancelMove } = $props();

    const r = $derived(parse());
    const apps = $derived(myApps());
    const wallpaper = $derived(wallpaperSrc(data.player?.PhoneSettings?.wallpaper));
    const onHome = $derived(phone.limited ? false : r.home);
    const PhoneApp = $derived(REGISTRY.phone);
    const View = $derived(r.app && apps[r.app] ? (REGISTRY[r.app] ?? NotAvailable) : null);
</script>

<div class="screen">
    {#if onHome}<img class="screen__wall" src={wallpaper} alt="" />{/if}
    <div class="screen__col">
        <StatusBar overlay={onHome} />
        <div class="screen__view">
            {#if phone.limited}
                <PhoneApp app={apps.phone ?? { name: 'phone', label: 'Phone' }} segs={r.app === 'phone' ? r.segs : []} />
            {:else if r.home}
                <HomeScreen />
            {:else if r.list}
                <AllApps />
            {:else if View}
                {#key r.app}
                    <View app={apps[r.app]} segs={r.segs} />
                {/key}
            {:else}
                <NotAvailable app={{ label: 'App not installed' }} />
            {/if}
        </div>
        {#if !phone.limited}
            {#if onHome}
                <button type="button" class="screen__nav" onclick={() => navigate('/apps')}>All apps</button>
            {:else}
                <button type="button" class="screen__nav" onclick={home}>Home</button>
            {/if}
        {/if}
    </div>
    <Popups bind:height={popupHeight} />
    <Alerts />
    <QuickShare />
    {#if phone.moving}<MoveControls onCancel={onCancelMove} />{/if}
</div>

<style>
    .screen {
        position: absolute;
        inset: 0;
        overflow: hidden;
        background: var(--au-bg);
        color: var(--au-text);
        font-size: var(--au-fs-xs);
    }
    .screen__wall {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        max-width: none;
        object-fit: cover;
        user-select: none;
        pointer-events: none;
    }
    .screen__col {
        position: relative;
        display: flex;
        flex-direction: column;
        height: 100%;
    }
    .screen__view {
        position: relative;
        flex: 1;
        min-height: 0;
    }
    .screen__nav {
        flex-shrink: 0;
        height: 44px;
        padding-bottom: 4px;
        border: 0;
        border-top: 1px solid var(--au-border);
        background: var(--au-bg-shade);
        color: var(--au-text);
        font: inherit;
        font-size: var(--au-fs-xs);
        font-weight: 700;
        cursor: pointer;
    }
    .screen__nav:hover {
        text-decoration: underline;
        text-decoration-thickness: 3px;
    }
    .screen__nav:focus-visible {
        outline: 3px solid var(--au-focus);
        outline-offset: -3px;
    }
</style>
