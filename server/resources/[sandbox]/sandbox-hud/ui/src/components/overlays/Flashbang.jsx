import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Box from '@mui/material/Box';

/** White-out for SET_FLASHBANGED { duration, strength } that clears itself afterwards. */
export default function Flashbang() {
    const dispatch = useDispatch();
    const flash = useSelector((s) => s.app.flashbanged);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (!flash) {
            setVisible(false);
            return undefined;
        }
        setVisible(true);
        const t = setTimeout(() => setVisible(false), Number(flash.duration) || 3000);
        return () => clearTimeout(t);
    }, [flash]);

    const onTransitionEnd = () => {
        if (!visible && flash) dispatch({ type: 'CLEAR_FLASHBANGED' });
    };

    return (
        <Box
            onTransitionEnd={onTransitionEnd}
            sx={{
                position: 'absolute',
                inset: 0,
                background: '#ffffff',
                opacity: visible ? Math.max(0, Math.min(1, Number(flash?.strength) || 0)) : 0,
                transition: visible ? 'opacity 60ms linear' : 'opacity 900ms ease-out',
            }}
        />
    );
}
