<script>
    import backdrop from '../assets/backdrop.webp';
</script>

<!-- Full-bleed still of the pier with a flat scrim so the white cards and the band sit on a calm ground. -->
<div class="backdrop" aria-hidden="true">
    <img class="backdrop__img" src={backdrop} alt="" draggable="false" />
    <div class="backdrop__scrim"></div>
</div>

<style>
    .backdrop {
        position: absolute;
        inset: 0;
        overflow: hidden;
        background: var(--au-dark-bg-alt-shade);
    }
    .backdrop__img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: 50% 60%;
    }
    .backdrop__scrim {
        position: absolute;
        inset: 0;
        background: rgba(10, 50, 60, 0.28);
    }
</style>
