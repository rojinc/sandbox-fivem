<script>
    import { hud } from '../../state/hud.svelte.js';
    import { status } from '../../state/status.svelte.js';
    import { statusAnchor, buffsAnchor } from '../../lib/anchor.js';
    import { isStatusHidden, isStatusLow, statusPercent } from '../../lib/status.js';
    import StatBar from './StatBar.svelte';
    import StatBarSegmented from './StatBarSegmented.svelte';
    import VStatBar from './VStatBar.svelte';
    import VoiceBar from './VoiceBar.svelte';
    import NumberPill from './NumberPill.svelte';
    import Buffs from './Buffs.svelte';

    const anchor = $derived(statusAnchor(hud.position));
    const buffsPos = $derived(buffsAnchor(hud.position));
    const skew = $derived(hud.config.skewed ? `perspective(1000px) rotateY(${Number(hud.config.skewAmount) || 15}deg)` : 'none');
    const hp = $derived(Math.round((Number(status.health) / (Number(status.maxHealth) || 100)) * 100));
    const visible = $derived(
        status.statuses
            .filter((s) => !isStatusHidden(s, status.isDead))
            .sort((a, b) => (a.options?.order ?? 99) - (b.options?.order ?? 99)),
    );
    const bars = $derived(visible.filter((s) => s.options?.force !== 'numbers'));
    const numbers = $derived(visible.filter((s) => s.options?.force === 'numbers'));

    function numberValue(s) {
        if (s.name === 'radio-freq' && hud.config.maskRadio) return '•••';
        return s.value;
    }
</script>

<div class="buffs" style={buffsPos}>
    <Buffs />
</div>
<div class="status" style="{anchor};transform:{skew}">
    <div class="status__row">
        <div class="status__left">
            <StatBarSegmented icon="shield-halved" value={status.armor} color="var(--hud-blue)" />
            <StatBar icon="heart" value={hp} color={status.isDead ? 'var(--hud-red)' : 'var(--hud-green)'} low={status.isDead} />
        </div>
        <div class="status__right">
            <VoiceBar />
            {#each bars as s (s.name)}
                <VStatBar icon={s.icon} value={statusPercent(s)} color={s.color || 'var(--hud-white)'} low={isStatusLow(s)} label={s.name} />
            {/each}
            {#each numbers as s (s.name)}
                <NumberPill icon={s.icon} value={numberValue(s)} color={s.color || 'var(--hud-white)'} label={s.name} />
            {/each}
        </div>
    </div>
</div>

<style>
    .buffs {
        position: absolute;
    }
    .status {
        position: absolute;
        display: flex;
        flex-direction: column;
        gap: 0.5em;
        transform-origin: left center;
        backface-visibility: hidden;
    }
    .status__row {
        display: flex;
        align-items: flex-end;
        gap: 1em;
    }
    .status__left {
        width: 50%;
        display: flex;
        flex-direction: column;
        gap: 0.35em;
    }
    .status__right {
        display: flex;
        align-items: flex-end;
        gap: 0.7em;
        height: 2.7em;
    }
</style>
