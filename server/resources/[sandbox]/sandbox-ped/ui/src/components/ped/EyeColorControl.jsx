import React from 'react';
import { useSelector } from 'react-redux';
import { Group } from '../controls/Group.jsx';
import { StepperRow } from '../controls/StepperRow.jsx';
import { EYE_COLORS } from '../../data/faceFeatures.js';
import { usePedActions } from '../../hooks/usePedActions.js';

export function EyeColorControl() {
    const value = useSelector((s) => Number(s.ped.ped.customization.eyeColor) || 0);
    const actions = usePedActions();
    return (
        <Group title="Eyes">
            <StepperRow
                label="Eye colour"
                value={value}
                min={0}
                max={EYE_COLORS.length - 1}
                onChange={(v) => actions.eyeColor(v)}
                caption={EYE_COLORS[value] ?? `Colour ${value}`}
            />
        </Group>
    );
}
