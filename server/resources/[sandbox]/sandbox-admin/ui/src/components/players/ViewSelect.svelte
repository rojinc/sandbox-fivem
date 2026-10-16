<script>
    import { Field, Select } from '@sandbox/ui-kit';
    import { nav } from '../../state/nav.svelte.js';

    const OPTIONS = [
        { value: 'online', label: 'Players online now' },
        { value: 'disconnected', label: 'Players who left recently' },
        { value: 'characters', label: 'Every character on record' },
    ];
</script>

<Field label="Show" id="players-view">
    <Select id="players-view" bind:value={nav.playersView} options={OPTIONS} />
</Field>
