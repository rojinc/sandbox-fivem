<script>
    import { resolveIcon } from '../icons.js';

    /**
     * Font Awesome icon by name ("heart", "far fa-heart", ["fas","heart"]) or
     * definition object (faHeart). Names resolve through the registry filled
     * with registerIcons(); unknown names fall back to `fallback`.
     */
    let {
        icon,
        fallback = 'circle-dot',
        size,
        fixedWidth = false,
        spin = false,
        label,
        color,
        class: className = '',
        style = '',
    } = $props();

    const def = $derived(resolveIcon(icon, fallback));
    const paths = $derived(def ? [].concat(def.icon[4]) : []);
    const css = $derived(
        [size ? `font-size:${typeof size === 'number' ? `${size}px` : size}` : '', color ? `color:${color}` : '', style]
            .filter(Boolean)
            .join(';'),
    );
</script>

{#if def}
    <svg
        class="au-icon {className}"
        class:au-icon--fw={fixedWidth}
        class:au-icon--spin={spin}
        viewBox="0 0 {def.icon[0]} {def.icon[1]}"
        role={label ? 'img' : 'presentation'}
        aria-hidden={label ? undefined : 'true'}
        aria-label={label}
        style={css || undefined}
        data-icon={def.iconName}
    >
        {#each paths as d, i (i)}
            <path {d} fill="currentColor" opacity={paths.length > 1 && i === 0 ? 0.4 : 1} />
        {/each}
    </svg>
{/if}

<style>
    .au-icon {
        display: inline-block;
        width: 1em;
        height: 1em;
        vertical-align: -0.125em;
        overflow: visible;
        flex-shrink: 0;
    }
    .au-icon--fw {
        width: 1.25em;
    }
    .au-icon--spin {
        animation: au-spin 1s linear infinite;
    }
</style>
