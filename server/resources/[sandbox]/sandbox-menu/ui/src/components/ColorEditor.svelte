<script>
    import { Button } from '@sandbox/ui-kit';
    import Track from './Track.svelte';

    /**
     * Red, green and blue for a COLORPICKER row, opened with Enter or a click.
     * `active` is the channel the arrow keys change.
     */
    let { draft, active = 0, onactivate, onchange, onsave, oncancel } = $props();

    const CHANNELS = [
        { key: 'r', name: 'Red' },
        { key: 'g', name: 'Green' },
        { key: 'b', name: 'Blue' },
    ];

    const stop = (fn) => (e) => {
        e.stopPropagation();
        fn?.();
    };
</script>

<div class="editor">
    {#each CHANNELS as ch, i (ch.key)}
        <div class="channel" class:is-active={i === active} role="presentation" onpointerdown={() => onactivate?.(i)}>
            <span class="channel__name">{ch.name}</span>
            <Track value={draft[ch.key]} min={0} max={255} active={i === active} label={ch.name} onchange={(v) => onchange?.(ch.key, v)} />
            <span class="channel__value au-mono">{draft[ch.key]}</span>
        </div>
    {/each}
    <div class="editor__actions">
        <Button size="sm" onclick={stop(onsave)}>Save colour</Button>
        <Button size="sm" variant="secondary" onclick={stop(oncancel)}>Cancel</Button>
    </div>
</div>

<style>
    .editor {
        display: grid;
        gap: var(--au-s3);
        padding-top: var(--au-s1);
    }
    .channel {
        display: grid;
        grid-template-columns: 56px 1fr 40px;
        align-items: center;
        gap: var(--au-s3);
        font-size: var(--au-fs-xs);
    }
    .channel.is-active .channel__name {
        font-weight: 700;
    }
    .channel__value {
        text-align: right;
    }
    .editor__actions {
        display: flex;
        gap: var(--au-s2);
        padding-top: var(--au-s1);
    }
</style>
