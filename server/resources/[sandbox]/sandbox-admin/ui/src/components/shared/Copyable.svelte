<script>
    import CopyButton from './CopyButton.svelte';

    /** A mono value with its copy button. */
    let { value, what } = $props();
</script>

<span class="copyable"><span class="au-mono">{value}</span><CopyButton {value} {what} /></span>

<style>
    .copyable {
        display: inline;
    }
</style>
