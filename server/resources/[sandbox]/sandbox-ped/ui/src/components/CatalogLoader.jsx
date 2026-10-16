import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { fetchNui } from '@sandbox/ui-kit';

/**
 * Mounted once per session. Asks the game how many hair colours exist, then
 * collects the RGB of every colour id through GetPedHairRgbColor. Lua echoes
 * `type`/`name` back in SET_HAIR_COLOR_RGB, so name "palette" + type <id>
 * lets the catalog slice build the swatch palette from real game data.
 */
export function CatalogLoader() {
    const max = useSelector((s) => s.catalog.hairColors);
    const requestedFor = useRef(0);

    useEffect(() => {
        fetchNui('GetNumHairColors');
    }, []);

    useEffect(() => {
        if (!max || requestedFor.current === max) return;
        requestedFor.current = max;
        for (let i = 0; i < max; i += 1) {
            fetchNui('GetPedHairRgbColor', { colorId: i, type: i, name: 'palette' });
        }
    }, [max]);

    return null;
}
