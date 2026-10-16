<script>
    import { Icon } from '@sandbox/ui-kit';
    import { faCheck } from '@fortawesome/free-solid-svg-icons';
    import { STEPS, loading, stepStatus } from '../state/loading.svelte.js';

    const WORD = { done: 'Done', active: 'In progress', pending: '' };
</script>

<ol class="steps" aria-label="Loading steps">
    {#each STEPS as step, i (step.id)}
        {@const status = stepStatus(loading, i)}
        <li class="step is-{status}" aria-current={status === 'active' ? 'step' : undefined}>
            <span class="step__mark" aria-hidden="true">
                {#if status === 'done'}<Icon icon={faCheck} />{/if}
            </span>
            <span class="step__label">{step.label}</span>
            <span class="step__state">{WORD[status]}</span>
        </li>
    {/each}
</ol>

<style>
    .steps {
        list-style: none;
        margin: 0;
        padding: 0;
        border-top: 1px solid var(--au-bg-alt-shade);
    }
    .step {
        display: flex;
        align-items: center;
        gap: 12px;
        min-height: 36px;
        padding: 0 4px;
        border-bottom: 1px solid var(--au-bg-alt-shade);
        color: var(--au-muted);
        font-size: var(--au-fs-sm);
    }
    .step__mark {
        display: grid;
        place-items: center;
        width: 20px;
        height: 20px;
        flex-shrink: 0;
        font-size: 16px;
        color: var(--au-action);
    }
    .step__mark::before {
        content: '';
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: var(--au-bg-alt-shade);
        border: 1px solid var(--au-border);
    }
    .is-done .step__mark::before {
        display: none;
    }
    .is-active .step__mark::before {
        width: 12px;
        height: 12px;
        background: var(--au-action);
        border-color: var(--au-action);
    }
    .step__label {
        flex: 1;
    }
    .is-done .step__label {
        color: var(--au-text);
    }
    .is-active {
        color: var(--au-text);
        font-weight: 700;
    }
    .step__state {
        font-size: var(--au-fs-xs);
        font-weight: 400;
        color: var(--au-hint);
    }
    .is-active .step__state {
        color: var(--au-action);
        font-weight: 700;
    }
</style>
