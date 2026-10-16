import React from 'react';
import Pagination from '@mui/material/Pagination';
import Box from '@mui/material/Box';

export default function Pager({ page, count, onChange, sx }) {
    if (!count || count <= 1) return null;
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1, ...sx }}>
            <Pagination page={page} count={count} onChange={(e, p) => onChange(p)} shape="rounded" size="small" color="primary" />
        </Box>
    );
}
