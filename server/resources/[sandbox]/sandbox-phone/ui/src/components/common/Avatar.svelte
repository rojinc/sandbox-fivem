<script>
    import { initial } from '../../lib/format.js';

    /** A square picture of a person, or their initial when there is no picture. */
    let { name = '', src = '', size = 40, mark = '' } = $props();
    let failed = $state(false);
    const showImg = $derived(Boolean(src) && /^https:\/\//i.test(src) && !failed);
</script>

<span class="avatar" style="width:{size}px;height:{size}px;font-size:{Math.round(size * 0.45)}px" aria-hidden="true">
    {#if showImg}
        <img {src} alt="" onerror={() => (failed = true)} />
    {:else}
        {mark || initial(name)}
    {/if}
</span>

<style>
    .avatar {
        display: inline-grid;
        place-items: center;
        flex-shrink: 0;
        overflow: hidden;
        background: var(--au-bg-alt-shade);
        color: var(--au-text);
        font-weight: 700;
        line-height: 1;
    }
    .avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
</style>
