import React from 'react';
import { ComponentControl } from '../ped/ComponentControl.jsx';
import { OverlayControl } from '../ped/OverlayControl.jsx';
import { PedModelControl } from '../ped/PedModelControl.jsx';

export function BodyScreen({ section }) {
    if (section === 0) return <ComponentControl name="torso" />;
    if (section === 1) {
        return (
            <>
                <OverlayControl overlayKey="bodyblemish" />
                <OverlayControl overlayKey="addbodyblemish" />
            </>
        );
    }
    return <PedModelControl />;
}
