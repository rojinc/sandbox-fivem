import React from 'react';
import { useSelector } from 'react-redux';
import { Group } from '../controls/Group.jsx';
import { StepperRow } from '../controls/StepperRow.jsx';
import { COMPONENTS } from '../../data/components.js';
import { usePedActions } from '../../hooks/usePedActions.js';
import { useDrawables } from '../../hooks/useCatalog.js';

/**
 * One clothing slot (ped.customization.components.<name>): style + texture.
 * The style stepper walks the list of drawables the store allows
 * (SET_MAX_DRAWABLE), changing drawable resets the texture to 0 like the game.
 */
export function ComponentControl({ name, label }) {
    const def = COMPONENTS[name] ?? { label: name };
    const comp = useSelector((s) => s.ped.ped.customization.components?.[name]);
    const actions = usePedActions();
    const { allowed, textures } = useDrawables('components', comp?.componentId ?? 0, comp?.drawableId ?? 0);
    if (!comp) return null;

    const pos = allowed ? allowed.indexOf(comp.drawableId) : -1;
    const styleValue = allowed ? Math.max(pos, 0) : comp.drawableId;
    const onStyle = (next) => {
        const drawable = allowed ? allowed[next] : next;
        actions.component(name, 'drawableId', drawable);
        actions.component(name, 'textureId', 0);
    };

    let caption;
    if (!allowed) caption = 'Fetching catalogue…';
    else if (pos < 0) caption = `Item #${comp.drawableId} is not sold here`;
    else caption = `${pos + 1} of ${allowed.length}`;

    return (
        <Group title={label ?? def.label}>
            <StepperRow
                label="Style"
                value={styleValue}
                min={0}
                max={allowed ? allowed.length - 1 : null}
                onChange={onStyle}
                display={(v) => String(allowed ? allowed[v] : v)}
                caption={caption}
            />
            <StepperRow
                label="Texture"
                value={comp.textureId ?? 0}
                min={0}
                max={textures ? textures - 1 : null}
                onChange={(v) => actions.component(name, 'textureId', v)}
                caption={textures ? `${(comp.textureId ?? 0) + 1} of ${textures}` : 'Fetching variants…'}
            />
        </Group>
    );
}
