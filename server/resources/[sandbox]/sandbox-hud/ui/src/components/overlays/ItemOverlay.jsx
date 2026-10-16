import React from 'react';
import { useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import Slide from '@mui/material/Slide';
import huntingDark from '../../assets/hunting-map-dark.webp';
import huntingLight from '../../assets/hunting-map-light.webp';

function imageFor(item) {
    if (!item?.Name) return null;
    if (item.Name === 'hunting_map_dark') return huntingDark;
    if (item.Name === 'hunting_map_light') return huntingLight;
    if (item.Name.includes('vanityitem')) return item.MetaData?.CustomItemImage ?? null;
    return null;
}

/** Left-side image panel for held items such as maps (Hud.Overlay:Show). */
export default function ItemOverlay() {
    const { showing, items } = useSelector((s) => s.overlay);
    const src = imageFor(items[0]);
    return (
        <Slide direction="right" in={showing && Boolean(src)} mountOnEnter unmountOnExit>
            <Box sx={{ position: 'absolute', top: '25vh', left: '2vw', width: '25vw', height: '50vh' }}>
                <Box
                    className="sb-glass"
                    sx={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '14px',
                        p: '10px',
                        backgroundImage: `url(${src})`,
                        backgroundSize: 'contain',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center',
                        backgroundOrigin: 'content-box',
                    }}
                />
            </Box>
        </Slide>
    );
}
