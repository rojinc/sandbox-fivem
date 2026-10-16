import React, { useMemo, useState } from 'react';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import { fetchNui, IconButton } from '@sandbox/ui-kit';
import { Surface, Toolbar } from '../common/Surface.jsx';
import SearchField from '../common/SearchField.jsx';
import { PrisonerTable, usePrisoners, filterPrisoners } from './Prisoners.jsx';
import { toast } from '../../lib/toast.js';

/** Visitation kiosk: public view of inmates with a "let DOC know" button. */
export default function PrisonersPublic() {
    const { loading, results, reload } = usePrisoners();
    const [search, setSearch] = useState('');
    const [busy, setBusy] = useState({});
    const filtered = useMemo(() => filterPrisoners(results, search), [results, search]);

    const request = async (p) => {
        setBusy((b) => ({ ...b, [p.SID]: true }));
        try {
            const res = await fetchNui('DOCRequestVisitation', { SID: p.SID });
            if (res?.success) toast.success('Visitation requested. Please wait in the lobby.');
            else toast.error(res?.message || 'Unable to request visitation');
        } catch (e) {
            toast.error('Unable to request visitation');
        }
    };

    return (
        <Surface sx={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <Toolbar sx={{ mb: 2 }}>
                <SearchField value={search} onChange={setSearch} placeholder="Search by inmate name or State ID" sx={{ maxWidth: 440 }} autoFocus />
                <Typography variant="caption" sx={{ ml: 'auto' }}>
                    Bolingbroke Penitentiary · visitation requests
                </Typography>
                <IconButton icon="arrows-rotate" label="Refresh" onClick={reload} />
            </Toolbar>
            <PrisonerTable
                prisoners={filtered}
                loading={loading}
                actionHeader="Visit"
                action={(p) => (
                    <Tooltip title="Let DOC know you are here">
                        <span>
                            <IconButton icon="phone-volume" label="Request visitation" disabled={Boolean(busy[p.SID])} onClick={() => request(p)} />
                        </span>
                    </Tooltip>
                )}
            />
        </Surface>
    );
}
