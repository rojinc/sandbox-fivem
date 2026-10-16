<script>
    import { Header, Tag } from '@sandbox/ui-kit';
    import { loading, statusLabel } from './state/loading.svelte.js';
    import Backdrop from './components/Backdrop.svelte';
    import StatusCard from './components/StatusCard.svelte';
    import TipCard from './components/TipCard.svelte';
    import ProgressRail from './components/ProgressRail.svelte';
    import wordmark from './assets/wordmark.webp';

    /**
     * Everything is designed in px for 1920x1080. Wider screens zoom the whole
     * frame (1.3x from 2200 px, 1.9x from 3400 px); the frame's own size is
     * divided by the zoom so it keeps filling the viewport exactly.
     */
    let zoom = $state(1);
    let viewport = $state({ w: 1920, h: 1080 });

    $effect(() => {
        const update = () => {
            const w = window.innerWidth;
            zoom = w >= 3400 ? 1.9 : w >= 2200 ? 1.3 : 1;
            viewport = { w, h: window.innerHeight };
        };
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    });

    const status = $derived(statusLabel(loading));
</script>

<div class="ls-root">
    <Backdrop />

    <div class="ls-frame" style="zoom:{zoom};width:{viewport.w / zoom}px;height:{viewport.h / zoom}px">
        <Header title="Loading Los Santos" subline="Sandbox Roleplay" class="ls-header">
            {#snippet brand()}
                <img class="ls-wordmark" src={wordmark} alt="Sandbox Roleplay" draggable="false" />
            {/snippet}
            {#snippet actions()}
                <Tag tone={loading.finished ? 'success' : 'action'}>{status}</Tag>
            {/snippet}
        </Header>

        <div class="ls-bottom">
            <StatusCard />
            <TipCard />
        </div>

        <ProgressRail fraction={loading.fraction} />
    </div>
</div>

<style>
    .ls-root {
        position: fixed;
        inset: 0;
        overflow: hidden;
        background: var(--au-dark-bg-alt-shade);
        pointer-events: none;
        user-select: none;
    }
    .ls-frame {
        position: absolute;
        left: 0;
        top: 0;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }
    .ls-frame :global(.ls-header) {
        padding: 20px 48px;
    }
    .ls-wordmark {
        height: 56px;
        width: auto;
        margin-right: 8px;
    }
    .ls-bottom {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 48px;
        padding: 0 48px 48px;
    }
</style>
