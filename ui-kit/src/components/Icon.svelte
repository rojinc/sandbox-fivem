<script>
    import { resolveIcon } from '../icons/index.js';

    /**
     * Tabler outline icon by name. Font Awesome names from Lua are mapped
     * ("fas fa-gas-pump" -> gas-station). `filled` uses the solid variant when
     * Tabler has one. `stroke` is the line weight in px at 24px.
     */
    let { icon, size, stroke = 1.75, filled = false, fallback = 'point', label, color, class: className = '', style = '' } = $props();

    const def = $derived(resolveIcon(icon, { filled, fallback }));
    const css = $derived(
        [size ? `font-size:${typeof size === 'number' ? `${size}px` : size}` : '', color ? `color:${color}` : '', style]
            .filter(Boolean)
            .join(';'),
    );
</script>

{#if def}
    <svg
        class="au-icon {className}"
        viewBox="0 0 24 24"
        fill={def.filled ? 'currentColor' : 'none'}
        stroke={def.filled ? 'none' : 'currentColor'}
        stroke-width={stroke}
        stroke-linecap="round"
        stroke-linejoin="round"
        role={label ? 'img' : 'presentation'}
        aria-hidden={label ? undefined : 'true'}
        aria-label={label}
        style={css || undefined}
        data-icon={def.name}
    >
        {#each def.nodes as [tag, attrs], i (i)}
            <svelte:element this={tag} {...attrs} />
        {/each}
    </svg>
{/if}

<style>
    .au-icon {
        display: inline-block;
        width: 1.15em;
        height: 1.15em;
        vertical-align: -0.2em;
        flex-shrink: 0;
    }
</style>
