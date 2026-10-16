<script>
    import { TextInput, uid } from '@sandbox/ui-kit';
    import { call, list } from '../../lib/api.js';

    /**
     * Find a person to add (InputSearch). type "people" searches every character,
     * type "job" searches employees of `job` by name, callsign or state ID.
     * onpick({ SID, First, Last, Callsign?, Licenses? }).
     */
    let { label, hint, type = 'people', job, exclude = [], onpick } = $props();

    const id = uid('pick');
    let term = $state('');
    let results = $state([]);
    let status = $state('idle'); // idle | loading | ready | error
    let timer;

    function onInput() {
        clearTimeout(timer);
        const t = term.trim();
        if (t.length < 2) {
            results = [];
            status = 'idle';
            return;
        }
        timer = setTimeout(async () => {
            status = 'loading';
            const res = await call('InputSearch', { type, term: t, job });
            if (res === null || res === false) {
                status = 'error';
                results = [];
                return;
            }
            results = list(res).filter((p) => !exclude.some((e) => e == p.SID));
            status = 'ready';
        }, 300);
    }

    function pick(p) {
        onpick?.(p);
        term = '';
        results = [];
        status = 'idle';
    }

    $effect(() => () => clearTimeout(timer));
</script>

<div class="picker">
    <label for={id}>{label}</label>
    {#if hint}<div class="hint">{hint}</div>{/if}
    <TextInput {id} bind:value={term} oninput={onInput} placeholder={type === 'job' ? 'Name, callsign or state ID' : 'Name or state ID'} autocomplete="off" />
    {#if status === 'loading'}
        <p class="note">Searching</p>
    {:else if status === 'error'}
        <p class="note error">The search did not answer. Try again.</p>
    {:else if status === 'ready' && !results.length}
        <p class="note">Nobody matches "{term.trim()}".</p>
    {:else if results.length}
        <ul class="results">
            {#each results as p (p.SID)}
                <li>
                    <button type="button" onclick={() => pick(p)}>
                        <strong>{p.Callsign ? `${p.Callsign} ` : ''}{p.First} {p.Last}</strong>
                        <span class="au-muted">state ID <span class="au-mono">{p.SID}</span></span>
                    </button>
                </li>
            {/each}
        </ul>
    {/if}
</div>

<style>
    .picker {
        margin: 0 0 var(--au-s4);
    }
    label {
        display: block;
        font-weight: 700;
        margin-bottom: var(--au-s1);
    }
    .hint {
        color: var(--au-muted);
        margin-bottom: var(--au-s2);
    }
    .note {
        margin: var(--au-s2) 0 0;
        color: var(--au-muted);
    }
    .error {
        color: var(--au-error);
    }
    .results {
        list-style: none;
        margin: 0;
        padding: 0;
        border: 2px solid var(--au-border-strong);
        border-top: 0;
        background: var(--au-bg-shade);
    }
    .results button {
        display: flex;
        justify-content: space-between;
        gap: var(--au-s3);
        width: 100%;
        padding: var(--au-s2) var(--au-s3);
        border: 0;
        border-bottom: 1px solid var(--au-border);
        background: transparent;
        color: var(--au-text);
        font: inherit;
        text-align: left;
        cursor: pointer;
    }
    .results li:last-child button {
        border-bottom: 0;
    }
    .results button:hover {
        background: var(--au-bg-alt);
    }
    .results button:focus-visible {
        outline: 3px solid var(--au-focus);
        outline-offset: -3px;
    }
</style>
