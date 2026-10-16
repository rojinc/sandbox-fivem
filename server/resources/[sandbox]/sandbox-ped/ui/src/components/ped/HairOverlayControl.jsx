import React from 'react';
import { useSelector } from 'react-redux';
import { Group } from '../controls/Group.jsx';
import { StepperRow } from '../controls/StepperRow.jsx';
import { usePedActions } from '../../hooks/usePedActions.js';

const display = (v) => (v === -1 ? 'Auto' : v === 0 ? 'None' : `#${v}`);

/** ped.customization.hairOverlay: -1 auto, 0 none, 1..n = Config.CustomHairOverlays. */
export function HairOverlayControl() {
    const value = useSelector((s) => {
        const v = s.ped.ped.customization.hairOverlay;
        return typeof v === 'number' ? v : -1;
    });
    const maxOverlays = useSelector((s) => s.catalog.hairOverlays);
    const actions = usePedActions();
    const caption = value === -1 ? 'Matches the chosen hairstyle' : value === 0 ? 'No fade overlay' : 'Custom fade from the server list';

    return (
        <Group title="Hairline fade">
            <StepperRow
                label="Overlay"
                value={value}
                min={-1}
                max={maxOverlays || null}
                onChange={(v) => actions.hairOverlay(v)}
                display={display}
                caption={caption}
                valueWidth={52}
            />
        </Group>
    );
}
