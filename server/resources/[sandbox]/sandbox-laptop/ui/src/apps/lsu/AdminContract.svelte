<script>
    import { Modal, Button, Field, TextInput, Select, Checkbox, PageAlert } from '@sandbox/ui-kit';
    import { fetchNui } from '@sandbox/ui-kit/nui';
    import { showAlert } from '../../state/notify.svelte.js';
    import { serverMessage } from '../../lib/messages.js';

    /** LS Underground admins: give yourself a custom contract (Boosting:Admin:CreateContract). */
    let { onclose } = $props();

    const CLASSES = ['D', 'C', 'B', 'A', 'A+', 'S+'].map((c) => ({ value: c, label: c }));

    let form = $state({ class: 'D', vehicle: '', make: '', model: '', trackers: '0', price: '20', skipRep: false, payoutOverride: '0' });
    let errors = $state({});
    let failure = $state(null);
    let busy = $state(false);

    const whole = (v) => /^\d+$/.test(String(v).trim());

    async function submit() {
        const e = {};
        if (!form.vehicle.trim()) e.vehicle = 'Enter the spawn name of the vehicle, like zentorno';
        if (!form.make.trim()) e.make = 'Enter the make, like Pegassi';
        if (!form.model.trim()) e.model = 'Enter the model, like Zentorno';
        if (!whole(form.trackers)) e.trackers = 'Enter a whole number of trackers, 0 or more';
        if (!whole(form.price) || Number(form.price) < 1) e.price = 'Enter a buy-in of 1 $VRM or more';
        if (!whole(form.payoutOverride)) e.payoutOverride = 'Enter a whole number, or 0 for the default payout';
        errors = e;
        failure = null;
        if (Object.keys(e).length) return;
        busy = true;
        const res = await fetchNui('Boosting:Admin:CreateContract', {
            vehicle: form.vehicle.trim(),
            make: form.make.trim(),
            model: form.model.trim(),
            class: form.class,
            trackers: parseInt(form.trackers, 10),
            price: parseInt(form.price, 10),
            skipRep: form.skipRep,
            payoutOverride: parseInt(form.payoutOverride, 10),
        });
        busy = false;
        if (res && !(typeof res === 'object' && res.success === false)) {
            showAlert('Contract created', 'success');
            onclose();
        } else {
            failure = serverMessage(res?.message, 'The contract was not created. Check the class and buy-in, then try again.');
        }
    }
</script>

<Modal title="Create a contract" eyebrow="Admin" {onclose} width="640px">
    {#if failure}<PageAlert type="error" compact>{failure}</PageAlert>{/if}
    <div class="form-grid">
        <Field label="Vehicle class" id="ac-class">
            <Select id="ac-class" bind:value={form.class} options={CLASSES} />
        </Field>
        <Field label="Spawn name" hint="The vehicle model the game spawns" id="ac-vehicle" error={errors.vehicle}>
            <TextInput id="ac-vehicle" bind:value={form.vehicle} invalid={Boolean(errors.vehicle)} autocomplete="off" />
        </Field>
        <Field label="Make" id="ac-make" error={errors.make}>
            <TextInput id="ac-make" bind:value={form.make} invalid={Boolean(errors.make)} autocomplete="off" />
        </Field>
        <Field label="Model" id="ac-model" error={errors.model}>
            <TextInput id="ac-model" bind:value={form.model} invalid={Boolean(errors.model)} autocomplete="off" />
        </Field>
        <Field label="Trackers" hint="0 skips the tracker stage" id="ac-trackers" error={errors.trackers}>
            <TextInput id="ac-trackers" bind:value={form.trackers} inputmode="numeric" invalid={Boolean(errors.trackers)} />
        </Field>
        <Field label="Buy-in in $VRM" hint="What the contract costs to start" id="ac-price" error={errors.price}>
            <TextInput id="ac-price" bind:value={form.price} inputmode="numeric" invalid={Boolean(errors.price)} />
        </Field>
        <Field label="Payout" hint="0 uses the default payout" id="ac-payout" error={errors.payoutOverride}>
            <TextInput id="ac-payout" bind:value={form.payoutOverride} inputmode="numeric" invalid={Boolean(errors.payoutOverride)} />
        </Field>
        <div class="check">
            <Checkbox bind:checked={form.skipRep} label="No reputation reward" />
        </div>
    </div>
    {#snippet actions()}
        <Button variant="secondary" onclick={onclose}>Cancel</Button>
        <Button loading={busy} onclick={submit}>Create contract</Button>
    {/snippet}
</Modal>

<style>
    .check {
        display: flex;
        align-items: flex-end;
        padding-bottom: var(--au-s4);
    }
</style>
