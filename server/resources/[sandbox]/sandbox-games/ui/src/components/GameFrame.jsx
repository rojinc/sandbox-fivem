import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Panel, IconTile, colors } from '@sandbox/ui-kit';

/**
 * The glass widget every game lives in: icon + title + subtitle header, an
 * optional right-hand slot (timer, counters, key hints) and a relative body
 * that overlays (countdown, result) cover.
 */
export function GameFrame({ icon, title, subtitle, aside, width, height, critical = false, children, sx, bodySx }) {
    return (
        <Panel
            padding={0}
            sx={{
                width,
                height,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                transition: 'border-color 200ms var(--sb-ease)',
                ...(critical ? { animation: 'sb-blink-danger 1s steps(1) infinite' } : {}),
                ...sx,
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    px: 2,
                    py: 1.5,
                    borderBottom: `1px solid ${colors.border}`,
                    flexShrink: 0,
                }}
            >
                <IconTile icon={icon} tone="accent" size={34} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="h4" className="sb-truncate">
                        {title}
                    </Typography>
                    {subtitle && (
                        <Typography variant="caption" className="sb-truncate" sx={{ display: 'block', color: colors.text2 }}>
                            {subtitle}
                        </Typography>
                    )}
                </Box>
                {aside && <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>{aside}</Box>}
            </Box>
            <Box sx={{ position: 'relative', flex: 1, minHeight: 0, p: 2, ...bodySx }}>{children}</Box>
        </Panel>
    );
}

export default GameFrame;
