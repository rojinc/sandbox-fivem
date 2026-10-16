<script>
    import { tick } from 'svelte';
    import { Modal, Button, Field, TextInput, Select, Radio, Textarea } from '@sandbox/ui-kit';
    import { COUNTRIES } from '../../data/countries.js';
    import { BIO_MAX, MONTHS, NAME_MAX, buildDobIso, cleanName, dayOptions, validateForm, yearOptions } from '../../lib/validate.js';

    /**
     * New-character form. Produces exactly the body `CreateCharacter` reads:
     *   { first, last, gender: 0|1, dob: ISO string, origin: { label, value } | null, bio }
     * Mounted only while open, so every bound value exists before the first render.
     * Validates on submit: an error summary at the top takes focus and links to
     * each field; each field shows its own error above the input.
     */
    let { slot = 1, limit = 3, oncancel, onsubmit } = $props();

    let form = $state({ first: '', last: '', gender: 0, day: '', month: '', year: '', origin: '', bio: '' });
    let errors = $state({});
    let summaryEl = $state(null);

    const years = yearOptions();
    const yearOpts = years.map((y) => ({ value: y, label: String(y) }));
    const monthOpts = MONTHS.map((m, i) => ({ value: i, label: m }));
    const countryOpts = COUNTRIES.map((c) => ({ value: c.value, label: c.label }));
    const dayOpts = $derived(dayOptions(form.year, form.month).map((d) => ({ value: d, label: String(d) })));
    const slotText = $derived(limit >= 100 ? `This is character ${slot}.` : `This uses slot ${slot} of ${limit}.`);

    /** Order and target of each error in the summary. */
    const FIELDS = [
        ['first', 'first'],
        ['last', 'last'],
        ['gender', 'gender-male'],
        ['dob', 'dob-day'],
        ['bio', 'bio'],
    ];
    const summary = $derived(FIELDS.filter(([k]) => errors[k]).map(([k, target]) => ({ key: k, target, text: errors[k] })));

    // Keep the day inside the new month's length.
    $effect(() => {
        const max = dayOpts.length;
        if (form.day !== '' && Number(form.day) > max) form.day = max;
    });

    async function submit(e) {
        e?.preventDefault();
        errors = validateForm({
            first: form.first,
            last: form.last,
            gender: Number(form.gender),
            dob: { year: form.year, month: form.month, day: form.day },
            bio: form.bio,
        });
        if (Object.keys(errors).length) {
            await tick();
            summaryEl?.focus();
            return;
        }
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

    function jump(e, target) {
        e.preventDefault();
        document.getElementById(target)?.focus();
    }
</script>

<Modal title="Create a character" onclose={oncancel} width="680px" class="cs-create">
    <p class="intro">{slotText} You cannot change the name, gender or date of birth later.</p>

    {#if summary.length}
        <div class="summary" role="alert" tabindex="-1" bind:this={summaryEl} aria-labelledby="create-summary-title">
            <h3 id="create-summary-title">There is a problem</h3>
            <ul>
                {#each summary as s (s.key)}
                    <li><a href="#{s.target}" onclick={(e) => jump(e, s.target)}>{s.text}</a></li>
                {/each}
            </ul>
        </div>
    {/if}

    <form id="create-character" onsubmit={submit} novalidate autocomplete="off">
        <div class="two">
            <Field label="First name" id="first" error={errors.first}>
                <TextInput id="first" bind:value={form.first} oninput={() => (form.first = cleanName(form.first))} maxlength={NAME_MAX} invalid={Boolean(errors.first)} spellcheck="false" autofocus />
            </Field>
            <Field label="Last name" id="last" error={errors.last}>
                <TextInput id="last" bind:value={form.last} oninput={() => (form.last = cleanName(form.last))} maxlength={NAME_MAX} invalid={Boolean(errors.last)} spellcheck="false" />
            </Field>
        </div>

        <Field label="Gender" id="gender-male" error={errors.gender}>
            <div class="au-row radios">
                <Radio bind:group={form.gender} value={0} name="gender" id="gender-male" label="Male" />
                <Radio bind:group={form.gender} value={1} name="gender" id="gender-female" label="Female" />
            </div>
        </Field>

        <Field label="Date of birth" id="dob-day" hint="Your character must be 18 or older." error={errors.dob}>
            <div class="dob">
                <Select id="dob-day" bind:value={form.day} options={dayOpts} placeholder="Day" invalid={Boolean(errors.dob)} aria-label="Day" />
                <Select id="dob-month" bind:value={form.month} options={monthOpts} placeholder="Month" invalid={Boolean(errors.dob)} aria-label="Month" />
                <Select id="dob-year" bind:value={form.year} options={yearOpts} placeholder="Year" invalid={Boolean(errors.dob)} aria-label="Year" />
            </div>
        </Field>

        <Field label="Country of origin (optional)" id="origin">
            <Select id="origin" bind:value={form.origin} options={countryOpts} placeholder="Choose a country" />
        </Field>

        <Field label="Biography" id="bio" hint="Up to {BIO_MAX} characters. You have used {form.bio.length}." error={errors.bio}>
            <Textarea id="bio" bind:value={form.bio} rows={3} maxlength={BIO_MAX} invalid={Boolean(errors.bio)} placeholder="Who they are and what brought them to Los Santos" />
        </Field>
    </form>

    {#snippet actions()}
        <Button type="submit" form="create-character">Create character</Button>
        <Button variant="secondary" onclick={oncancel}>Cancel</Button>
    {/snippet}
</Modal>

<style>
    /* The page is always at least 1080 design px tall (App.svelte zoom), so this always fits; the body scrolls. */
    :global(.au-modal__panel.cs-create) {
        max-height: 1032px;
    }
    .intro {
        max-width: none;
        margin: 0 0 20px;
    }
    .summary {
        margin: 0 0 24px;
        padding: 16px 20px;
        background: var(--au-error-bg);
    }
    .summary:focus {
        outline: 3px solid var(--au-focus);
        outline-offset: 0;
    }
    .summary h3 {
        margin: 0 0 8px;
        font-size: var(--au-fs-sm);
    }
    .summary ul {
        margin: 0;
        padding: 0;
        list-style: none;
    }
    .summary li + li {
        margin-top: 4px;
    }
    .summary a {
        color: var(--au-error);
        text-decoration: underline;
        text-underline-offset: 3px;
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
