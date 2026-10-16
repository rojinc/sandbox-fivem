import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { EmptyState } from '@sandbox/ui-kit';
import { Surface, Scroll, Toolbar } from '../common/Surface.jsx';
import SearchField from '../common/SearchField.jsx';
import { ChargeCard, ChargeDetails, ChargeLegend, sortCharges } from '../common/Charges.jsx';

/** Read-only penal code grid; `onSelect` overrides the details dialog (admin editing). */
export function ChargeGrid({ onSelect, toolbar, emptyTitle = 'No charges match' }) {
    const charges = useSelector((s) => s.data.data.charges) ?? [];
    const [search, setSearch] = useState('');
    const [info, setInfo] = useState(null);

    const filtered = useMemo(() => {
        const term = search.trim().toUpperCase();
        return sortCharges(term ? charges.filter((c) => c.title?.toUpperCase().includes(term)) : charges);
    }, [charges, search]);

    return (
        <Surface sx={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <Toolbar sx={{ mb: 2 }}>
                <SearchField value={search} onChange={setSearch} placeholder="Search charges" sx={{ maxWidth: 360 }} autoFocus />
                <ChargeLegend sx={{ ml: 1 }} />
                <Typography variant="caption" sx={{ ml: 'auto' }}>
                    {filtered.length} of {charges.length} charges
                </Typography>
                {toolbar}
            </Toolbar>
            <Scroll>
                {filtered.length === 0 ? (
                    <EmptyState icon="gavel" title={emptyTitle} />
                ) : (
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1, pr: 0.5 }}>
                        {filtered.map((c) => (
                            <ChargeCard key={c.id} charge={c} onClick={() => (onSelect ? onSelect(c) : setInfo(c))} onInfo={onSelect ? setInfo : undefined} />
                        ))}
                    </Box>
                )}
            </Scroll>
            <ChargeDetails charge={info} onClose={() => setInfo(null)} />
        </Surface>
    );
}

export default function PenalCode() {
    return <ChargeGrid />;
}
