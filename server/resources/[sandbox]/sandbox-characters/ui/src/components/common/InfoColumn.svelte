<script>
    import { RichText } from '@sandbox/ui-kit';
    import { characters } from '../../state/characters.svelte.js';
    import { changelogView } from '../../lib/format.js';

    /**
     * Below the list in the panel: the message of the day (`motd` convar)
     * and the newest changelog document as plain text sections. Lua may send
     * markup, so both go through RichText's sanitiser. `children` renders
     * first. Nothing renders when there is nothing to say.
     */
    let { children } = $props();

    const log = $derived(changelogView(characters.changelog));
</script>

{#if children || characters.motd || log}
    <div class="cs-notes">
        {@render children?.()}

        {#if characters.motd}
            <section class="cs-note">
                <h2>Message of the day</h2>
                <RichText tag="div" class="cs-note__body" text={characters.motd} />
            </section>
        {/if}

        {#if log}
            <section class="cs-note">
                <h2>{log.title}</h2>
                {#if log.date}<p class="cs-note__date">{log.date}</p>{/if}
                <ul>
                    {#each log.items as item, i (i)}
                        <li><RichText text={item} /></li>
                    {/each}
                </ul>
            </section>
        {/if}
    </div>
{/if}
