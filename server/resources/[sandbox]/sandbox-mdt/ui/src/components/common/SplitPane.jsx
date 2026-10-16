import React, { useState } from 'react';
import Box from '@mui/material/Box';
import { IconButton } from '@sandbox/ui-kit';
import { Surface } from './Surface.jsx';

/**
 * Search list on the left, detail on the right. The list collapses to a thin
 * rail so the detail can use the full width.
 */
export default function SplitPane({ list, detail, width = 500, collapsible = true, defaultExpanded = true }) {
    const [expanded, setExpanded] = useState(defaultExpanded);
    return (
        <Box
            sx={{
                height: '100%',
                minHeight: 0,
                display: 'grid',
                gridTemplateColumns: expanded ? `${width}px minmax(0, 1fr)` : `44px minmax(0, 1fr)`,
                gap: 2,
                transition: 'grid-template-columns var(--sb-dur) var(--sb-ease)',
            }}
        >
            <Surface padding={expanded ? 16 : 6} sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
                {collapsible && (
                    <Box sx={{ position: 'absolute', top: 6, right: 6, zIndex: 2 }}>
                        <IconButton icon={expanded ? 'chevron-left' : 'chevron-right'} label={expanded ? 'Collapse list' : 'Expand list'} onClick={() => setExpanded((v) => !v)} />
                    </Box>
                )}
                <Box sx={{ display: expanded ? 'flex' : 'none', flexDirection: 'column', minHeight: 0, flex: 1 }}>{list}</Box>
            </Surface>
            <Surface sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>{detail}</Surface>
        </Box>
    );
}
