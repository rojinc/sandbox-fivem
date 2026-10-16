import React from 'react';
import { useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';
import { StatusRow, CircleRow } from './StatusCluster.jsx';
import { VoiceBars } from './VoiceIndicator.jsx';
import Compass from './Compass.jsx';
import Buffs from './Buffs.jsx';
import VehicleCluster from './VehicleCluster.jsx';
import { clusterAnchor, belowMinimap, hasAnchor } from '../../lib/anchor.js';

const CLUSTER_WIDTH = 258;

/** Column anchored to the minimap slot; children stack upward from the bottom-left corner. */
function Cluster({ anchor, children }) {
    return (
        <Box
            sx={{
                position: 'absolute',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '6px',
                ...anchor,
            }}
        >
            {children}
        </Box>
    );
}

function BottomCenter({ bottom = 8, children }) {
    return (
        <Box sx={{ position: 'absolute', left: 0, right: 0, bottom, display: 'flex', justifyContent: 'center' }}>{children}</Box>
    );
}

/**
 * Composes the persistent HUD for the four layouts the settings dialog offers.
 * Everything inside is non-interactive.
 */
export default function HudLayer() {
    const showing = useSelector((s) => s.hud.showing);
    const config = useSelector((s) => s.hud.config);
    const position = useSelector((s) => s.hud.position);
    const shifted = useSelector((s) => s.location.shifted);
    const inVehicle = useSelector((s) => s.vehicle.showing);

    const anchor = clusterAnchor(position, shifted || inVehicle);
    const layout = config.layout;

    // Something already sits at the bottom centre, so lift the vehicle cluster.
    const raised =
        layout === 'default' ||
        layout === 'center' ||
        (layout === 'minimap' && config.buffsAnchor2) ||
        (layout === 'condensed' && config.condenseAlignment === 'center');

    let body;
    if (layout === 'minimap') {
        body = (
            <>
                <Cluster anchor={anchor}>
                    <Compass width={CLUSTER_WIDTH} />
                    <VoiceBars width={CLUSTER_WIDTH} />
                </Cluster>
                <Box sx={{ position: 'absolute', ...(config.minimapAnchor ? belowMinimap(position) : { left: 15, top: 2 }) }}>
                    <StatusRow />
                </Box>
                <BottomCenter>
                    <Buffs />
                </BottomCenter>
            </>
        );
    } else if (layout === 'center') {
        const buffsLeft = config.buffsAnchor2 && hasAnchor(position) ? `calc(${position.leftX * 100}vw * 1.4)` : 15;
        body = (
            <>
                <Cluster anchor={anchor}>
                    {config.buffsAnchor === 'compass' && <Buffs sx={{ width: CLUSTER_WIDTH }} />}
                    <Compass width={CLUSTER_WIDTH} />
                    <VoiceBars width={CLUSTER_WIDTH} />
                </Cluster>
                <BottomCenter bottom={6}>
                    <StatusRow />
                </BottomCenter>
                {config.buffsAnchor === 'minimap' && (
                    <Box sx={{ position: 'absolute', bottom: 6, left: buffsLeft }}>
                        <Buffs />
                    </Box>
                )}
            </>
        );
    } else if (layout === 'condensed') {
        const align =
            config.condenseAlignment === 'minimap' && hasAnchor(position)
                ? { left: `${(position.leftX + 0.0045) * 100}vw` }
                : config.condenseAlignment === 'left'
                  ? { left: 6 }
                  : { left: 0, right: 0, justifyContent: 'center' };
        body = (
            <>
                <Cluster anchor={anchor}>
                    {config.condenseAlignment === 'compass' && <CircleRow wrap width={CLUSTER_WIDTH} />}
                    <Compass width={CLUSTER_WIDTH} />
                </Cluster>
                {config.condenseAlignment !== 'compass' && (
                    <Box sx={{ position: 'absolute', bottom: 6, display: 'flex', ...align }}>
                        <CircleRow />
                    </Box>
                )}
            </>
        );
    } else {
        body = (
            <>
                <Cluster anchor={anchor}>
                    <StatusRow wrap width={CLUSTER_WIDTH} />
                    <VoiceBars width={CLUSTER_WIDTH} />
                    <Compass width={CLUSTER_WIDTH} />
                </Cluster>
                <BottomCenter>
                    <Buffs />
                </BottomCenter>
            </>
        );
    }

    return (
        <Fade in={showing}>
            <Box sx={{ position: 'absolute', inset: 0 }}>
                {body}
                <VehicleCluster raised={raised} />
            </Box>
        </Fade>
    );
}
