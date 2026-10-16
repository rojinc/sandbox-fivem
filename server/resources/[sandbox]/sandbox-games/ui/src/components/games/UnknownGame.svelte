<script>
    import Frame from '../Frame.svelte';
    import { game, control } from '../../state/game.svelte.js';
    import { useTimeout } from '../../lib/runes.svelte.js';

    /** A `type` this UI does not implement: fail it so Lua releases focus. */
    const { params, fail } = control();
    const over = $derived(game.result !== null);
    useTimeout(
        () => fail(),
        () => (!over ? 600 : null),
    );
</script>

<Frame title="Unsupported minigame" width={360}>
    <p class="un-text">The game type “{String(params.type)}” is not available in this interface.</p>
</Frame>

<style>
    .un-text {
        margin: 0;
        font-size: var(--au-fs-xs);
        color: var(--au-muted);
    }
</style>
