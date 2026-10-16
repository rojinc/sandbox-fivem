import React, { useEffect, useRef, useState } from 'react';
import Slider from '@mui/material/Slider';
import { useThrottledSend } from '../../hooks/useThrottledSend.js';

/**
 * Slider whose drag previews live in-game: the thumb follows the pointer
 * immediately while calls to `onChange` are throttled, and the final value is
 * always delivered on release.
 */
export function LiveSlider({ value, min, max, step = 1, onChange, disabled, sx }) {
    const [local, setLocal] = useState(value);
    const dragging = useRef(false);
    const { push, commit } = useThrottledSend(onChange, 60);

    useEffect(() => {
        if (!dragging.current) setLocal(value);
    }, [value]);

    return (
        <Slider
            size="small"
            value={typeof local === 'number' ? local : min}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            onChange={(e, v) => {
                dragging.current = true;
                setLocal(v);
                push(v);
            }}
            onChangeCommitted={(e, v) => {
                dragging.current = false;
                setLocal(v);
                commit(v);
            }}
            sx={{
                py: '6px',
                '& .MuiSlider-thumb': { width: 12, height: 12, '&:hover, &.Mui-focusVisible': { boxShadow: '0 0 0 6px var(--sb-accent-soft)' } },
                '& .MuiSlider-rail': { opacity: 0.2 },
                ...sx,
            }}
        />
    );
}
