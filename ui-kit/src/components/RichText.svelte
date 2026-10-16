<script>
    import Kbd from './Kbd.svelte';
    import { sanitizeHtml } from '../sanitize.js';

    /**
     * Text from Lua that may carry the framework's lightweight markup:
     *   {key}E{/key}   -> a key cap
     *   <b>, <i>, <br> -> sanitised inline HTML
     */
    let { text, tag = 'span', allowedTags = [], allowedAttr = [], class: className = '' } = $props();

    const parts = $derived.by(() => {
        const src = String(text ?? '');
        const out = [];
        const re = /\{key\}(.*?)\{\/key\}/g;
        let last = 0;
        let m;
        while ((m = re.exec(src)) !== null) {
            if (m.index > last) out.push({ html: sanitizeHtml(src.slice(last, m.index), { allowedTags, allowedAttr }) });
            out.push({ key: m[1] });
            last = m.index + m[0].length;
        }
        if (last < src.length) out.push({ html: sanitizeHtml(src.slice(last), { allowedTags, allowedAttr }) });
        return out;
    });
</script>

<svelte:element this={tag} class="au-richtext {className}">
    {#each parts as part, i (i)}
        {#if part.key !== undefined}<Kbd>{part.key}</Kbd>{:else}{@html part.html}{/if}
    {/each}
</svelte:element>

<style>
    .au-richtext :global(kbd) {
        margin: 0 0.25em;
    }
</style>
