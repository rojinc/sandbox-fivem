<script>
    import { onKey } from '@sandbox/ui-kit/nui';
    import { game, finish } from './state/game.svelte.js';
    import { GAMES } from './components/games/index.js';
    import UnknownGame from './components/games/UnknownGame.svelte';

    // The panels are drawn for 1920x1080; larger screens scale them up so they keep their proportions.
    let scale = $state(1);
    $effect(() => {
        const fit = () => {
            const s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
            scale = Math.min(3, Math.max(0.6, s));
        };
        fit();
        window.addEventListener('resize', fit);
        return () => window.removeEventListener('resize', fit);
    });

    // Escape gives up: the game fails through the normal path, so Lua always releases focus.
    onKey('Escape', () => {
        if (!game.showing || game.result !== null) return false;
        finish(game.session, 0);
        return true;
    });

    const Game = $derived(GAMES[game.params?.type] ?? UnknownGame);
</script>

{#if game.showing && game.params}
    {#key game.session}
        <div class="gm-stage" class:is-exiting={game.exiting}>
            <div class="gm-stage__inner" style:zoom={scale}>
                <Game />
            </div>
        </div>
    {/key}
{/if}
