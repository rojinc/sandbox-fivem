<script>
    import AppPage from '../../components/common/AppPage.svelte';

    /** Calculator: + − × ÷ and %, worked out left to right with the usual precedence. Nothing is eval'd. */
    let { app } = $props();

    let expr = $state('');
    let result = $state('');
    let error = $state('');

    const OPS = { '+': 1, '−': 1, '×': 2, '÷': 2 };

    function tokens(s) {
        const out = [];
        let num = '';
        for (const ch of s) {
            if (/[0-9.]/.test(ch)) num += ch;
            else if (ch === '%') {
                if (!num) throw new Error('bad');
                out.push(Number(num) / 100);
                num = '';
            } else if (OPS[ch]) {
                if (num) out.push(Number(num));
                else if (ch === '−' && (out.length === 0 || typeof out[out.length - 1] === 'string')) {
                    num = '-';
                    continue;
                } else if (!(out.length && typeof out[out.length - 1] === 'number')) throw new Error('bad');
                num = '';
                out.push(ch);
            }
        }
        if (num) out.push(Number(num));
        if (out.some((t) => typeof t === 'number' && !Number.isFinite(t))) throw new Error('bad');
        return out;
    }

    function evaluate(s) {
        const nums = [];
        const ops = [];
        const apply = () => {
            const b = nums.pop();
            const a = nums.pop();
            const op = ops.pop();
            if (a === undefined || b === undefined) throw new Error('bad');
            if (op === '÷' && b === 0) throw new Error('zero');
            nums.push(op === '+' ? a + b : op === '−' ? a - b : op === '×' ? a * b : a / b);
        };
        for (const t of tokens(s)) {
            if (typeof t === 'number') nums.push(t);
            else {
                while (ops.length && OPS[ops[ops.length - 1]] >= OPS[t]) apply();
                ops.push(t);
            }
        }
        while (ops.length) apply();
        if (nums.length !== 1) throw new Error('bad');
        return nums[0];
    }

    function press(k) {
        error = '';
        if (k === 'C') {
            expr = '';
            result = '';
            return;
        }
        if (k === 'Delete') {
            expr = expr.slice(0, -1);
            return;
        }
        if (k === '=') {
            if (!expr) return;
            try {
                const v = evaluate(expr);
                result = String(Math.round(v * 1e8) / 1e8);
                expr = result;
            } catch (e) {
                error = e.message === 'zero' ? 'You cannot divide by zero.' : 'Finish the sum first, for example 12 × 3.';
            }
            return;
        }
        if (OPS[k] && expr && OPS[expr.slice(-1)]) {
            expr = expr.slice(0, -1) + k;
            return;
        }
        if (expr.length < 32) expr += k;
    }

    $effect(() => {
        const map = { '*': '×', '/': '÷', '-': '−', '+': '+', Enter: '=', '=': '=', Backspace: 'Delete', '%': '%', '.': '.' };
        const onKey = (e) => {
            if (e.target instanceof HTMLElement && e.target.closest('input, textarea, select')) return;
            const k = /^[0-9]$/.test(e.key) ? e.key : map[e.key];
            if (!k) return;
            e.preventDefault();
            press(k);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    });

    const KEYS = ['C', 'Delete', '%', '÷', '7', '8', '9', '×', '4', '5', '6', '−', '1', '2', '3', '+', '0', '.', '='];
</script>

<AppPage title={app?.label ?? 'Calculator'}>
    <div class="calc">
        <output class="calc__screen au-mono" aria-live="polite">{expr || '0'}</output>
        <p class="calc__err" role="alert">{error}</p>
        <div class="calc__keys">
            {#each KEYS as k (k)}
                <button type="button" class="key" class:key--op={OPS[k] || k === '='} class:key--wide={k === '0'} class:key--text={k.length > 1} onclick={() => press(k)} aria-label={k === 'C' ? 'Clear' : undefined}>{k}</button>
            {/each}
        </div>
    </div>
</AppPage>

<style>
    .calc {
        display: flex;
        flex-direction: column;
        gap: var(--au-s2);
        padding: var(--au-s4);
    }
    .calc__screen {
        display: block;
        min-height: 56px;
        padding: var(--au-s2) var(--au-s3);
        background: var(--au-bg-sunk);
        border: 2px solid var(--au-border);
        font-size: 32px;
        text-align: right;
        overflow-x: auto;
        white-space: nowrap;
    }
    .calc__err {
        min-height: 24px;
        margin: 0;
        color: var(--au-error);
        font-weight: 700;
    }
    .calc__keys {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: var(--au-s2);
    }
    .key {
        height: 60px;
        border: 0;
        background: var(--au-bg-alt);
        color: var(--au-text);
        box-shadow: 0 3px 0 var(--au-border);
        margin-bottom: 3px;
        font: inherit;
        font-size: 24px;
        font-weight: 700;
        cursor: pointer;
    }
    .key--text {
        font-size: var(--au-fs-xs);
    }
    .key--op {
        background: var(--au-bg-alt-shade);
    }
    .key--wide {
        grid-column: span 2;
    }
    .key:hover {
        background: var(--au-border);
    }
    .key:active {
        transform: translateY(3px);
        box-shadow: none;
    }
    .key:focus-visible {
        outline: 3px solid transparent;
        background: var(--au-focus);
        color: var(--au-on-focus);
    }
</style>
