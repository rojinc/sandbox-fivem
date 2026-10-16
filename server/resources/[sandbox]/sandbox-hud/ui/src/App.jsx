import React from 'react';
import Box from '@mui/material/Box';
import HudLayer from './components/hud/HudLayer.jsx';
import NotificationStack from './components/notifications/NotificationStack.jsx';
import ActionPrompt from './components/prompts/ActionPrompt.jsx';
import ProgressBar from './components/prompts/ProgressBar.jsx';
import ListMenu from './components/menus/ListMenu.jsx';
import InputDialog from './components/menus/InputDialog.jsx';
import ConfirmDialog from './components/menus/ConfirmDialog.jsx';
import InteractionWheel from './components/menus/InteractionWheel.jsx';
import ThirdEye from './components/menus/ThirdEye.jsx';
import SettingsDialog from './components/menus/SettingsDialog.jsx';
import MethDialog from './components/menus/MethDialog.jsx';
import DeathOverlay from './components/overlays/DeathOverlay.jsx';
import Blindfold from './components/overlays/Blindfold.jsx';
import Flashbang from './components/overlays/Flashbang.jsx';
import InfoOverlay from './components/overlays/InfoOverlay.jsx';
import ItemOverlay from './components/overlays/ItemOverlay.jsx';
import GemTable from './components/overlays/GemTable.jsx';

/**
 * Layer order (bottom → top). Everything is pointer-events:none except the
 * interactive menus/dialogs, so clicks never land on the HUD while Lua has
 * focus for something else.
 */
export default function App() {
    return (
        <Box sx={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
            <DeathOverlay />
            <HudLayer />
            <ItemOverlay />
            <InfoOverlay />
            <ActionPrompt />
            <ProgressBar />
            <NotificationStack />
            <ThirdEye />
            <InteractionWheel />
            <ListMenu />
            <GemTable />
            <Blindfold />
            <Flashbang />
            {/* MUI dialogs portal to <body>; they manage their own pointer events */}
            <InputDialog />
            <ConfirmDialog />
            <MethDialog />
            <SettingsDialog />
        </Box>
    );
}
