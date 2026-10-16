<script>
    import { Callout, RichText } from '@sandbox/ui-kit';
    import { characters } from '../../state/characters.svelte.js';
    import { changelogView } from '../../lib/format.js';

    /**
     * Message of the day (the `motd` convar) and the newest changelog
     * document, when there is one. Lua may hand us markup, so both go
     * through RichText's sanitiser.
     */
    let { children } = $props();

    const log = $derived(changelogView(characters.changelog));
</script>

{@render children?.()}

{#if characters.motd}
    <Callout title="Message of the day">
        <p><RichText text={characters.motd} /></p>
    </Callout>
{/if}

{#if log}
    <Callout title={log.title}>
        {#if log.date}<p class="au-hint">{log.date}</p>{/if}
        <ul class="log">
            {#each log.items as item, i (i)}
                <li><RichText text={item} /></li>
            {/each}
        </ul>
    </Callout>
{/if}

<style>
    .log {
        margin: 0;
        padding-left: 20px;
    }
    .log li + li {
        margin-top: 4px;
    }
</style>
