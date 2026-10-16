import React, { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import { sanitizeHtml, Icon } from '@sandbox/ui-kit';

const TOOLS = [
    { cmd: 'bold', icon: 'bold', label: 'Bold (Ctrl+B)' },
    { cmd: 'italic', icon: 'italic', label: 'Italic (Ctrl+I)' },
    { cmd: 'underline', icon: 'underline', label: 'Underline (Ctrl+U)' },
    { cmd: 'strikeThrough', icon: 'strikethrough', label: 'Strikethrough' },
    { sep: true },
    { cmd: 'insertUnorderedList', icon: 'list-ul', label: 'Bulleted list' },
    { cmd: 'insertOrderedList', icon: 'list-ol', label: 'Numbered list' },
    { sep: true },
    { cmd: 'removeFormat', icon: 'eraser', label: 'Clear formatting' },
];

const contentSx = {
    '& p': { margin: '0 0 8px' },
    '& ul, & ol': { margin: '0 0 8px', paddingLeft: 22 },
    '& li': { marginBottom: 2 },
    '& b, & strong': { fontWeight: 600 },
    lineHeight: 1.55,
    fontSize: 14,
    wordBreak: 'break-word',
};

/** Sanitised HTML viewer sharing the editor's typography. */
export function RichView({ html, sx, emptyText = 'No notes.' }) {
    const clean = sanitizeHtml(html);
    if (!clean || clean.replace(/<[^>]+>/g, '').trim() === '') {
        return (
            <Typography variant="body2" sx={{ color: 'var(--sb-text-3)', ...sx }}>
                {emptyText}
            </Typography>
        );
    }
    return <Box sx={{ ...contentSx, color: 'var(--sb-text)', userSelect: 'text', ...sx }} dangerouslySetInnerHTML={{ __html: clean }} />;
}

/**
 * Lightweight contentEditable editor (bold / italic / underline / strike /
 * lists). `value` is HTML; `onChange` receives sanitised HTML.
 */
export default function RichEditor({ value = '', onChange, disabled = false, placeholder = 'Type here…', minHeight = 240, label, sx }) {
    const ref = useRef(null);
    const lastEmitted = useRef(null);
    const [focused, setFocused] = useState(false);
    const [empty, setEmpty] = useState(true);

    useEffect(() => {
        if (!ref.current) return;
        if (value === lastEmitted.current) return;
        const clean = sanitizeHtml(value ?? '');
        ref.current.innerHTML = clean;
        lastEmitted.current = value ?? '';
        setEmpty(clean.replace(/<[^>]+>/g, '').trim() === '');
    }, [value]);

    const emit = () => {
        if (!ref.current) return;
        const html = sanitizeHtml(ref.current.innerHTML);
        const isEmpty = html.replace(/<[^>]+>/g, '').trim() === '';
        setEmpty(isEmpty);
        const out = isEmpty ? '' : html;
        lastEmitted.current = out;
        onChange?.(out);
    };

    const exec = (cmd) => {
        if (disabled) return;
        ref.current?.focus();
        document.execCommand(cmd, false, null);
        emit();
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0,
                borderRadius: 'var(--sb-radius-md)',
                border: `1px solid ${focused ? 'var(--sb-accent)' : 'var(--sb-border)'}`,
                background: 'var(--sb-surface-soft)',
                transition: 'border-color var(--sb-dur-fast) var(--sb-ease)',
                opacity: disabled ? 0.85 : 1,
                ...sx,
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.75, borderBottom: '1px solid var(--sb-border)' }}>
                {label && (
                    <Typography variant="overline" sx={{ color: 'var(--sb-text-3)', mr: 1 }}>
                        {label}
                    </Typography>
                )}
                {TOOLS.map((t, i) =>
                    t.sep ? (
                        <Box key={`sep-${i}`} sx={{ width: 1, height: 18, background: 'var(--sb-border)', mx: 0.5 }} />
                    ) : (
                        <Tooltip key={t.cmd} title={t.label}>
                            <Box
                                component="button"
                                type="button"
                                disabled={disabled}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => exec(t.cmd)}
                                aria-label={t.label}
                                sx={{
                                    width: 28,
                                    height: 26,
                                    border: 0,
                                    borderRadius: '6px',
                                    background: 'transparent',
                                    color: 'var(--sb-text-2)',
                                    cursor: disabled ? 'default' : 'pointer',
                                    display: 'grid',
                                    placeItems: 'center',
                                    fontSize: 12,
                                    '&:hover': { background: disabled ? 'transparent' : 'var(--sb-surface-hover)', color: 'var(--sb-text)' },
                                    '&:focus-visible': { outline: '1px solid var(--sb-accent)' },
                                }}
                            >
                                <Icon icon={t.icon} />
                            </Box>
                        </Tooltip>
                    ),
                )}
            </Box>
            <Box sx={{ position: 'relative', flex: 1, minHeight, overflowY: 'auto' }}>
                {empty && !focused && (
                    <Typography variant="body2" sx={{ position: 'absolute', top: 12, left: 14, color: 'var(--sb-text-3)', pointerEvents: 'none' }}>
                        {placeholder}
                    </Typography>
                )}
                <Box
                    ref={ref}
                    contentEditable={!disabled}
                    suppressContentEditableWarning
                    spellCheck={false}
                    onInput={emit}
                    onBlur={() => {
                        setFocused(false);
                        emit();
                    }}
                    onFocus={() => setFocused(true)}
                    onKeyDown={(e) => {
                        if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
                            const k = e.key.toLowerCase();
                            if (k === 'b' || k === 'i' || k === 'u') {
                                e.preventDefault();
                                exec(k === 'b' ? 'bold' : k === 'i' ? 'italic' : 'underline');
                            }
                        }
                    }}
                    sx={{
                        ...contentSx,
                        minHeight,
                        px: 1.75,
                        py: 1.5,
                        outline: 'none',
                        userSelect: 'text',
                        cursor: disabled ? 'default' : 'text',
                        color: 'var(--sb-text)',
                    }}
                />
            </Box>
        </Box>
    );
}
