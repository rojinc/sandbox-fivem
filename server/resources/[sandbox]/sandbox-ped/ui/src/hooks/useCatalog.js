import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { fetchNui } from '@sandbox/ui-kit';

const CALLBACKS = {
    components: { drawables: 'GetNumberOfPedDrawableVariations', textures: 'GetNumberOfPedTextureVariations' },
    props: { drawables: 'GetNumberOfPedPropDrawableVariations', textures: 'GetNumberOfPedPropTextureVariations' },
};

/**
 * Ask the game which drawables a component/prop slot offers and how many
 * textures the current drawable has. Replies arrive as SET_MAX_DRAWABLE /
 * SET_MAX_TEXTURE and land in the catalog slice.
 *
 * @returns {{ allowed: number[]|null, textures: number|null }}
 */
export function useDrawables(kind, componentId, drawableId) {
    const allowedRaw = useSelector((s) => s.catalog.drawables[kind]?.[componentId]);
    const texturesRaw = useSelector((s) => s.catalog.textures[kind]?.[componentId]);
    const missing = allowedRaw === undefined;

    useEffect(() => {
        if (missing) fetchNui(CALLBACKS[kind].drawables, { componentId });
    }, [kind, componentId, missing]);

    useEffect(() => {
        fetchNui(CALLBACKS[kind].textures, { componentId, drawableId });
    }, [kind, componentId, drawableId]);

    return {
        allowed: Array.isArray(allowedRaw) && allowedRaw.length ? allowedRaw : null,
        textures: typeof texturesRaw === 'number' && texturesRaw > 0 ? texturesRaw : null,
    };
}
