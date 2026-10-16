<script>
    import { onMount } from 'svelte';
    import { TextInput, fetchNui, onEscape } from '@sandbox/ui-kit';
    import { chat, pushHistory } from '../../state/chat.svelte.js';
    import { screen, closeInput } from '../../state/screen.svelte.js';
    import { isCommand, matchSuggestions, paramIndex } from '../../lib/suggestions.js';
    import SuggestionList from './SuggestionList.svelte';

    /**
     * The input strip shown while Lua has given us focus. Enter sends (or
     * cancels when empty), Escape cancels, Tab completes the best command,
     * Up/Down walk the sent-line history, PageUp/PageDown scroll the log.
     * Every exit path goes through the chatResult callback, where Lua drops focus.
     */
    let { log = null } = $props();

    const PAGE_STEP = 160;
    const MAX_LENGTH = 512;

    let wrap = $state(null);
    let histIdx = $state(0); // 0 = the live draft
    let draftBackup = '';
    let closed = false;

    const value = $derived(screen.draft);
    const command = $derived(isCommand(value));
    const matches = $derived(matchSuggestions(chat.suggestions, value));
    const pIdx = $derived(paramIndex(value));

    const focusInput = () => wrap?.querySelector('input')?.focus();

    onMount(() => {
        focusInput();
        // Lua can force the chat shut (logout, UI reset) without going through
        // chatResult, which is the only place it clears chatInputActive and
        // drops NUI focus. Tell it we are gone so T works again afterwards.
        return () => {
            if (!closed) fetchNui('chatResult', { cancelled: true });
        };
    });

    function close(result) {
        closed = true;
        histIdx = 0;
        closeInput();
        fetchNui('chatResult', result);
    }

    function send() {
        const text = screen.draft;
        if (text.trim() === '') {
            close({ cancelled: true });
            return;
        }
        pushHistory(text);
        close({ message: text });
    }

    // The bar only exists while the chat is open, so Escape is never swallowed from another surface.
    onEscape(() => close({ cancelled: true }));

    function onKeyDown(e) {
        switch (e.key) {
            case 'Enter':
                e.preventDefault();
                send();
                break;
            case 'Tab':
                e.preventDefault();
                if (command && matches.length > 0) screen.draft = `${matches[0].name} `;
                break;
            case 'ArrowUp':
                if (chat.history.length > 0 && histIdx < chat.history.length) {
                    e.preventDefault();
                    if (histIdx === 0) draftBackup = screen.draft;
                    histIdx += 1;
                    screen.draft = chat.history[histIdx - 1];
                }
                break;
            case 'ArrowDown':
                if (histIdx > 0) {
                    e.preventDefault();
                    histIdx -= 1;
                    screen.draft = histIdx === 0 ? draftBackup : chat.history[histIdx - 1];
                }
                break;
            case 'PageUp':
                e.preventDefault();
                log?.scrollBy(-PAGE_STEP);
                break;
            case 'PageDown':
                e.preventDefault();
                log?.scrollBy(PAGE_STEP);
                break;
            default:
                break;
        }
    }

    // Lua holds NUI focus for us; never let the caret wander off the input.
    const onBlur = () => requestAnimationFrame(focusInput);
</script>

<div class="bar-wrap">
    <div class="bar" bind:this={wrap}>
        <div class="bar__input">
            <TextInput
                id="chat-input"
                bind:value={screen.draft}
                placeholder="Say something, or type / for a command"
                aria-label="Chat message"
                maxlength={MAX_LENGTH}
                spellcheck={false}
                autocomplete="off"
                oninput={() => (histIdx = 0)}
                onkeydown={onKeyDown}
                onblur={onBlur}
            />
        </div>
    </div>
    {#if command}
        <SuggestionList {matches} paramIdx={pIdx} />
    {/if}
</div>

<style>
    .bar-wrap {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }
    /* The strip is the kit TextInput itself: a sunk dark field with its 2px ink edge. */
    .bar {
        display: flex;
        align-items: center;
    }
    .bar__input {
        flex: 1;
        min-width: 0;
    }
</style>
