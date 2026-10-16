import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import MuiIconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { Panel, Icon, fetchNui } from '@sandbox/ui-kit';
import { CAMERA_VIEWS } from '../../data/modes.js';
import { setCamera } from '../../features/app/reducer.js';

function DockButton({ icon, label, active, onClick }) {
    return (
        <Tooltip title={label} placement="top">
            <MuiIconButton
                aria-label={label}
                aria-pressed={active}
                onClick={onClick}
                sx={{
                    width: 36,
                    height: 36,
                    fontSize: 14,
                    borderRadius: '50%',
                    color: active ? 'var(--sb-accent)' : 'var(--sb-text-2)',
                    background: active ? 'var(--sb-accent-soft)' : 'transparent',
                    '&:hover': { background: active ? 'var(--sb-accent-soft)' : 'var(--sb-surface-hover)', color: active ? 'var(--sb-accent)' : 'var(--sb-text)' },
                }}
            >
                <Icon icon={icon} />
            </MuiIconButton>
        </Tooltip>
    );
}

const Sep = () => <Box sx={{ width: 1, height: 20, background: 'var(--sb-border-strong)', mx: 0.5 }} />;

/** Camera focus, rotation, zoom and pose controls, bottom centre. */
export function CameraDock() {
    const dispatch = useDispatch();
    const camera = useSelector((s) => s.app.camera);

    const setView = (i) => {
        if (i === camera) return;
        fetchNui('FrontEndSound', { sound: 'SELECT' });
        dispatch(setCamera(i));
        fetchNui('ChangeCamera', i);
    };

    return (
        <Panel
            data-nui-interactive="true"
            padding={6}
            radius={999}
            className="sb-anim-rise"
            sx={{ position: 'absolute', left: '50%', bottom: 24, transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 0.25, pointerEvents: 'auto' }}
        >
            {CAMERA_VIEWS.map((v, i) => (
                <DockButton key={v.label} icon={v.icon} label={v.label} active={camera === i} onClick={() => setView(i)} />
            ))}
            <Sep />
            <DockButton icon="rotate-left" label="Rotate left (Q)" onClick={() => fetchNui('RotateLeft')} />
            <DockButton icon="rotate-right" label="Rotate right (E)" onClick={() => fetchNui('RotateRight')} />
            <Sep />
            <DockButton icon="magnifying-glass-minus" label="Zoom out" onClick={() => fetchNui('Zoom', { zoom: 0.15 })} />
            <DockButton icon="magnifying-glass-plus" label="Zoom in" onClick={() => fetchNui('Zoom', { zoom: -0.15 })} />
            <Sep />
            <DockButton icon="person-walking" label="Toggle pose (R)" onClick={() => fetchNui('Animation')} />
        </Panel>
    );
}
