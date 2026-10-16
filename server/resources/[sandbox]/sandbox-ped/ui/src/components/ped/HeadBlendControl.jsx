import React from 'react';
import { useSelector } from 'react-redux';
import Typography from '@mui/material/Typography';
import { Group } from '../controls/Group.jsx';
import { StepperRow } from '../controls/StepperRow.jsx';
import { SliderRow } from '../controls/SliderRow.jsx';
import { EnableSwitch } from '../controls/EnableSwitch.jsx';
import { HEAD_BLEND_MAX } from '../../data/faceFeatures.js';
import { usePedActions } from '../../hooks/usePedActions.js';

/**
 * SetPedHeadBlendData. Simple mode picks one face (face3). Advanced mode
 * (face3.mix = 0) blends two parents: shape/skin of each plus the two mixes.
 */
export function HeadBlendControl() {
    const face = useSelector((s) => s.ped.ped.customization.face);
    const actions = usePedActions();
    if (!face) return null;

    const f1 = face.face1 ?? {};
    const f2 = face.face2 ?? {};
    const f3 = face.face3 ?? {};
    const advanced = Number(f3.mix) === 0;
    const toggleAdvanced = (on) => {
        actions.sound('SELECT');
        actions.headBlend('face3', 'mix', on ? 0 : 100);
    };

    const parent = (key, p, title) => (
        <Group key={key} title={title}>
            <StepperRow label="Face shape" value={Number(p.index) || 0} min={0} max={HEAD_BLEND_MAX} onChange={(v) => actions.headBlend(key, 'index', v)} />
            <StepperRow label="Skin tone" value={Number(p.texture) || 0} min={0} max={HEAD_BLEND_MAX} onChange={(v) => actions.headBlend(key, 'texture', v)} />
        </Group>
    );

    return (
        <>
            <Group title="Heritage" action={<EnableSwitch checked={advanced} onChange={toggleAdvanced} label={advanced ? 'Blend' : 'Single'} />}>
                {advanced ? (
                    <Typography variant="caption">Blend the shape and skin of two parents.</Typography>
                ) : (
                    <StepperRow
                        label="Face"
                        value={Number(f3.index) || 0}
                        min={0}
                        max={HEAD_BLEND_MAX}
                        onChange={(v) => actions.headBlend('face3', 'index', v)}
                        caption={`${(Number(f3.index) || 0) + 1} of ${HEAD_BLEND_MAX + 1}`}
                    />
                )}
            </Group>
            {advanced && parent('face1', f1, 'Parent A')}
            {advanced && parent('face2', f2, 'Parent B')}
            {advanced && (
                <Group title="Blend">
                    <SliderRow label="Shape · A ↔ B" value={Math.round(Number(f1.mix) || 0)} min={0} max={100} unit="%" onChange={(v) => actions.headBlend('face1', 'mix', v)} />
                    <SliderRow label="Skin · A ↔ B" value={Math.round(Number(f2.mix) || 0)} min={0} max={100} unit="%" onChange={(v) => actions.headBlend('face2', 'mix', v)} />
                </Group>
            )}
        </>
    );
}
