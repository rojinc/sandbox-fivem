import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { IconButton } from '@sandbox/ui-kit';
import { useToast } from './Toasts.jsx';
import { copyToClipboard } from '../../lib/nui.js';

/**
 * Label / value rows for detail panes.
 * items: [{ label, value, mono, copy (string|true), wrap, hidden }]
 */
export default function KeyValue({ items, labelWidth = 128 }) {
    const toast = useToast();
    const visible = items.filter((i) => i && !i.hidden);

    const copy = (item) => {
        const text = item.copy === true ? item.value : item.copy;
        if (copyToClipboard(text)) toast.success(`Copied ${item.label.toLowerCase()}`);
        else toast.error('Clipboard unavailable');
    };

    return (
        <Box component="dl" sx={{ m: 0, display: 'flex', flexDirection: 'column' }}>
            {visible.map((item) => (
                <Box
                    key={item.label}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        minHeight: 34,
                        py: 0.5,
                        borderBottom: '1px solid var(--sb-border)',
                        '&:last-child': { borderBottom: 'none' },
                        '& .kv-copy': { opacity: 0, transition: 'opacity var(--sb-dur-fast) var(--sb-ease)' },
                        '&:hover .kv-copy, & .kv-copy:focus-visible, & .kv-copy.Mui-focusVisible': { opacity: 1 },
                    }}
                >
                    <Typography component="dt" variant="caption" sx={{ width: labelWidth, flexShrink: 0, color: 'var(--sb-text-3)' }}>
                        {item.label}
                    </Typography>
                    <Box component="dd" sx={{ m: 0, flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 1 }}>
                        {typeof item.value === 'string' || typeof item.value === 'number' ? (
                            <Typography
                                variant="body2"
                                className={[item.mono ? 'sb-mono' : '', item.wrap ? '' : 'sb-truncate'].join(' ').trim()}
                                sx={{ color: 'var(--sb-text)', fontSize: 13, ...(item.wrap ? { whiteSpace: 'normal', wordBreak: 'break-all', lineHeight: 1.35 } : {}) }}
                                title={item.wrap ? undefined : String(item.value)}
                            >
                                {item.value}
                            </Typography>
                        ) : (
                            item.value
                        )}
                    </Box>
                    {item.copy && <IconButton className="kv-copy" icon="copy" label={`Copy ${item.label.toLowerCase()}`} onClick={() => copy(item)} />}
                </Box>
            ))}
        </Box>
    );
}
