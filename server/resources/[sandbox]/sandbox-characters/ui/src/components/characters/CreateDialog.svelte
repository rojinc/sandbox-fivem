<script>
    import { Modal, Button, Field, TextInput, Select, Radio, Textarea } from '@sandbox/ui-kit';
    import { faCheck } from '@fortawesome/free-solid-svg-icons';
    import { COUNTRIES } from '../../data/countries.js';
    import { BIO_MAX, MONTHS, NAME_MAX, buildDobIso, cleanName, dayOptions, validateForm, yearOptions } from '../../lib/validate.js';

    /**
     * New-character form. Produces exactly the body `CreateCharacter` reads:
     *   { first, last, gender: 0|1, dob: ISO string, origin: { label, value } | null, bio }
     * Mounted only while open, so every bound value exists before the first render.
     */
    let { slot = 1, limit = 3, oncancel, onsubmit } = $props();

    let form = $state({ first: '', last: '', gender: 0, day: '', month: '', year: '', origin: '', bio: '' });
    let errors = $state({});
    let touched = $state(false);

    const years = yearOptions();
    const yearOpts = years.map((y) => ({ value: y, label: String(y) }));
    const monthOpts = MONTHS.map((m, i) => ({ value: i, label: m }));
    const countryOpts = COUNTRIES.map((c) => ({ value: c.value, label: c.label }));
    const dayOpts = $derived(dayOptions(form.year, form.month).map((d) => ({ value: d, label: String(d) })));
    const limitText = $derived(limit >= 100 ? 'unlimited' : String(limit));

    const values = () => ({
        first: form.first,
        last: form.last,
        gender: Number(form.gender),
        dob: { year: form.year, month: form.month, day: form.day },
        bio: form.bio,
    });

    // Keep the day inside the new month's length.
    $effect(() => {
        const max = dayOpts.length;
        if (form.day !== '' && Number(form.day) > max) form.day = max;
    });

    // After the first submit attempt, errors clear as the player fixes them.
    $effect(() => {
        if (touched) errors = validateForm(values());
    });

    function submit(e) {
        e?.preventDefault();
        const errs = validateForm(values());
        errors = errs;
        touched = true;
        if (Object.keys(errs).length) return;
        const origin = COUNTRIES.find((c) => c.value === form.origin);
        onsubmit?.({
            first: form.first,
            last: form.last,
            gender: Number(form.gender),
            dob: buildDobIso(form.year, form.month, form.day),
            origin: origin ? { label: origin.label, value: origin.value } : null,
            bio: form.bio.trim(),
        });
    }
</script>

<Modal title="New character" onclose={oncancel} width="680px">
    <p class="intro">Slot {slot} of {limitText}. Name, gender and date of birth are permanent once the character is created.</p>

    <form id="create-character" onsubmit={submit} novalidate autocomplete="off">
        <div class="two">
            <Field label="First name" id="first" required error={errors.first}>
                <TextInput id="first" bind:value={form.first} oninput={() => (form.first = cleanName(form.first))} maxlength={NAME_MAX} invalid={Boolean(errors.first)} spellcheck="false" autofocus />
            </Field>
            <Field label="Last name" id="last" required error={errors.last}>
                <TextInput id="last" bind:value={form.last} oninput={() => (form.last = cleanName(form.last))} maxlength={NAME_MAX} invalid={Boolean(errors.last)} spellcheck="false" />
            </Field>
        </div>

        <Field label="Gender" id="gender-male" required error={errors.gender}>
            <div class="au-row radios">
                <Radio bind:group={form.gender} value={0} name="gender" id="gender-male" label="Male" />
                <Radio bind:group={form.gender} value={1} name="gender" id="gender-female" label="Female" />
            </div>
        </Field>

        <Field label="Date of birth" id="dob-day" required hint="Characters must be 18 or older." error={errors.dob}>
            <div class="dob">
                <Select id="dob-day" bind:value={form.day} options={dayOpts} placeholder="Day" invalid={Boolean(errors.dob)} aria-label="Day" />
                <Select id="dob-month" bind:value={form.month} options={monthOpts} placeholder="Month" invalid={Boolean(errors.dob)} aria-label="Month" />
                <Select id="dob-year" bind:value={form.year} options={yearOpts} placeholder="Year" invalid={Boolean(errors.dob)} aria-label="Year" />
            </div>
        </Field>

        <Field label="Country of origin" id="origin" hint="Optional.">
            <Select id="origin" bind:value={form.origin} options={countryOpts} placeholder="Choose a country" />
        </Field>

        <Field label="Biography" id="bio" required hint={`${form.bio.length} of ${BIO_MAX} characters`} error={errors.bio}>
            <Textarea id="bio" bind:value={form.bio} rows={4} maxlength={BIO_MAX} invalid={Boolean(errors.bio)} placeholder="Who are they, where do they come from, what brought them to Los Santos?" />
        </Field>
    </form>

    {#snippet actions()}
        <Button variant="secondary" onclick={oncancel}>Cancel</Button>
        <Button type="submit" form="create-character" icon={faCheck}>Create character</Button>
    {/snippet}
</Modal>

<style>
    .intro {
        max-width: none;
        margin-bottom: 20px;
    }
    .two {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0 24px;
    }
    .radios {
        gap: 32px;
        padding-top: 4px;
    }
    .dob {
        display: grid;
        grid-template-columns: 120px 1fr 140px;
        gap: 12px;
    }
</style>
