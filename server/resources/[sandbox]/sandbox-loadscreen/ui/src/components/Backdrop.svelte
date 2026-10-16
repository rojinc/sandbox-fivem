<script>
    import backdrop from '../assets/backdrop.webp';
</script>

<!--
    Full-bleed still of the pier, darkened evenly by one flat layer of the
    sunk surface colour so white text reads anywhere on it. No gradient.
-->
<div class="backdrop" aria-hidden="true">
    <img class="backdrop__img" src={backdrop} alt="" draggable="false" />
    <div class="backdrop__scrim"></div>
</div>

<style>
    .backdrop {
        position: absolute;
        inset: 0;
        overflow: hidden;
        background: var(--au-bg);
    }
    .backdrop__img {
        width: 100%;
        height: 100%;
        max-width: none;
        object-fit: cover;
        object-position: 50% 60%;
    }
    .backdrop__scrim {
        position: absolute;
        inset: 0;
        background: var(--au-bg-sunk);
        opacity: 0.55;
    }
</style>
