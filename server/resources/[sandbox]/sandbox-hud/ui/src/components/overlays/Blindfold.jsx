import React from 'react';
import { useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';
import texture from '../../assets/blindfold.webp';

/** Near-black cloth texture covering the screen while blindfolded (client/blindfold.lua). */
export default function Blindfold() {
    const on = useSelector((s) => s.app.blindfolded);
    return (
        <Fade in={on} timeout={400}>
            <Box
                sx={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.92)',
                    backgroundImage: `url(${texture})`,
                    backgroundSize: 'cover',
                    backgroundPosition: '50% 0',
                    backgroundRepeat: 'no-repeat',
                }}
            />
        </Fade>
    );
}
