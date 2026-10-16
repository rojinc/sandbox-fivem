import React from 'react';
import { useSelector } from 'react-redux';
import { Routes, Route } from 'react-router-dom';
import Box from '@mui/material/Box';
import { EmptyState } from '@sandbox/ui-kit';
import Sidebar from './Sidebar.jsx';
import TitleBar from './TitleBar.jsx';
import { ToastViewport } from '../common/Toasts.jsx';
import Dashboard from '../pages/Dashboard.jsx';
import Players from '../pages/Players.jsx';
import DisconnectedPlayers from '../pages/DisconnectedPlayers.jsx';
import Characters from '../pages/Characters.jsx';
import Vehicles from '../pages/Vehicles.jsx';
import PlayerView from '../pages/PlayerView.jsx';
import VehicleView from '../pages/VehicleView.jsx';
import CurrentVehicle from '../pages/CurrentVehicle.jsx';
import NotFound from '../pages/NotFound.jsx';
import { selectUser, selectPermission } from '../../features/app/reducer.js';
import { isAdminConsole, navLinks } from '../../lib/permissions.js';

export const WINDOW = { width: 1600, height: 900, sidebar: 236, titlebar: 60 };

export default function Shell() {
    const user = useSelector(selectUser);
    const permission = useSelector(selectPermission);
    const admin = isAdminConsole(permission);
    const links = navLinks(permission);

    return (
        <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
            <Box
                className="sb-glass-strong sb-anim-rise"
                sx={{
                    position: 'relative',
                    width: WINDOW.width,
                    height: WINDOW.height,
                    maxWidth: 'calc(100vw - 48px)',
                    maxHeight: 'calc(100vh - 48px)',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    display: 'grid',
                    gridTemplateColumns: `${WINDOW.sidebar}px minmax(0, 1fr)`,
                    gridTemplateRows: `${WINDOW.titlebar}px minmax(0, 1fr)`,
                }}
            >
                <Sidebar links={links} admin={admin} />
                <TitleBar />
                <Box component="main" sx={{ minHeight: 0, overflow: 'auto', p: 3, display: 'flex', flexDirection: 'column' }}>
                    {user ? (
                        <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/players" element={<Players />} />
                            <Route path="/disconnected-players" element={<DisconnectedPlayers />} />
                            <Route path="/players-characters" element={<Characters />} />
                            <Route path="/vehicles" element={<Vehicles />} />
                            <Route path="/current-vehicle" element={admin ? <CurrentVehicle /> : <NotFound />} />
                            <Route path="/player/:id" element={<PlayerView />} />
                            <Route path="/vehicle/:id" element={<VehicleView />} />
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    ) : (
                        <EmptyState
                            icon="user-shield"
                            title="Waiting for permission data"
                            description="The server has not sent your staff profile yet. Close the menu and reopen it after you have spawned."
                            sx={{ m: 'auto' }}
                        />
                    )}
                </Box>
                <ToastViewport />
            </Box>
        </Box>
    );
}
