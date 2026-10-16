<script>
    import { Checkbox } from '@sandbox/ui-kit';
    import { fetchNui } from '@sandbox/ui-kit/nui';
    import { app, setCamera, isFreemode, forcedNaked } from '../state/app.svelte.js';
    import { sound } from '../state/ped.svelte.js';
    import { CAMERA_VIEWS, VIEW_FULL } from '../data/sections.js';
    import Glyph from './controls/Glyph.svelte';

    /**
     * Camera and preview controls above the footer. A view button frames that
     * part of the body; pressing it again goes back to the full body.
     */
    const forced = $derived(forcedNaked());
    const freemode = $derived(isFreemode());

    let undress = $state(false);
    $effect.pre(() => {
        undress = forced || app.naked;
    });
</script>

{#snippet tool(icon, label, onclick, pressed)}
    <button type="button" class="ped-tool" class:is-pressed={pressed} aria-label={label} aria-pressed={pressed === undefined ? undefined : pressed} title={label} {onclick}>
        <Glyph {icon} />
    </button>
{/snippet}

<div class="ped-camera">
    <div class="ped-camera__tools" role="toolbar" aria-label="Camera">
        {#each CAMERA_VIEWS as v (v.view)}
            {@render tool(v.icon, `${v.label} view`, () => setCamera(app.camera === v.view ? VIEW_FULL : v.view), app.camera === v.view)}
        {/each}
        <span class="ped-camera__gap"></span>
        {@render tool('rotate', 'Turn left', () => fetchNui('RotateLeft'))}
        {@render tool('rotate-clockwise', 'Turn right', () => fetchNui('RotateRight'))}
        <span class="ped-camera__gap"></span>
        {@render tool('zoom-out', 'Zoom out', () => fetchNui('Zoom', { zoom: 0.15 }))}
        {@render tool('zoom-in', 'Zoom in', () => fetchNui('Zoom', { zoom: -0.15 }))}
    </div>
    <Checkbox
        label="Undress"
        bind:checked={undress}
        disabled={forced || !freemode}
        onchange={(e) => {
            sound('SELECT');
            app.naked = e.currentTarget.checked;
        }}
    />
</div>

<style>
    .ped-camera {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--au-s3);
        padding: var(--au-s2) var(--au-s5);
        border-top: 1px solid var(--au-border);
    }
    .ped-camera__tools {
        display: flex;
        align-items: center;
        gap: var(--au-s1);
    }
    .ped-camera__gap {
        width: var(--au-s3);
    }
    .ped-tool {
        width: 40px;
        height: 40px;
        display: grid;
        place-items: center;
        padding: 0;
        border: 2px solid transparent;
        border-radius: 0;
        background: var(--au-bg-alt);
        color: var(--au-text);
        font-size: 20px;
        cursor: pointer;
        transition: background-color var(--au-fast) var(--au-ease);
    }
    .ped-tool:hover {
        background: var(--au-bg-alt-shade);
    }
    .ped-tool.is-pressed {
        background: var(--au-bg-alt-shade);
        border-color: var(--au-ink);
    }
    .ped-tool:focus-visible {
        outline: 3px solid var(--au-focus);
        outline-offset: 0;
    }
</style>
