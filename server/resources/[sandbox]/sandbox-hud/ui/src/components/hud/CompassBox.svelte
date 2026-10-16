<script>
    import { Icon } from '@sandbox/ui-kit';

    /** One of the three pill boxes: heading, street, area. */
    let { icon, label, bare = false, minWidth = '5em', grow = false } = $props();
</script>

<div class="box" class:is-bare={bare} class:is-grow={grow} style="min-width:{minWidth}">
    <span class="box__icon hud-shadow"><Icon {icon} stroke={2.2} /></span>
    <span class="box__label hud-text">{label}</span>
</div>

<style>
    .box {
        display: flex;
        align-items: center;
        gap: 0.5em;
        height: 1.7em;
        padding: 0 0.8em;
        border-radius: 0.5em;
        background: rgba(0, 0, 0, 0.35);
        max-width: 22em;
        transition: background 160ms var(--au-ease);
    }
    .box.is-bare {
        background: transparent;
    }
    .box.is-grow {
        flex: 0 1 auto;
    }
    .box__icon {
        font-size: 0.8em;
        display: flex;
        color: var(--hud-white);
    }
    .box__label {
        font-size: 0.75em;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
</style>
