<script>
    import wordmark from '../assets/wordmark.webp';
</script>

<!-- Identity block, straight on the photo: wordmark, short bold label, plain heading. -->
<header class="identity au-overworld">
    <img class="identity__mark" src={wordmark} alt="Sandbox Roleplay" draggable="false" />
    <div class="identity__text">
        <strong class="identity__eyebrow">SANDBOX RP</strong>
        <h1 class="identity__title">Loading Los Santos</h1>
    </div>
</header>

<style>
    .identity {
        display: flex;
        align-items: center;
        gap: 20px;
    }
    .identity__mark {
        height: 48px;
        width: auto;
        max-width: none;
        filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.6));
    }
    .identity__text {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }
    .identity__eyebrow {
        color: var(--au-action);
        font-size: var(--au-fs-xs);
        font-weight: 700;
        line-height: 1.25;
        letter-spacing: 0.08em;
    }
    .identity__title {
        margin: 0;
        font-size: var(--au-fs-lg);
        font-weight: 500;
        line-height: var(--au-lh-heading);
    }
</style>
