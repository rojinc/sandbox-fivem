<script>
    import { nav } from '../../state/nav.svelte.js';
    import PlayerList from './PlayerList.svelte';
    import CharacterSearch from './CharacterSearch.svelte';
    import PlayerRecord from './PlayerRecord.svelte';
</script>

<div class="split">
    <div class="split__list">
        {#if nav.playersView === 'characters'}
            <CharacterSearch />
        {:else}
            {#key nav.playersView}
                <PlayerList view={nav.playersView} />
            {/key}
        {/if}
    </div>
    <aside class="split__record" aria-label="Player record">
        {#if nav.player}
            {#key nav.player}
                <PlayerRecord source={nav.player} />
            {/key}
        {:else}
            <h2 class="empty-title">No player selected</h2>
            <p class="note">Select a player in the table to see their account, character and vehicle, and the staff actions you can use on them.</p>
        {/if}
    </aside>
</div>

<style>
    .empty-title {
        margin: 0;
        font-size: var(--au-fs-md);
    }
</style>
