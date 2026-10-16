<script>
    import { hud } from './state/hud.svelte.js';
    import Compass from './components/hud/Compass.svelte';
    import PlayerStatus from './components/hud/PlayerStatus.svelte';
    import VehicleCluster from './components/hud/VehicleCluster.svelte';
    import NotificationStack from './components/notifications/NotificationStack.svelte';
    import ActionPrompt from './components/prompts/ActionPrompt.svelte';
    import ProgressBar from './components/prompts/ProgressBar.svelte';
    import InfoOverlay from './components/overlays/InfoOverlay.svelte';
    import ItemOverlay from './components/overlays/ItemOverlay.svelte';
    import GemTable from './components/overlays/GemTable.svelte';
    import DeathOverlay from './components/overlays/DeathOverlay.svelte';
    import ThirdEye from './components/menus/ThirdEye.svelte';
    import InteractionWheel from './components/menus/InteractionWheel.svelte';
    import ListMenu from './components/menus/ListMenu.svelte';
    import InputDialog from './components/menus/InputDialog.svelte';
    import ConfirmDialog from './components/menus/ConfirmDialog.svelte';
    import MethDialog from './components/menus/MethDialog.svelte';
    import SettingsDialog from './components/menus/SettingsDialog.svelte';
    import Flashbang from './components/overlays/Flashbang.svelte';
    import Blindfold from './components/overlays/Blindfold.svelte';
</script>

<!-- Layer order: in-world HUD, passive overlays, prompts, focus-taking menus, screen effects. -->
<div class="hud-root">
    {#if hud.showing}
        <Compass />
        <PlayerStatus />
        <VehicleCluster />
    {/if}
    <DeathOverlay />
    <ItemOverlay />
    <InfoOverlay />
    <GemTable />
    <NotificationStack />
    <ActionPrompt />
    <ProgressBar />
    <ThirdEye />
    <InteractionWheel />
    <ListMenu />
    <InputDialog />
    <ConfirmDialog />
    <MethDialog />
    <SettingsDialog />
    <Flashbang />
    <Blindfold />
</div>
