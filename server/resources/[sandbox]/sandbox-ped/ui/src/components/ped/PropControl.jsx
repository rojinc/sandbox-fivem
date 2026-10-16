import React from 'react';
import { useSelector } from 'react-redux';
import { Group } from '../controls/Group.jsx';
import { StepperRow } from '../controls/StepperRow.jsx';
import { EnableSwitch } from '../controls/EnableSwitch.jsx';
import { PROPS } from '../../data/components.js';
import { usePedActions } from '../../hooks/usePedActions.js';
import { useDrawables } from '../../hooks/useCatalog.js';

/** One prop slot (hat, glasses, …): on/off switch, style and texture. */
export function PropControl({ name }) {
    const def = PROPS[name] ?? { label: name };
    const prop = useSelector((s) => s.ped.ped.customization.props?.[name]);
    const actions = usePedActions();
    const { allowed, textures } = useDrawables('props', prop?.componentId ?? 0, prop?.drawableId ?? 0);
    if (!prop) return null;

    const disabled = Boolean(prop.disabled);
    const pos = allowed ? allowed.indexOf(prop.drawableId) : -1;
    const styleValue = allowed ? Math.max(pos, 0) : prop.drawableId;
    const onStyle = (next) => {
        const drawable = allowed ? allowed[next] : next;
        actions.prop(name, 'drawableId', drawable);
        actions.prop(name, 'textureId', 0);
    };
    const toggle = (on) => {
        actions.sound('SELECT');
        actions.prop(name, 'disabled', !on);
    };

    let caption;
    if (!allowed) caption = 'Fetching catalogue…';
    else if (pos < 0) caption = `Item #${prop.drawableId} is not sold here`;
    else caption = `${pos + 1} of ${allowed.length}`;

    return (
        <Group title={def.label} action={<EnableSwitch checked={!disabled} onChange={toggle} label={disabled ? 'Off' : 'Worn'} />}>
            <StepperRow
                label="Style"
                value={styleValue}
                min={0}
                max={allowed ? allowed.length - 1 : null}
                onChange={onStyle}
                display={(v) => String(allowed ? allowed[v] : v)}
                caption={caption}
                disabled={disabled}
            />
            <StepperRow
                label="Texture"
                value={prop.textureId ?? 0}
                min={0}
                max={textures ? textures - 1 : null}
                onChange={(v) => actions.prop(name, 'textureId', v)}
                caption={textures ? `${(prop.textureId ?? 0) + 1} of ${textures}` : 'Fetching variants…'}
                disabled={disabled}
            />
        </Group>
    );
}
