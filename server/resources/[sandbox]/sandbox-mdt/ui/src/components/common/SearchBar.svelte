<script>
    import { Button, TextInput, uid } from '@sandbox/ui-kit';

    /** Toolbar search: a labelled field and one button. bind:value; onsearch(term). */
    let { value = $bindable(''), label, placeholder, button = 'Search', busy = false, onsearch, width = '420px', children } = $props();
    const id = uid('search');
</script>

<form
    class="searchbar"
    role="search"
    onsubmit={(e) => {
        e.preventDefault();
        onsearch?.(value.trim());
    }}
>
    <div class="field" style="width:{width}">
        <label for={id}>{label}</label>
        <TextInput {id} bind:value {placeholder} autocomplete="off" />
    </div>
    {@render children?.()}
    <Button type="submit" icon="search" loading={busy}>{button}</Button>
</form>

<style>
    .searchbar {
        display: flex;
        align-items: flex-end;
        gap: var(--au-s3);
        flex-wrap: wrap;
        margin: 0 0 var(--au-s4);
    }
    .field {
        max-width: 100%;
    }
    label {
        display: block;
        font-weight: 700;
        margin-bottom: var(--au-s1);
    }
</style>
