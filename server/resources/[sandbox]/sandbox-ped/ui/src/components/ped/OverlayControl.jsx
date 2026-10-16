import React from 'react';
import { useSelector } from 'react-redux';
import { Group } from '../controls/Group.jsx';
import { StepperRow } from '../controls/StepperRow.jsx';
import { SliderRow } from '../controls/SliderRow.jsx';
import { EnableSwitch } from '../controls/EnableSwitch.jsx';
import { OVERLAYS, OVERLAY_COLOR_MAX } from '../../data/overlays.js';
import { usePedActions } from '../../hooks/usePedActions.js';

/**
 * A head overlay (blemishes, makeup, eyebrows, …): enable switch, style,
 * opacity and, for tinted overlays, one or two colour indices. The game tints
 * these from its makeup palette, which it does not expose, so colours are
 * chosen by index.
 */
export function OverlayControl({ overlayKey }) {
    const def = OVERLAYS[overlayKey];
    const o = useSelector((s) => s.ped.ped.customization.overlay?.[overlayKey]);
    const actions = usePedActions();
    if (!def || !o) return null;

    const disabled = Boolean(o.disabled);
    const index = Number(o.index) || 0;
    const toggle = (on) => {
        actions.sound('SELECT');
        actions.overlay(overlayKey, 'disabled', !on);
    };

    return (
        <Group title={def.label} action={<EnableSwitch checked={!disabled} onChange={toggle} />}>
            <StepperRow
                label="Style"
                value={index}
                min={0}
                max={def.max}
                onChange={(v) => actions.overlay(overlayKey, 'index', v)}
                caption={`${index + 1} of ${def.max + 1}`}
                disabled={disabled}
            />
            <SliderRow
                label="Opacity"
                value={Math.round(Number(o.opacity ?? 100))}
                min={0}
                max={100}
                unit="%"
                onChange={(v) => actions.overlay(overlayKey, 'opacity', v)}
                disabled={disabled}
            />
            {def.colors >= 1 && (
                <StepperRow
                    label="Colour"
                    value={Number(o.color1) || 0}
                    min={0}
                    max={OVERLAY_COLOR_MAX}
                    onChange={(v) => actions.overlay(overlayKey, 'color1', v)}
                    disabled={disabled}
                />
            )}
            {def.colors >= 2 && (
                <StepperRow
                    label="Second colour"
                    value={Number(o.color2) || 0}
                    min={0}
                    max={OVERLAY_COLOR_MAX}
                    onChange={(v) => actions.overlay(overlayKey, 'color2', v)}
                    disabled={disabled}
                />
            )}
        </Group>
    );
}
