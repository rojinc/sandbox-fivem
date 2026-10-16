<script>
    import { cleanHtml } from '../../lib/html.js';

    /**
     * A small rich text field for business documents and notices, which are
     * stored as HTML: bold, italic and bulleted lists. Starts from the
     * sanitised stored HTML; pasted content goes in as plain text. `value` is
     * the editor's HTML; sanitise it again before sending (cleanHtml).
     */
    let { value = $bindable(''), id, label, hint, error = null, minHeight = '220px' } = $props();

    let el = $state(null);
    let loaded = false;

    $effect(() => {
        if (!el || loaded) return;
        loaded = true;
        el.innerHTML = cleanHtml(value);
    });

    function sync() {
        value = el?.innerHTML ?? '';
    }

    function cmd(name) {
        el?.focus();
        document.execCommand(name, false);
        sync();
    }

    function paste(e) {
        e.preventDefault();
        const text = e.clipboardData?.getData('text/plain') ?? '';
        document.execCommand('insertText', false, text);
        sync();
    }
</script>

<div class="rte">
    {#if label}<span class="rte__label" id="{id}-label">{label}</span>{/if}
    {#if hint}<span class="rte__hint" id="{id}-hint">{hint}</span>{/if}
    {#if error}<span class="rte__error" role="alert"><span class="au-hidden">Error:</span> {error}</span>{/if}
    <div class="rte__tools" role="toolbar" aria-label="Formatting">
        <button type="button" class="rte__tool" onmousedown={(e) => e.preventDefault()} onclick={() => cmd('bold')}><b>Bold</b></button>
        <button type="button" class="rte__tool" onmousedown={(e) => e.preventDefault()} onclick={() => cmd('italic')}><i>Italic</i></button>
        <button type="button" class="rte__tool" onmousedown={(e) => e.preventDefault()} onclick={() => cmd('insertUnorderedList')}>Bulleted list</button>
    </div>
    <div
        bind:this={el}
        {id}
        class="rte__area user-html"
        class:rte__area--invalid={Boolean(error)}
        style="min-height:{minHeight}"
        contenteditable="true"
        role="textbox"
        aria-multiline="true"
        aria-labelledby={label ? `${id}-label` : undefined}
        aria-describedby={hint ? `${id}-hint` : undefined}
        tabindex="0"
        oninput={sync}
        onpaste={paste}
    ></div>
</div>

<style>
    .rte {
        margin: 0 0 var(--au-s4);
    }
    .rte__label {
        display: block;
        font-weight: 700;
        margin-bottom: var(--au-s1);
    }
    .rte__hint {
        display: block;
        color: var(--au-muted);
        margin-bottom: var(--au-s2);
    }
    .rte__error {
        display: block;
        color: var(--au-error);
        font-weight: 700;
        margin-bottom: var(--au-s2);
    }
    .rte__tools {
        display: flex;
        border: 2px solid var(--au-input-border);
        border-bottom: 0;
        background: var(--au-bg-shade);
    }
    .rte__tool {
        min-height: 36px;
        padding: 0 var(--au-s3);
        border: 0;
        border-right: 1px solid var(--au-border);
        background: transparent;
        color: var(--au-text);
        font-size: var(--au-fs-xs);
        cursor: pointer;
    }
    .rte__tool:hover {
        background: var(--au-bg-alt-shade);
    }
    .rte__tool:focus-visible {
        outline: 3px solid transparent;
        background: var(--au-focus);
        color: var(--au-on-focus);
    }
    .rte__area {
        max-width: none;
        padding: var(--au-s3);
        border: 2px solid var(--au-input-border);
        background: var(--au-input-bg);
        color: var(--au-input-text);
        font-size: var(--au-fs-xs);
        overflow-y: auto;
        cursor: text;
    }
    .rte__area:focus {
        outline: 3px solid var(--au-focus);
        outline-offset: 0;
        box-shadow: inset 0 0 0 2px var(--au-ink);
    }
    .rte__area--invalid {
        border-color: var(--au-error);
    }
</style>
