<script>
    import Backdrop from './components/Backdrop.svelte';
    import Identity from './components/Identity.svelte';
    import Status from './components/Status.svelte';
    import Tips from './components/Tips.svelte';

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
</script>

<div class="ls-root">
    <Backdrop />

    <div class="ls-frame" style="zoom:{zoom};width:{viewport.w / zoom}px;height:{viewport.h / zoom}px">
        <Identity />

        <div class="ls-bottom">
            <Status />
            <Tips />
        </div>
    </div>
</div>

<style>
    .ls-root {
        position: fixed;
        inset: 0;
        overflow: hidden;
        background: var(--au-bg);
        color: var(--au-text);
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
        padding: 40px 48px 48px;
    }
    .ls-bottom {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 64px;
    }
</style>
