<script>
    import { Button, Field, Textarea, TextInput, Checkbox, PageAlert } from '@sandbox/ui-kit';
    import { fetchNui } from '@sandbox/ui-kit/nui';
    import { showAlert } from '../../../state/notify.svelte.js';

    /** Post to Spammer as the business (SendBusinessTweet). */
    let { onnav } = $props();

    const MAX = 180;
    let text = $state('');
    let withImage = $state(false);
    let link = $state('');
    let errors = $state({});
    let failure = $state(null);
    let busy = $state(false);

    async function submit() {
        const e = {};
        if (!text.trim()) e.text = 'Write the post';
        if (withImage && !/^https:\/\/\S+$/i.test(link.trim())) e.link = 'Enter an image link that starts with https://';
        errors = e;
        failure = null;
        if (Object.keys(e).length) return;
        busy = true;
        const res = await fetchNui('SendBusinessTweet', {
            time: Date.now(),
            content: text.trim(),
            image: { using: withImage, link: withImage ? link.trim() : '' },
            likes: [],
        });
        busy = false;
        if (res === true) {
            showAlert('Post sent', 'success');
            text = '';
            link = '';
            withImage = false;
            onnav('Dashboard');
        } else failure = 'The post was not sent. You may not have permission to post for the business.';
    }
</script>

<h3 class="heading">Business post</h3>
<p class="lead">Post on Spammer under your business name. Use it for business only: abuse gets the business banned from Spammer.</p>
{#if failure}<PageAlert type="error" compact>{failure}</PageAlert>{/if}
<form
    class="form"
    onsubmit={(e) => {
        e.preventDefault();
        submit();
    }}
>
    <Field label="Post" hint="{text.length} of {MAX} characters" id="post-text" error={errors.text}>
        <Textarea id="post-text" bind:value={text} rows={4} maxlength={MAX} invalid={Boolean(errors.text)} />
    </Field>
    <div class="check"><Checkbox bind:checked={withImage} label="Add an image" /></div>
    {#if withImage}
        <Field label="Image link" hint="A direct link to the picture" id="post-image" error={errors.link}>
            <TextInput id="post-image" bind:value={link} placeholder="https://" invalid={Boolean(errors.link)} autocomplete="off" />
        </Field>
        {#if /^https:\/\/\S+$/i.test(link.trim())}
            <img class="preview" src={link.trim()} alt="What your post will show" />
        {/if}
    {/if}
    <Button type="submit" loading={busy}>Send post</Button>
</form>

<style>
    .form {
        max-width: 40em;
    }
    .check {
        margin-bottom: var(--au-s4);
    }
    .preview {
        max-width: 320px;
        max-height: 200px;
        object-fit: contain;
        margin-bottom: var(--au-s4);
    }
</style>
