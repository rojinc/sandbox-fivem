import React from 'react';
import { useSelector } from 'react-redux';
import { Group } from '../controls/Group.jsx';
import { SliderRow } from '../controls/SliderRow.jsx';
import { getFeature } from '../../features/ped/selectors.js';
import { usePedActions } from '../../hooks/usePedActions.js';

/** A group of SetPedFaceFeature sliders (-100..100). */
export function FaceFeatureGroup({ title, items }) {
    const features = useSelector((s) => s.ped.ped.customization.face?.features);
    const actions = usePedActions();
    return (
        <Group title={title}>
            {items.map((it) => (
                <SliderRow
                    key={it.index}
                    label={it.label}
                    value={Math.round(getFeature(features, it.index))}
                    min={-100}
                    max={100}
                    onChange={(v) => actions.faceFeature(it.index, v)}
                />
            ))}
        </Group>
    );
}
