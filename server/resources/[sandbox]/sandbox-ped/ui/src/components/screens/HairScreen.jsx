import React from 'react';
import { ComponentControl } from '../ped/ComponentControl.jsx';
import { HairColorControl } from '../ped/HairColorControl.jsx';
import { HairOverlayControl } from '../ped/HairOverlayControl.jsx';
import { OverlayControl } from '../ped/OverlayControl.jsx';

export function HairScreen({ section }) {
    if (section === 0) {
        return (
            <>
                <ComponentControl name="hair" label="Hairstyle" />
                <HairColorControl name="hair" title="Hair colour" />
                <HairOverlayControl />
            </>
        );
    }
    if (section === 1) {
        return (
            <>
                <OverlayControl overlayKey="eyebrows" />
                <HairColorControl name="eyebrows" title="Eyebrow colour" />
                <OverlayControl overlayKey="facialhair" />
                <HairColorControl name="facialhair" title="Facial hair colour" />
            </>
        );
    }
    return <OverlayControl overlayKey="chesthair" />;
}
