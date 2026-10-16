<script>
    import { Icon, iconName } from '@sandbox/ui-kit';

    /**
     * Kit icon by name. zoom-in, zoom-out and rotate are not in the kit's
     * generated Tabler subset ("rotate" resolves to the Font Awesome alias
     * "refresh"), so their Tabler outline paths (MIT) are drawn here the way
     * the kit draws icons. Once `npm run icons` includes them, the kit icon is used.
     */
    let { icon, stroke = 2 } = $props();

    const LOCAL = {
        'zoom-in': ['M3 10a7 7 0 1 0 14 0a7 7 0 1 0 -14 0', 'M7 10l6 0', 'M10 7l0 6', 'M21 21l-6 -6'],
        'zoom-out': ['M3 10a7 7 0 1 0 14 0a7 7 0 1 0 -14 0', 'M7 10l6 0', 'M21 21l-6 -6'],
        rotate: ['M19.95 11a8 8 0 1 0 -.5 4m.5 5v-5h-5'],
    };
    const local = $derived(iconName(icon) !== icon ? LOCAL[icon] : null);
</script>

{#if local}
    <svg class="au-icon ped-glyph" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={stroke} stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" data-icon={icon}>
        {#each local as d (d)}<path {d} />{/each}
    </svg>
{:else}
    <Icon {icon} {stroke} />
{/if}

<style>
    .ped-glyph {
        display: inline-block;
        width: 1.15em;
        height: 1.15em;
        vertical-align: -0.2em;
        flex-shrink: 0;
    }
</style>
