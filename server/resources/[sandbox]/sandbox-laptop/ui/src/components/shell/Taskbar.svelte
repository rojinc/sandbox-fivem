<script>
    import { Icon } from '@sandbox/ui-kit';
    import { laptop, requestClose } from '../../state/laptop.svelte.js';
    import { data } from '../../state/data.svelte.js';
    import { windows, toggleApp, topWindow } from '../../state/windows.svelte.js';
    import { appDef } from '../../lib/apps.js';
    import { clock } from '../../lib/format.js';

    /** Bottom bar: open apps as text buttons, the team you are in, the game clock, close. */
    const top = $derived(topWindow());
    const team = $derived(data.myGroup?.Name ?? null);
</script>

<div class="taskbar">
    <ul class="taskbar__apps" aria-label="Open apps">
        {#each windows.list as win (win.app)}
            {@const def = appDef(win.app)}
            {#if def}
                <li>
                    <button type="button" class="taskbar__app" class:is-current={top?.app === win.app} class:is-minimised={win.minimized} aria-pressed={top?.app === win.app} onclick={() => toggleApp(win.app)}>
                        {def.label}
                    </button>
                </li>
            {/if}
        {/each}
    </ul>
    <div class="taskbar__status">
        {#if team}
            <span class="taskbar__team"><Icon icon="users-group" /><span class="au-hidden">Team</span> {team}</span>
        {/if}
        <span class="taskbar__clock au-mono" aria-label="Game time">{clock(laptop.time)}</span>
        <button type="button" class="taskbar__close" onclick={requestClose}><Icon icon="power" stroke={2} />Close laptop</button>
    </div>
</div>

<style>
    .taskbar {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 48px;
        display: flex;
        align-items: stretch;
        gap: var(--au-s4);
        padding: 0 0 0 var(--au-s4);
        background: var(--au-bg-shade);
        border-top: 1px solid var(--au-border);
        font-size: var(--au-fs-xs);
    }
    .taskbar__apps {
        flex: 1;
        min-width: 0;
        display: flex;
        gap: var(--au-s1);
        margin: 0;
        padding: 0;
        list-style: none;
        overflow: hidden;
    }
    .taskbar__app {
        height: 100%;
        padding: 0 var(--au-s4);
        border: 0;
        background: transparent;
        color: var(--au-text);
        font-weight: 700;
        white-space: nowrap;
        cursor: pointer;
    }
    .taskbar__app:hover {
        background: var(--au-bg-alt);
    }
    .taskbar__app.is-current {
        background: var(--au-bg-alt-shade);
        box-shadow: inset 0 -4px var(--au-ink);
    }
    .taskbar__app.is-minimised {
        color: var(--au-muted);
        font-weight: 500;
    }
    .taskbar__app:focus-visible,
    .taskbar__close:focus-visible {
        outline: 3px solid transparent;
        background: var(--au-focus);
        color: var(--au-on-focus);
        box-shadow: inset 0 -4px var(--au-on-focus);
    }
    .taskbar__status {
        display: flex;
        align-items: center;
        gap: var(--au-s5);
        color: var(--au-muted);
        white-space: nowrap;
    }
    .taskbar__team {
        display: inline-flex;
        align-items: center;
        gap: var(--au-s2);
        color: var(--au-text);
    }
    .taskbar__clock {
        color: var(--au-text);
        font-size: var(--au-fs-sm);
    }
    .taskbar__close {
        height: 100%;
        display: inline-flex;
        align-items: center;
        gap: var(--au-s2);
        padding: 0 var(--au-s4);
        border: 0;
        border-left: 1px solid var(--au-border);
        background: transparent;
        color: var(--au-text);
        font-weight: 700;
        cursor: pointer;
    }
    .taskbar__close:hover {
        background: var(--au-bg-alt);
    }
</style>
