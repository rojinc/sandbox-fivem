import React from 'react';
import Avatar from '@mui/material/Avatar';
import { initials } from '../../lib/format.js';

/**
 * Discord avatar with an initials fallback. The URL is player data from Lua;
 * when the game has no connectivity the image fails and the initials show.
 */
export default function UserAvatar({ src, name, size = 32, sx }) {
    return (
        <Avatar
            src={src || undefined}
            alt=""
            sx={{
                width: size,
                height: size,
                fontSize: Math.round(size * 0.38),
                fontWeight: 600,
                background: 'var(--sb-bg-4)',
                color: 'var(--sb-text-2)',
                border: '1px solid var(--sb-border-strong)',
                ...sx,
            }}
        >
            {initials(name)}
        </Avatar>
    );
}
