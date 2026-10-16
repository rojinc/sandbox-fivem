<script>
    import { Icon, RichText, TextInput } from '@sandbox/ui-kit';
    import { view } from '../state/menu.svelte.js';
    import { activate, step, setCursor, hoverRow, setSlider, commitPending, pickColor, pickOption, endEdit, typeText, leaveEditor, setChannel, moveEditor } from '../lib/actions.js';
    import { sliderSpec, formatFixed, tickerSpec, selectIndex, optionLabel, colorListIndex, colorCss, toHex, toRgb, textClasses, isChecked, looksNumeric, num } from '../lib/items.js';
    import Track from './Track.svelte';
    import OptionList from './OptionList.svelte';
    import ColorEditor from './ColorEditor.svelte';

    /** One menu row. Every item type in CONTRACT.md is drawn here; what they do lives in lib/actions.js. */
    let { item, index, selected = false } = $props();

    const o = $derived(item.options);
    const type = $derived(item.type);
    const disabled = $derived(Boolean(o.disabled));
    const editing = $derived(view.editing?.id === item.id ? view.editing : null);
    const controls = $derived(selected && !disabled);
    const label = $derived(item.label || (type === 'COLORPICKER' || type === 'COLORLIST' ? (o.label ?? 'Colour') : ''));
    const typing = $derived(editing?.mode === 'text' || editing?.mode === 'entry');
    const stacked = $derived(type === 'SLIDER' || type === 'COLORLIST' || (editing && editing.mode !== 'entry'));

    const slider = $derived(type === 'SLIDER' ? sliderSpec(o) : null);
    const ticker = $derived(type === 'TICKER' ? tickerSpec(o) : null);
    const selectAt = $derived(type === 'SELECT' ? selectIndex(o) : -1);
    const colorAt = $derived(type === 'COLORLIST' ? colorListIndex(o) : -1);
    const pickerColor = $derived(type === 'COLORPICKER' ? (editing?.mode === 'color' ? editing.draft : toRgb(o.current)) : null);

    let fieldEl = $state();

    // A text field takes the keyboard as soon as it opens.
    $effect(() => {
        const input = fieldEl?.querySelector('input');
        if (!input) return;
        input.focus();
        try {
            input.select();
        } catch {
            /* number inputs in some engines */
        }
    });

    function rowClick() {
        if (editing) return;
        leaveEditor();
        setCursor(index);
        if (type === 'SLIDER' || type === 'COLORLIST') return;
        activate(item);
    }

    const stop = (fn) => (e) => {
        e.stopPropagation();
        fn();
    };
</script>

