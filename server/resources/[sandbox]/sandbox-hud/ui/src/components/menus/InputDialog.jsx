import React from 'react';
import { useSelector } from 'react-redux';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import { Button, fetchNui, useKey } from '@sandbox/ui-kit';

function Field({ input, fallbackLabel, autoFocus }) {
    const { id, type, options = {} } = input;
    const label = input.label ?? fallbackLabel ?? '';
    const common = { fullWidth: true, id, name: id, label, autoFocus, ...options };

    switch (type) {
        case 'number':
            return <TextField type="number" inputMode="numeric" {...common} />;
        case 'multiline':
            return <TextField multiline minRows={3} {...common} />;
        case 'select':
            return (
                <TextField select defaultValue={options.value ?? options.defaultValue ?? ''} {...common}>
                    {(input.select ?? []).map((o) => (
                        <MenuItem key={o.value} value={o.value}>
                            {o.label}
                        </MenuItem>
                    ))}
                </TextField>
            );
        default:
            return <TextField type="text" {...common} />;
    }
}

/** Form dialog for Input:Show (client/input.lua). Values are submitted as strings keyed by input id. */
export default function InputDialog() {
    const input = useSelector((s) => s.input);
    const inputs = Array.isArray(input.inputs) ? input.inputs : Object.values(input.inputs ?? {});

    const close = () => fetchNui('Input:Close', { event: input.event, values: false, data: input.data });
    const submit = (e) => {
        e.preventDefault();
        const values = {};
        inputs.forEach((inp) => {
            const el = e.target.elements[inp.id];
            values[inp.id] = el ? el.value : '';
        });
        fetchNui('Input:Submit', { event: input.event, values, data: input.data });
    };

    useKey('Escape', close, { enabled: input.showing });

    return (
        <Dialog open={Boolean(input.showing)} onClose={close} fullWidth maxWidth="xs">
            <form onSubmit={submit}>
                <DialogTitle>{input.title}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        {inputs.map((inp, i) => (
                            <Field key={inp.id} input={inp} fallbackLabel={input.label} autoFocus={i === 0 && !inp.options?.disabled} />
                        ))}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button tone="ghost" onClick={close}>
                        Cancel
                    </Button>
                    <Button tone="primary" type="submit">
                        Submit
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
