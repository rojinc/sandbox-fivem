<script>
    import { Button } from '@sandbox/ui-kit';
    import { phone, savePosition } from '../../state/phone.svelte.js';
    import { showAlert } from '../../state/notify.svelte.js';

    /** Shown while the player drags the phone: save the new place, dock it, or cancel. */
    let { onCancel } = $props();

    function save() {
        phone.moving = false;
        savePosition();
        showAlert('Phone position saved', 'success');
    }
    function dock() {
        phone.position = null;
        phone.moving = false;
        savePosition();
        showAlert('Phone docked bottom right', 'success');
    }
</script>

<div class="move">
    <h2 class="move__title">Move the phone</h2>
    <p>Drag the phone to where you want it on your screen.</p>
    <div class="move__actions">
        <Button onclick={save}>Save position</Button>
        <Button variant="secondary" onclick={dock}>Dock bottom right</Button>
        <Button variant="tertiary" onclick={onCancel}>Cancel</Button>
    </div>
</div>

<style>
    .move {
        position: absolute;
        inset: 0;
        z-index: 50;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: var(--au-s6) var(--au-s5);
        background: var(--au-bg);
        border: 4px solid var(--au-focus);
        cursor: move;
    }
    .move__title {
        font-size: var(--au-fs-md);
    }
    p {
        font-size: var(--au-fs-xs);
    }
    .move__actions {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: var(--au-s3);
        cursor: default;
    }
</style>
