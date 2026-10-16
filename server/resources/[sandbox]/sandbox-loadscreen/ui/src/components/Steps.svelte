<script>
    import { Icon } from '@sandbox/ui-kit';
    import { STEPS, loading, stepStatus } from '../state/loading.svelte.js';
</script>

<!--
    The four loading steps as one row of text: done ones white with a check,
    the active one in the action colour, pending ones muted.
-->
<ol class="steps" aria-label="Loading steps">
    {#each STEPS as step, i (step.id)}
        {@const status = stepStatus(loading, i)}
        <li class="step is-{status}" aria-current={status === 'active' ? 'step' : undefined}>
            {#if status === 'done'}<Icon icon="check" size={16} stroke={2.25} class="step__check" />{/if}
            <span>{step.label}</span>
        </li>
    {/each}
</ol>

<style>
    .steps {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 4px 28px;
        margin: 0;
        padding: 0;
        list-style: none;
        font-size: var(--au-fs-sm);
        font-weight: 500;
        line-height: 24px;
    }
    .step {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        color: var(--au-muted);
    }
    .step.is-done {
        color: #fff;
    }
    .step.is-active {
        color: var(--au-action);
    }
    .step :global(.step__check) {
        filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.9));
    }
</style>
