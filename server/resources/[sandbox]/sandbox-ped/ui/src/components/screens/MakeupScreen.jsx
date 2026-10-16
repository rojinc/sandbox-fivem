import React from 'react';
import { OverlayControl } from '../ped/OverlayControl.jsx';

export function MakeupScreen() {
    return (
        <>
            <OverlayControl overlayKey="makeup" />
            <OverlayControl overlayKey="blush" />
            <OverlayControl overlayKey="lipstick" />
        </>
    );
}
