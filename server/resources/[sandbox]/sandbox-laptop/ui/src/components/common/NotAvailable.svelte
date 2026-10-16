<script>
    /**
     * The page an app (or a BizWiz page) shows until it is built for the new
     * laptop. `name` is what the player opened.
     */
    let { name = 'This app', detail = null } = $props();
</script>

<div class="na">
    <h3 class="na__title">{name} is not available yet</h3>
    <p>{detail ?? 'It has not been rebuilt for this version of the laptop. Close this window and use another app for now.'}</p>
</div>

<style>
    .na {
        padding: var(--au-s8) var(--au-s6);
        max-width: 40em;
    }
    .na__title {
        font-size: var(--au-fs-md);
        margin-bottom: var(--au-s2);
    }
    .na p {
        margin: 0;
        color: var(--au-muted);
    }
</style>
