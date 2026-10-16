<script>
    import { Icon } from '@sandbox/ui-kit';
    import { copyText } from '../../state/clipboard.svelte.js';

    /** Small icon button beside an ID or coordinates. `what` names the value: "account ID". */
    let { value, what } = $props();
</script>

<button type="button" class="copy" aria-label="Copy {what}" title="Copy {what}" onclick={() => copyText(value, what)}>
    <Icon icon="copy" stroke={2} />
</button>

<style>
    .copy {
        display: inline-grid;
        place-items: center;
        width: 32px;
        height: 32px;
        margin: -6px 0 -6px var(--au-s1);
        padding: 0;
        border: 0;
        background: transparent;
        color: var(--au-muted);
        font-size: 18px;
        vertical-align: middle;
        cursor: pointer;
        transition: color var(--au-fast) var(--au-ease);
    }
    .copy:hover {
        color: var(--au-text);
        background: var(--au-bg-alt);
    }
    .copy:focus-visible {
        outline: 3px solid transparent;
        background: var(--au-focus);
        color: var(--au-on-focus);
    }
</style>
