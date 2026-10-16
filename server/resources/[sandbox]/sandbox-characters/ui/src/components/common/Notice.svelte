<script>
    import { PageAlert } from '@sandbox/ui-kit';
    import { characters, dismissNotice } from '../../state/characters.svelte.js';

    /** Feedback for created / deleted / failed requests. Dismisses itself after a few seconds. */
    $effect(() => {
        if (!characters.notice) return undefined;
        const t = setTimeout(dismissNotice, 6000);
        return () => clearTimeout(t);
    });
</script>

{#if characters.notice}
    <PageAlert type={characters.notice.tone} compact onclose={dismissNotice}>{characters.notice.text}</PageAlert>
{/if}
