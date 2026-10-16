import React from 'react';
import { MODES } from '../../data/modes.js';
import { ComponentControl } from '../ped/ComponentControl.jsx';

const SLOTS = ['torso2', 'undershirt', 'kevlar', 'leg', 'shoes'];

export function ClothesScreen({ modeKey }) {
    // Arms live under Body when that category exists; the store folds them in here.
    const withArms = !MODES[modeKey].categories.includes('body');
    return (
        <>
            {SLOTS.map((n) => (
                <ComponentControl key={n} name={n} />
            ))}
            {withArms && <ComponentControl name="torso" />}
        </>
    );
}
