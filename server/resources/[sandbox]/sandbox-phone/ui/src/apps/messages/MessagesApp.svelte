<script>
    import ThreadList from './ThreadList.svelte';
    import Conversation from './Conversation.svelte';
    import NewMessage from './NewMessage.svelte';

    /** Messages: threads (root), one conversation (convo/:number), a new text (new). */
    let { app, segs = [] } = $props();
</script>

{#if segs[0] === 'convo' && segs[1]}
    {#key segs[1]}<Conversation number={segs[1]} />{/key}
{:else if segs[0] === 'new'}
    <NewMessage />
{:else}
    <ThreadList {app} />
{/if}
