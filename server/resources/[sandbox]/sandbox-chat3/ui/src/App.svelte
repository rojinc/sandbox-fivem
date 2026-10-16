<script>
    import { onMount } from 'svelte';
    import { fetchNui } from '@sandbox/ui-kit';
    import ChatWindow from './components/chat/ChatWindow.svelte';

    // Lua answers `loaded` by asking the server for this player's command list (chat:init).
    onMount(() => {
        fetchNui('loaded');
    });
</script>

<!-- Click-through layer; the chat turns pointer events back on only while Lua has given it focus. -->
<div class="chat-root">
    <ChatWindow />
</div>
