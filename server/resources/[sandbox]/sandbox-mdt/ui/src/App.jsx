import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { MemoryRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';
import { AppRoot, fetchNui, useKey } from '@sandbox/ui-kit';
import Shell from './components/shell/Shell.jsx';
import ToastHost from './components/common/Toasts.jsx';
import AlertsEffects from './components/alerts/AlertsEffects.jsx';
import AlertsPanel from './components/alerts/AlertsPanel.jsx';
import AlertToasts from './components/alerts/AlertToasts.jsx';
import IdOverlay from './components/overlays/IdOverlay.jsx';
import BodyCam from './components/overlays/BodyCam.jsx';
import { usePermissions, useRole, useUser } from './hooks/index.js';
import { pagesForRole, adminPermissionFor, permissionJobFor, fleetJobFor } from './lib/nav.js';
import { DepartmentAccent } from './lib/data.js';

import Home from './components/pages/Home.jsx';
import People from './components/pages/People.jsx';
import Vehicles from './components/pages/Vehicles.jsx';
import Reports from './components/pages/Reports.jsx';
import Warrants from './components/pages/Warrants.jsx';
import Firearms from './components/pages/Firearms.jsx';
import Properties from './components/pages/Properties.jsx';
import Fleet from './components/pages/Fleet.jsx';
import Roster from './components/pages/Roster.jsx';
import Permissions from './components/pages/Permissions.jsx';
import PenalCode from './components/pages/PenalCode.jsx';
import AdminCharges from './components/pages/AdminCharges.jsx';
import Library from './components/pages/Library.jsx';
import Prisoners from './components/pages/Prisoners.jsx';
import PrisonersPublic from './components/pages/PrisonersPublic.jsx';
import CreateBolo from './components/pages/CreateBolo.jsx';
import CreateNotice from './components/pages/CreateNotice.jsx';
import NoCallsign from './components/pages/NoCallsign.jsx';

/** Redirects home unless the permission is held. */
function Guard({ permission, children }) {
    const hasPerm = usePermissions();
    return hasPerm(permission) ? children : <Navigate to="/" replace />;
}

function TerminalRoutes() {
    const role = useRole();
    const pages = pagesForRole(role);
    return (
        <Routes>
            <Route path="/" element={role === 'public-prison' ? <PrisonersPublic /> : <Home />} />
            {pages.has('roster') && <Route path="/roster" element={<Roster />} />}
            {pages.has('reports') && <Route path="/reports" element={<Reports />} />}
            {pages.has('warrants') && <Route path="/warrants" element={<Warrants />} />}
            {pages.has('people') && <Route path="/people" element={<People />} />}
            {pages.has('vehicles') && <Route path="/vehicles" element={<Vehicles />} />}
            {pages.has('properties') && <Route path="/properties" element={<Properties />} />}
            {pages.has('firearms') && <Route path="/firearms" element={<Firearms />} />}
            {pages.has('penal-code') && <Route path="/penal-code" element={<PenalCode />} />}
            {pages.has('library') && <Route path="/library" element={<Library />} />}
            {pages.has('prisoners') && <Route path="/prisoners" element={<Prisoners />} />}
            {pages.has('fleet-manager') && (
                <Route
                    path="/fleet-manager"
                    element={
                        <Guard permission="FLEET_MANAGEMENT">
                            <Fleet job={fleetJobFor[role] ?? 'police'} />
                        </Guard>
                    }
                />
            )}
            {pages.has('create-bolo') && <Route path="/create/bolo" element={<CreateBolo />} />}
            {pages.has('create-notice') && <Route path="/create/notice" element={<CreateNotice />} />}
            {pages.has('admin-permissions') && (
                <Route
                    path="/admin/permissions"
                    element={
                        <Guard permission={adminPermissionFor[role]}>
                            <Permissions job={permissionJobFor[role] ?? 'police'} />
                        </Guard>
                    }
                />
            )}
            {pages.has('system') && (
                <>
                    <Route
                        path="/system/charges"
                        element={
                            <Guard permission={true}>
                                <AdminCharges />
                            </Guard>
                        }
                    />
                    <Route
                        path="/system/gov-roster"
                        element={
                            <Guard permission={true}>
                                <Roster systemAdminMode />
                            </Guard>
                        }
                    />
                    <Route
                        path="/system/gov-permissions"
                        element={
                            <Guard permission={true}>
                                <Permissions job="system" />
                            </Guard>
                        }
                    />
                </>
            )}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

/** The MDT window itself. Stays mounted while hidden so state survives. */
function Terminal() {
    const hidden = useSelector((s) => s.app.hidden);
    const navReset = useSelector((s) => s.app.navReset);
    const route = useSelector((s) => s.data.data.route);
    const role = useRole();
    const user = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        if (navReset > 0) navigate('/', { replace: true });
    }, [navReset]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (typeof route === 'string' && route.startsWith('/')) navigate(route);
    }, [route]); // eslint-disable-line react-hooks/exhaustive-deps

    const needsCallsign = role === 'police' && user && !user.Callsign;

    return (
        <Fade in={!hidden} timeout={{ enter: 320, exit: 200 }}>
            <Box sx={{ position: 'fixed', inset: 0, display: 'grid', placeItems: 'center', pointerEvents: 'none', zIndex: 10 }}>
                <Shell>{needsCallsign ? <NoCallsign /> : <TerminalRoutes />}</Shell>
            </Box>
        </Fade>
    );
}

/** Escape always leads somewhere: the window's Close callback, or CloseAlerts. */
function KeyHandler() {
    const hidden = useSelector((s) => s.app.hidden);
    const showing = useSelector((s) => s.alerts.showing);

    const popupOpen = () => Boolean(document.querySelector('.MuiModal-root, .MuiAutocomplete-popper'));

    useKey('Escape', () => {
        if (popupOpen()) return; // MUI closes the dialog / menu itself
        if (!hidden) fetchNui('Close');
        else if (showing) fetchNui('CloseAlerts');
    });

    useKey('`', (e) => {
        if (showing && !popupOpen() && !(e.target && /^(INPUT|TEXTAREA)$/.test(e.target.tagName)) && !e.target?.isContentEditable) {
            fetchNui('CloseAlerts');
        }
    });

    return null;
}

export default function App() {
    const govJob = useSelector((s) => s.app.govJob);
    const accent = DepartmentAccent[govJob?.Workplace?.Id] ?? undefined;

    return (
        <AppRoot accent={accent}>
            <MemoryRouter>
                <KeyHandler />
                <AlertsEffects />
                <Terminal />
                <AlertsPanel />
                <AlertToasts />
                <IdOverlay />
                <BodyCam />
                <ToastHost />
            </MemoryRouter>
        </AppRoot>
    );
}
