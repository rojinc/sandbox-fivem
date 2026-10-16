import React from 'react';
import { MODES } from '../../data/modes.js';
import { FACE_FEATURE_GROUPS } from '../../data/faceFeatures.js';
import { HeadBlendControl } from '../ped/HeadBlendControl.jsx';
import { EyeColorControl } from '../ped/EyeColorControl.jsx';
import { FaceFeatureGroup } from '../ped/FaceFeatureGroup.jsx';
import { OverlayControl } from '../ped/OverlayControl.jsx';

const SKIN = ['blemish', 'ageing', 'complexion', 'sundamage', 'freckles'];
const MAKEUP = ['makeup', 'blush', 'lipstick'];

export function FaceScreen({ modeKey, section }) {
    if (section === 0) return <HeadBlendControl />;
    if (section === 1) {
        return (
            <>
                <EyeColorControl />
                {FACE_FEATURE_GROUPS.map((g) => (
                    <FaceFeatureGroup key={g.title} title={g.title} items={g.items} />
                ))}
            </>
        );
    }
    // Skin: makeup lives here too when the mode has no Makeup category (surgery).
    const keys = MODES[modeKey].categories.includes('makeup') ? SKIN : [...SKIN, ...MAKEUP];
    return keys.map((k) => <OverlayControl key={k} overlayKey={k} />);
}
