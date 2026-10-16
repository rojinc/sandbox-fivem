<script>
    import { fade } from 'svelte/transition';
    import { Tag, PageAlert } from '@sandbox/ui-kit';
    import { radar, hasSpeed, isFastArmed } from '../../state/radar.svelte.js';
    import { POSITIONS, DEFAULT_POSITION } from '../../positions.js';
    import AntennaRow from './AntennaRow.svelte';
    import SpeedReadout from './SpeedReadout.svelte';
    import KeyHints from './KeyHints.svelte';

    /** The in-car radar unit: docked by settings.location, sized by settings.scale. Never takes focus. */
    const settings = $derived(radar.settings);
    const data = $derived(radar.data);

    const pos = $derived(POSITIONS[settings.location] ?? POSITIONS[DEFAULT_POSITION]);
    const scale = $derived(Math.min(1.5, Math.max(0.85, (Number(settings.scale) || 100) / 100)));

    const armed = $derived(isFastArmed(settings));
    const locked = $derived(Boolean(data.frontFast?.locked || data.rearFast?.locked));
    const anyFast = $derived(hasSpeed(data.frontFast) || hasSpeed(data.rearFast));
    const anyXmit = $derived(Boolean(settings.frontRadar?.transmit || settings.rearRadar?.transmit));
    const tracking = $derived(hasSpeed(data.frontRadar) || hasSpeed(data.rearRadar));

    /** One alert row per flagged plate in any record (fast records carry `flag`; live ones may in future). */
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

    const status = $derived(
        flagged.length
            ? { tone: 'error', text: 'Flagged plate in beam' }
            : locked
              ? { tone: 'error', text: 'Fast reading locked' }
              : anyFast
                ? { tone: 'warning', text: 'Fast reading held' }
                : !anyXmit
                  ? { tone: 'default', text: 'Antennas off' }
                  : tracking
                    ? { tone: 'success', text: 'Tracking' }
                    : { tone: 'default', text: 'Standby' },
    );

    const hints = $derived(
        [
            anyFast || locked ? { key: 'Num *', label: locked ? 'Release' : 'Lock' } : null,
            { key: 'Num /', label: 'Remote' },
            { key: 'Num -', label: 'Hide' },
        ].filter(Boolean),
    );
</script>

{#if radar.visible}
    <div class="dock" style={pos.style} transition:fade={{ duration: 200 }}>
        <section class="unit au-dark" style="transform:scale({scale});transform-origin:{pos.origin}" aria-label="Speed radar">
            <header class="unit__head">
                <div class="unit__title">
                    <span class="unit__name">Speed radar</span>
                    <span class="unit__model au-muted">Prowler 2X</span>
                </div>
                <div class="unit__lamps">
                    <Tag tone={armed ? 'warning' : 'default'}>{armed ? `Fast alert ${settings.fastSpeed} mph` : 'Fast alert off'}</Tag>
                    {#if locked}<Tag tone="error" solid>Locked</Tag>{/if}
                </div>
            </header>

            <div class="unit__body">
                <div class="unit__antennas">
                    <AntennaRow name="Front" settings={settings.frontRadar} target={data.frontRadar} fast={data.frontFast} fastSpeed={settings.fastSpeed} />
                    <AntennaRow name="Rear" settings={settings.rearRadar} target={data.rearRadar} fast={data.rearFast} fastSpeed={settings.fastSpeed} />
                </div>
                <div class="unit__patrol">
                    <span class="radar-label">Patrol</span>
                    <SpeedReadout value={typeof data.patrolSpeed === 'number' ? data.patrolSpeed : 0} size={44} />
                    <span class="unit__mph au-muted">mph</span>
                </div>
            </div>

            {#if flagged.length}
                <div class="unit__alerts">
                    {#each flagged as f (f.plate)}
                        <PageAlert type="error" compact>
                            <strong>Flagged plate</strong> <span class="au-mono unit__plate">{f.plate}</span>: {f.reason}
                        </PageAlert>
                    {/each}
                </div>
            {/if}

            <footer class="unit__foot">
                <Tag tone={status.tone} solid={status.tone !== 'default'}>{status.text}</Tag>
                <KeyHints {hints} />
            </footer>
        </section>
    </div>
{/if}

<style>
    .dock {
        position: absolute;
    }
    .unit {
        width: 640px;
        background: var(--au-bg);
        color: var(--au-text);
        border-radius: var(--au-radius);
        box-shadow: var(--au-shadow-2);
        overflow: hidden;
        transition: transform var(--au-slow) var(--au-ease);
    }
    .unit__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        min-height: 44px;
        padding: 8px 16px;
        background: var(--au-bg-alt-shade);
    }
    .unit__title {
        display: flex;
        align-items: baseline;
        gap: 8px;
        min-width: 0;
    }
    .unit__name {
        font-size: 16px;
        font-weight: 700;
        white-space: nowrap;
    }
    .unit__model {
        font-size: 14px;
        white-space: nowrap;
    }
    .unit__lamps {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;
    }
    .unit__body {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 120px;
    }
    .unit__antennas {
        display: flex;
        flex-direction: column;
        min-width: 0;
    }
    .unit__antennas > :global(* + *) {
        border-top: 1px solid var(--au-bg-alt-shade);
    }
    .unit__patrol {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 12px;
        background: var(--au-bg-shade);
        border-left: 1px solid var(--au-bg-alt-shade);
    }
    .unit__mph {
        font-size: 14px;
        line-height: 1;
    }
    .unit__alerts {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 8px 12px;
        border-top: 1px solid var(--au-bg-alt-shade);
        font-size: 14px;
    }
    .unit__alerts :global(.au-alert) {
        margin: 0;
    }
    .unit__plate {
        font-weight: 700;
        letter-spacing: 0.04em;
    }
    .unit__foot {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        min-height: 40px;
        padding: 6px 16px;
        background: var(--au-bg-alt);
        font-size: 14px;
    }
</style>
