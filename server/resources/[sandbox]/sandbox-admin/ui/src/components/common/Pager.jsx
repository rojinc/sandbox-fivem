import React from 'react';
import Box from '@mui/material/Box';
import Pagination from '@mui/material/Pagination';
import Typography from '@mui/material/Typography';

export default function Pager({ page, pages, onChange, summary }) {
    if (pages <= 1 && !summary) return null;
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'space-between' }}>
            <Typography variant="caption">{summary}</Typography>
            {pages > 1 && (
                <Pagination
                    size="small"
                    shape="rounded"
                    color="primary"
                    page={page}
                    count={pages}
                    onChange={(_, p) => onChange(p)}
                    sx={{ '& .MuiPaginationItem-root': { fontFamily: 'var(--sb-font-mono)', fontSize: 12 } }}
                />
            )}
        </Box>
    );
}
