<script>
    import { Spinner } from '@sandbox/ui-kit';

    let { text = 'Loading' } = $props();
</script>

<div class="loading"><Spinner size={20} label={text} /><span>{text}</span></div>
