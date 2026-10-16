<script>
    import { fade } from 'svelte/transition';
    import { Icon } from '@sandbox/ui-kit';
    import { radar, hasSpeed, isFastArmed } from '../../state/radar.svelte.js';
    import { POSITIONS, DEFAULT_POSITION } from '../../positions.js';
    import AntennaRow from './AntennaRow.svelte';
    import LedDigits from './LedDigits.svelte';
    import Lamp from './Lamp.svelte';

    /**
     * The dash-mounted radar unit: a black housing with a front and a rear antenna
     * row, the patrol speed window, lit warning lines for flagged plates and a
     * lamp strip along the bottom lip. Docked by settings.location, sized by
     * settings.scale. Never takes focus.
     */
    const settings = $derived(radar.settings);
    const data = $derived(radar.data);

    const pos = $derived(POSITIONS[settings.location] ?? POSITIONS[DEFAULT_POSITION]);
    const scale = $derived(Math.min(1.5, Math.max(0.85, (Number(settings.scale) || 100) / 100)));

    const armed = $derived(isFastArmed(settings));
    const locked = $derived(Boolean(data.frontFast?.locked || data.rearFast?.locked));
    const anyFast = $derived(hasSpeed(data.frontFast) || hasSpeed(data.rearFast));
    const anyXmit = $derived(Boolean(settings.frontRadar?.transmit || settings.rearRadar?.transmit));
    const tracking = $derived(hasSpeed(data.frontRadar) || hasSpeed(data.rearRadar));

    /** One warning line per flagged plate in any record (fast records carry `flag`; live ones may in future). */
    const flagged = $derived.by(() => {
        const rows = new Map();
        for (const rec of [data.frontFast, data.rearFast, data.frontRadar, data.rearRadar]) {
            if (!rec?.flag) continue;
            const plate = typeof rec.plate === 'string' && rec.plate.trim() ? rec.plate.trim().toUpperCase() : 'Unknown plate';
            const reason = typeof rec.flag === 'string' && rec.flag.trim() ? rec.flag.trim() : 'No reason recorded';
            if (!rows.has(plate)) rows.set(plate, reason);
        }
        return [...rows].map(([plate, reason]) => ({ plate, reason }));
    });

    /** The one status word lit on the lamp strip. */
    const status = $derived(
        flagged.length
            ? { tone: 'red', text: 'Flagged plate' }
            : locked
              ? { tone: 'red', text: 'Locked' }
              : anyFast
                ? { tone: 'amber', text: 'Fast held' }
                : !anyXmit
                  ? { tone: 'muted', text: 'Antennas off' }
                  : tracking
                    ? { tone: 'green', text: 'Tracking' }
                    : { tone: 'white', text: 'Standby' },
    );
</script>

{#if radar.visible}
    <div class="dock" style={pos.style} transition:fade={{ duration: 200 }}>
        <section class="unit" style="transform:scale({scale});transform-origin:{pos.origin}" aria-label="Speed radar">
            <div class="unit__face">
                <div class="unit__antennas">
                    <AntennaRow name="Front" settings={settings.frontRadar} target={data.frontRadar} fast={data.frontFast} fastSpeed={settings.fastSpeed} />
                    <AntennaRow name="Rear" settings={settings.rearRadar} target={data.rearRadar} fast={data.rearFast} fastSpeed={settings.fastSpeed} />
                </div>
                <div class="unit__patrol">
                    <span class="radar-label">Patrol</span>
                    <div class="patrol-win">
                        <LedDigits value={typeof data.patrolSpeed === 'number' ? data.patrolSpeed : 0} tone="green" size={48} />
                    </div>
                    <span class="radar-label">mph</span>
                </div>
            </div>

            {#if flagged.length}
                <div class="unit__flags">
                    {#each flagged as f (f.plate)}
                        <div class="flag" role="alert">
                            <Icon icon="alert-triangle" />
                            <span class="flag__text">
                                <strong>Flagged plate</strong>
                                <span class="au-mono flag__plate">{f.plate}</span>
                                <span class="flag__reason">{f.reason}</span>
                            </span>
                        </div>
                    {/each}
                </div>
            {/if}

            <div class="unit__strip">
                <span class="unit__model" aria-hidden="true">Prowler 2X</span>
                <span class="unit__lamps">
                    <span class="unit__alert">
                        <Lamp on={armed} tone="amber">Fast alert</Lamp>
                        <span class="unit__alert-value au-mono" class:is-on={armed}>{armed ? `${settings.fastSpeed} MPH` : 'OFF'}</span>
                    </span>
                    <span class="unit__status" role="status"><Lamp on tone={status.tone}>{status.text}</Lamp></span>
                </span>
            </div>
        </section>
    </div>
{/if}

<style>
    .dock {
        position: absolute;
    }
    /* Housing: black body, 1px edge, slight inner shadow. */
    .unit {
        width: 640px;
        padding: 4px 14px 0;
        background: var(--au-bg-sunk);
        border: 1px solid var(--au-border);
        border-radius: var(--au-radius-lg);
        color: var(--au-text);
        box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.04),
            inset 0 -3px 8px rgba(0, 0, 0, 0.55),
            var(--au-shadow-1);
        transition: transform var(--au-slow) var(--au-ease);
    }
    .unit__face {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 128px;
        gap: 14px;
    }
    .unit__antennas {
        display: flex;
        flex-direction: column;
        min-width: 0;
    }
    .unit__antennas > :global(* + *) {
        border-top: 1px solid var(--au-border);
    }
    .unit__patrol {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        justify-content: center;
        gap: 6px;
        padding: 10px 0;
        text-align: center;
    }
    .patrol-win {
        display: flex;
        align-items: center;
        justify-content: center;
        flex: 1;
        max-height: 120px;
        background: var(--hud-black);
        border: 1px solid #000;
        border-radius: var(--au-radius);
        box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.9);
    }
    .unit__flags {
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding: 2px 0 10px;
    }
    /* Lit warning line: tinted, no edge bar. */
    .flag {
        display: flex;
        align-items: center;
        gap: 8px;
        min-height: 32px;
        padding: 4px 10px;
        background: var(--au-error-bg);
        border-radius: var(--au-radius);
        color: var(--au-error);
        font-size: 14px;
        line-height: 20px;
    }
    .flag :global(.au-icon) {
        font-size: 16px;
    }
    .flag__text {
        display: flex;
        align-items: baseline;
        gap: 8px;
        min-width: 0;
    }
    .flag__plate {
        font-weight: 700;
        letter-spacing: 0.06em;
    }
    .flag__reason {
        min-width: 0;
        color: var(--au-text);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    /* Bottom lip: printed model name and the lamp strip. */
    .unit__strip {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        height: 32px;
        margin: 0 -14px;
        padding: 0 14px;
        border-top: 1px solid var(--au-border);
    }
    .unit__model {
        font-size: 12px;
        font-weight: 500;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: var(--au-hint);
    }
    .unit__lamps {
        display: inline-flex;
        align-items: center;
        gap: 20px;
    }
    .unit__alert,
    .unit__status {
        display: inline-flex;
        align-items: center;
        gap: 6px;
    }
    .unit__alert-value {
        font-size: 12px;
        font-weight: 500;
        line-height: 16px;
        letter-spacing: 0.04em;
        color: var(--au-hint);
    }
    .unit__alert-value.is-on {
        color: var(--au-warning);
    }
</style>
