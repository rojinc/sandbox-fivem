<script>
    import { RichText } from '@sandbox/ui-kit';
    import { characters } from '../../state/characters.svelte.js';
    import { changelogView } from '../../lib/format.js';

    /**
     * Right column: the message of the day (`motd` convar) and the newest
     * changelog document as plain text sections. Lua may send markup, so
     * both go through RichText's sanitiser. `children` renders first.
     */
    let { children } = $props();

    const log = $derived(changelogView(characters.changelog));
</script>

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

{#if !characters.motd && !log && !children}
    <section class="cs-note">
        <h2>Server news</h2>
        <p>No announcements right now.</p>
    </section>
{/if}
