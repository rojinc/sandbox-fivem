import React from 'react';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Skeleton from '@mui/material/Skeleton';
import { EmptyState } from '@sandbox/ui-kit';

/**
 * Scrollable table with sticky header, keyboard-operable rows and
 * loading / empty states.
 *
 * columns: [{ key, label, width, align, mono, render(row) }]
 */
export default function DataTable({ columns, rows, rowKey, onRowClick, rowDisabled, loading, empty, sx }) {
    const clickable = typeof onRowClick === 'function';

    const body = () => {
        if (loading) {
            return Array.from({ length: 7 }, (_, i) => (
                <TableRow key={`s${i}`}>
                    {columns.map((c) => (
                        <TableCell key={c.key}>
                            <Skeleton variant="text" width={c.skeleton ?? '70%'} sx={{ fontSize: 13 }} />
                        </TableCell>
                    ))}
                </TableRow>
            ));
        }
        if (!rows.length) {
            return (
                <TableRow>
                    <TableCell colSpan={columns.length} sx={{ borderBottom: 'none', p: 0 }}>
                        <EmptyState {...empty} />
                    </TableCell>
                </TableRow>
            );
        }
        return rows.map((row) => {
            const disabled = rowDisabled ? Boolean(rowDisabled(row)) : false;
            const active = clickable && !disabled;
            return (
                <TableRow
                    key={rowKey(row)}
                    tabIndex={active ? 0 : -1}
                    onClick={active ? () => onRowClick(row) : undefined}
                    onKeyDown={
                        active
                            ? (e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                      e.preventDefault();
                                      onRowClick(row);
                                  }
                              }
                            : undefined
                    }
                    sx={{
                        cursor: active ? 'pointer' : 'default',
                        opacity: disabled ? 0.45 : 1,
                        transition: 'background var(--sb-dur-fast) var(--sb-ease)',
                        '&:hover': active ? { background: 'var(--sb-surface-hover)' } : undefined,
                        '&:focus-visible': { outline: 'none', background: 'var(--sb-surface-hover)', boxShadow: 'inset 2px 0 0 var(--sb-accent)' },
                        '&:last-child td': { borderBottom: 'none' },
                    }}
                >
                    {columns.map((c) => (
                        <TableCell key={c.key} align={c.align} className={c.mono ? 'sb-mono' : undefined} sx={{ color: c.muted ? 'var(--sb-text-2)' : undefined }}>
                            {c.render ? c.render(row) : row[c.key]}
                        </TableCell>
                    ))}
                </TableRow>
            );
        });
    };

    return (
        <Box
            sx={{
                flex: 1,
                minHeight: 0,
                overflow: 'auto',
                border: '1px solid var(--sb-border)',
                borderRadius: '12px',
                background: 'var(--sb-surface-soft)',
                ...sx,
            }}
        >
            <Table stickyHeader size="small" sx={{ '& th': { background: 'rgba(24, 29, 38, 0.98)', whiteSpace: 'nowrap' }, '& td': { height: 42, py: 0.5 } }}>
                <TableHead>
                    <TableRow>
                        {columns.map((c) => (
                            <TableCell key={c.key} align={c.align} sx={{ width: c.width }}>
                                {c.label}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>{body()}</TableBody>
            </Table>
        </Box>
    );
}