{#snippet cycler(text, mono, after)}
    <!-- The chevrons appear on the selected row only; other rows show the value flush right. -->
    <span class="cycler" class:has-controls={controls}>
        {#if controls}
            <button type="button" class="chev" tabindex="-1" aria-label="Previous" onclick={stop(() => step(item, -1))}>
                <Icon icon="chevron-left" stroke={2.25} />
            </button>
        {/if}
        <span class="cycler__value">
            {#if text === null}<span class="muted">Not set</span>{:else}<span class:au-mono={mono}>{text}</span>{/if}{#if after}<span class="muted">{after}</span>{/if}
        </span>
        {#if controls}
            <button type="button" class="chev" tabindex="-1" aria-label="Next" onclick={stop(() => step(item, 1))}>
                <Icon icon="chevron-right" stroke={2.25} />
            </button>
        {/if}
    </span>
{/snippet}

{#snippet field()}
    <div class="field" class:field--inline={editing?.mode === 'entry'} bind:this={fieldEl}>
        <TextInput
            size="sm"
            value={editing?.draft ?? ''}
            type={type === 'INPUT' ? 'text' : 'number'}
            mono={type !== 'INPUT'}
            maxlength={type === 'INPUT' ? num(o.max, 1024) : undefined}
            min={editing?.mode === 'entry' ? ticker?.min : o.min}
            max={editing?.mode === 'entry' ? ticker?.max : o.max}
            inputmode={type === 'INPUT' ? undefined : 'numeric'}
            aria-label={label}
            oninput={(e) => typeText(item, e.currentTarget.value)}
            onblur={() => {
                if (view.editing?.id === item.id) endEdit(true);
            }}
        />
    </div>
{/snippet}

{#if type === 'TEXT'}
    <div class="text {textClasses(o.classes)}" data-index={index}>
        <RichText text={item.label} tag="div" />
    </div>
{:else}
    <!-- The menu keyboard handler (lib/keys.js) drives every row. -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div
        class="row"
        class:is-selected={selected}
        class:is-disabled={disabled}
        class:is-stacked={stacked}
        data-index={index}
        role={type === 'CHECKBOX' ? 'menuitemcheckbox' : 'menuitem'}
        tabindex="-1"
        aria-checked={type === 'CHECKBOX' ? isChecked(o) : undefined}
        aria-disabled={disabled || undefined}
        onpointermove={(e) => hoverRow(index, e)}
        onclick={rowClick}
    >
        <div class="row__line">
            <span class="row__label" class:is-error={type === 'BUTTON' && o.error}>{label}</span>

            {#if type === 'BUTTON'}
                {#if disabled}
                    <span class="value muted">Unavailable</span>
                {:else if o.success}
                    <span class="value status-ok"><Icon icon="check" stroke={2.5} /></span>
                {/if}
            {:else if type === 'ADVANCED'}
                {#if o.secondaryLabel !== undefined && o.secondaryLabel !== null}
                    <span class="value" class:au-mono={looksNumeric(o.secondaryLabel)}>{o.secondaryLabel}</span>
                {/if}
            {:else if type === 'CHECKBOX'}
                <span class="box" class:is-on={isChecked(o)} aria-hidden="true">
                    <svg viewBox="0 0 24 24"><path d="M5 12l5 5l10 -10" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" /></svg>
                </span>
            {:else if type === 'SLIDER'}
                <span class="value au-mono">{formatFixed(slider, o.current)}</span>
            {:else if type === 'TICKER'}
                {#if editing?.mode === 'entry'}
                    {@render field()}
                {:else}
                    {@render cycler(String(Math.round(num(o.current, ticker.min))), true, ` of ${ticker.max}`)}
                {/if}
            {:else if type === 'SELECT'}
                {#if !editing}{@render cycler(selectAt >= 0 ? optionLabel(o.list[selectAt]) : null, false, '')}{/if}
            {:else if type === 'COLORLIST'}
                <span class="value" class:muted={colorAt < 0}>{colorAt >= 0 ? (o.colors[colorAt].label ?? `Colour ${colorAt + 1}`) : 'Not set'}</span>
            {:else if type === 'COLORPICKER'}
                <span class="value">
                    <span class="chip" style="background:{toHex(pickerColor)}"></span>
                    <span class="au-mono">{toHex(pickerColor)}</span>
                </span>
            {:else if type === 'INPUT' || type === 'NUMBER'}
                {#if !typing}
                    {#if o.current === null || o.current === undefined || o.current === ''}
                        <span class="value muted">Empty</span>
                    {:else}
                        <span class="value value--text au-truncate" class:au-mono={type === 'NUMBER'}>{o.current}</span>
                    {/if}
                {/if}
            {:else if type === 'SUBMENU'}
                {#if disabled}
                    <span class="value muted">Unavailable</span>
                {:else}
                    {#if controls}<span class="value chev-next"><Icon icon="chevron-right" stroke={2.25} /></span>{/if}
                {/if}
            {:else if type === 'GOBACK' && disabled}
                <span class="value muted">Unavailable</span>
            {/if}
        </div>

        {#if type === 'SLIDER'}
            <Track
                value={num(o.current, slider.min)}
                min={slider.min}
                max={slider.max}
                {disabled}
                {label}
                onchange={(v) => {
                    setCursor(index);
                    setSlider(item, v);
                }}
                oncommit={commitPending}
            />
        {:else if type === 'COLORLIST'}
            <div class="swatches" role="radiogroup" aria-label={label}>
                {#each o.colors ?? [] as c, ci (ci)}
                    <button
                        type="button"
                        class="swatch"
                        class:is-current={ci === colorAt}
                        style="background:{colorCss(c)}"
                        role="radio"
                        aria-checked={ci === colorAt}
                        aria-label={c.label ?? `Colour ${ci + 1}`}
                        tabindex="-1"
                        {disabled}
                        onclick={stop(() => {
                            setCursor(index);
                            pickColor(item, ci);
                        })}
                    ></button>
                {/each}
            </div>
        {:else if editing?.mode === 'text'}
            {@render field()}
        {:else if editing?.mode === 'list'}
            <OptionList options={o.list ?? []} active={editing.index} current={selectAt} {label} onhover={(i) => (editing.index = i)} onpick={pickOption} />
        {:else if editing?.mode === 'color'}
            <ColorEditor
                draft={editing.draft}
                active={editing.index}
                onactivate={(i) => moveEditor(i - editing.index)}
                onchange={setChannel}
                onsave={() => endEdit(true)}
                oncancel={() => endEdit(false)}
            />
        {/if}
    </div>
{/if}

<style>
    .row {
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: var(--au-s2);
        min-height: 52px;
        padding: 10px 20px;
        cursor: pointer;
    }
    .row.is-stacked {
        padding-bottom: 14px;
    }
    .row.is-selected {
        background: var(--au-bg-alt-shade);
    }
    .row__line {
        display: flex;
        align-items: center;
        gap: var(--au-s4);
        min-height: 32px;
    }
    .row__label {
        flex: 1;
        min-width: 0;
        font-size: var(--au-fs-sm);
        line-height: 1.3;
        overflow-wrap: anywhere;
    }
    .row.is-selected .row__label {
        font-weight: 700;
    }
    .row__label.is-error {
        color: var(--au-error);
    }
    .row.is-disabled {
        cursor: default;
    }
    .row.is-disabled .row__label,
    .row.is-disabled .value,
    .row.is-disabled .cycler {
        color: var(--au-muted);
    }

    .value {
        flex-shrink: 0;
        display: inline-flex;
        align-items: center;
        gap: var(--au-s2);
        max-width: 55%;
        font-size: var(--au-fs-xs);
        font-variant-numeric: tabular-nums;
    }
    .value--text {
        display: block;
    }
    .muted {
        color: var(--au-muted);
    }
    .status-ok {
        color: var(--au-success);
        font-size: 22px;
    }

    .cycler {
        display: inline-flex;
        align-items: center;
        flex-shrink: 0;
        max-width: 60%;
        font-size: var(--au-fs-xs);
        font-variant-numeric: tabular-nums;
    }
    .cycler__value {
        min-width: 2ch;
        text-align: center;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .chev {
        width: 32px;
        height: 32px;
        flex-shrink: 0;
        padding: 0;
        border: 0;
        background: transparent;
        color: var(--au-ink);
        display: grid;
        place-items: center;
        font-size: 20px;
        cursor: pointer;
    }
    .chev:hover {
        background: var(--au-bg-alt);
    }
    .cycler.has-controls {
        margin-right: -6px;
    }
    .chev-next {
        font-size: 20px;
        color: var(--au-ink);
    }

    .box {
        flex-shrink: 0;
        width: 28px;
        height: 28px;
        border: 2px solid var(--au-ink);
        background: var(--au-input-bg);
        color: var(--au-ink);
        display: grid;
        place-items: center;
    }
    .box svg {
        width: 20px;
        height: 20px;
        opacity: 0;
    }
    .box.is-on svg {
        opacity: 1;
    }
    .row.is-disabled .box {
        border-color: var(--au-muted);
        color: var(--au-muted);
    }

    .chip {
        width: 24px;
        height: 24px;
        border: 2px solid var(--au-ink);
    }

    .swatches {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
    }
    .swatch {
        width: 28px;
        height: 28px;
        padding: 0;
        border: 1px solid var(--au-border);
        cursor: pointer;
    }
    .swatch.is-current {
        outline: 2px solid var(--au-ink);
        outline-offset: 2px;
    }
    .swatch:disabled {
        cursor: not-allowed;
    }

    .field {
        width: 100%;
    }
    .field--inline {
        width: 120px;
        flex-shrink: 0;
    }

    .text {
        padding: 8px 20px;
        font-size: var(--au-fs-xs);
        line-height: 1.45;
        color: var(--au-muted);
        font-variant-numeric: tabular-nums;
        overflow-wrap: anywhere;
    }
    .text.is-heading {
        padding-top: 20px;
        font-size: var(--au-fs-sm);
        font-weight: 700;
        color: var(--au-text);
    }
    .text.is-pad {
        padding-top: 12px;
        padding-bottom: 12px;
    }
    .text.is-bold {
        font-weight: 700;
        color: var(--au-text);
    }
    .text.is-large {
        font-size: var(--au-fs-sm);
    }
    .text.is-xlarge {
        font-size: var(--au-fs-md);
    }
    .text.is-ink {
        color: var(--au-text);
    }
    .text.is-success {
        color: var(--au-success);
    }
    .text.is-warning {
        color: var(--au-warning);
    }
    .text.is-error {
        color: var(--au-error);
    }
</style>
