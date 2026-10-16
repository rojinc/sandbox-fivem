<script>
    import { Button, fetchNui } from '@sandbox/ui-kit';

    /** Shown when the inventory throws while rendering. */
    let { reset } = $props();

    function close() {
        fetchNui('Crashed');
        reset?.();
    }
</script>

<div class="crash" role="alert">
    <div class="box">
        <h2>The inventory stopped working</h2>
        <p>Close it and open it again. If this keeps happening, make a support ticket and say what you were doing.</p>
        <Button onclick={close}>Close inventory</Button>
    </div>
</div>

<style>
    .crash {
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
        background: var(--inv-scrim);
    }
    .box {
        width: 480px;
        padding: var(--au-s6);
        background: var(--au-bg);
        border: 2px solid var(--au-ink);
    }
    h2 {
        font-size: var(--au-fs-md);
    }
    p {
        font-size: var(--au-fs-xs);
        color: var(--au-muted);
    }
</style>
