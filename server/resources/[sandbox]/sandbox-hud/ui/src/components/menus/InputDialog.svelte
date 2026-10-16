<script>
    import { Modal, Button, Field, TextInput, Textarea, Select, fetchNui, onKey } from '@sandbox/ui-kit';
    import { ui } from '../../state/ui.svelte.js';

    /** Form dialog for Input:Show (client/input.lua). Values are submitted as strings keyed by input id. */
    const input = $derived(ui.input);
    let values = $state({});

    // $effect.pre runs before the DOM updates, so every bound value exists on first render.
    $effect.pre(() => {
        if (!input.showing) return;
        const next = {};
        for (const inp of input.inputs) {
            const o = inp.options ?? {};
            next[inp.id] = o.value ?? o.defaultValue ?? '';
        }
        values = next;
    });

    const close = () => fetchNui('Input:Close', { event: input.event, values: false, data: input.data });
    function submit(e) {
        e?.preventDefault();
        const out = {};
        for (const inp of input.inputs) out[inp.id] = values[inp.id] === undefined || values[inp.id] === null ? '' : String(values[inp.id]);
        fetchNui('Input:Submit', { event: input.event, values: out, data: input.data });
    }

    onKey('Escape', () => (input.showing ? close() : false));
</script>

{#if input.showing}
    <div class="hud-ui">
        <Modal title={input.title ?? 'Input'} onclose={close} width="440px">
            <form id="hud-input-form" onsubmit={submit}>
                {#each input.inputs as inp, i (inp.id)}
                    {@const o = inp.options ?? {}}
                    {@const id = `inp-${inp.id}`}
                    <Field label={inp.label ?? input.label ?? ''} {id} hint={o.hint}>
                        {#if inp.type === 'multiline'}
                            <Textarea {id} bind:value={values[inp.id]} rows={3} disabled={o.disabled} placeholder={o.placeholder} />
                        {:else if inp.type === 'select'}
                            <Select {id} bind:value={values[inp.id]} options={(inp.select ?? []).map((s) => ({ value: s.value, label: s.label ?? s.value }))} disabled={o.disabled} />
                        {:else}
                            <TextInput
                                {id}
                                type={inp.type === 'number' ? 'number' : 'text'}
                                inputmode={inp.type === 'number' ? 'numeric' : undefined}
                                bind:value={values[inp.id]}
                                disabled={o.disabled}
                                placeholder={o.placeholder}
                                min={o.inputProps?.min}
                                max={o.inputProps?.max}
                                autofocus={i === 0 && !o.disabled}
                            />
                        {/if}
                    </Field>
                {/each}
            </form>
            {#snippet actions()}
                <Button variant="secondary" onclick={close}>Cancel</Button>
                <Button type="submit" form="hud-input-form">Submit</Button>
            {/snippet}
        </Modal>
    </div>
{/if}
