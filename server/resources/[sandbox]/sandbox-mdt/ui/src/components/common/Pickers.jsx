import React, { useEffect, useState } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { fetchNui } from '@sandbox/ui-kit';
import { useDebounced, usePerson, useUser } from '../../hooks/index.js';
import { dateLong } from '../../lib/format.js';

const asArray = (v) => (Array.isArray(v) ? v : []);

/** Multi-select of civilians via InputSearch { type:'people' }. */
export function PeoplePicker({ label = 'People', placeholder = 'Name or State ID', value, onChange, disabled = false, multiple = true }) {
    const [input, setInput] = useState('');
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(false);

    const search = useDebounced(async (term) => {
        try {
            const res = await fetchNui('InputSearch', { type: 'people', term });
            setOptions(asArray(res));
        } catch (e) {
            setOptions([]);
        }
        setLoading(false);
    }, 600);

    useEffect(() => {
        if (input && input.length > 0) {
            setLoading(true);
            search(input);
        } else {
            setLoading(false);
            setOptions([]);
        }
    }, [input]); // eslint-disable-line react-hooks/exhaustive-deps

    const selected = multiple ? asArray(value) : value;
    return (
        <Autocomplete
            multiple={multiple}
            size="small"
            loading={loading}
            disabled={disabled}
            options={options.filter((o) => (multiple ? !selected.some((v) => v.SID == o.SID) : true))}
            getOptionLabel={(o) => `${o.First} ${o.Last} [${o.SID}]`}
            isOptionEqualToValue={(a, b) => a.SID == b.SID}
            filterOptions={(x) => x}
            value={selected}
            inputValue={input}
            onInputChange={(e, v, reason) => {
                if (reason !== 'reset') setInput(v);
            }}
            onChange={(e, v) => {
                onChange(v);
                setInput('');
            }}
            renderInput={(params) => <TextField {...params} label={label} placeholder={placeholder} />}
            renderValue={(vals, getTagProps) =>
                vals.map((o, i) => <Chip size="small" label={`${o.First} ${o.Last} [${o.SID}]`} {...getTagProps({ index: i })} key={o.SID} disabled={disabled} />)
            }
            renderOption={(props, o) => {
                const { key, ...rest } = props;
                return (
                    <li key={key} {...rest}>
                        <Box>
                            <Typography variant="body2">
                                {o.First} {o.Last}
                            </Typography>
                            <Typography variant="caption" className="sb-mono">
                                State ID {o.SID}
                                {o.DOB ? ` · DOB ${dateLong(o.DOB)}` : ''}
                            </Typography>
                        </Box>
                    </li>
                );
            }}
        />
    );
}

/** Multi-select of job members via InputSearch { type:'job', job }. */
export function OfficerPicker({ job = 'police', label = 'Officers', placeholder = 'Name, callsign or State ID', value, onChange, disabled = false, disableSelf = false }) {
    const user = useUser();
    const formatPerson = usePerson();
    const [input, setInput] = useState('');
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(false);

    const search = useDebounced(async (j, term) => {
        try {
            const res = await fetchNui('InputSearch', { type: 'job', job: j, term });
            setOptions(asArray(res));
        } catch (e) {
            setOptions([]);
        }
        setLoading(false);
    }, 500);

    useEffect(() => {
        if (input && input.length > 0) {
            setLoading(true);
            search(job, input);
        } else {
            setLoading(false);
            setOptions([]);
        }
    }, [input, job]); // eslint-disable-line react-hooks/exhaustive-deps

    const selected = asArray(value);
    return (
        <Autocomplete
            multiple
            size="small"
            loading={loading}
            disabled={disabled}
            options={options.filter((o) => !selected.some((v) => v.SID == o.SID))}
            getOptionLabel={(o) => formatPerson(o.First, o.Last, o.Callsign, o.SID)}
            isOptionEqualToValue={(a, b) => a.SID == b.SID}
            filterOptions={(x) => x}
            value={selected}
            inputValue={input}
            onInputChange={(e, v, reason) => {
                if (reason !== 'reset') setInput(v);
            }}
            onChange={(e, v) => {
                onChange(v);
                setInput('');
            }}
            renderInput={(params) => <TextField {...params} label={label} placeholder={placeholder} />}
            renderValue={(vals, getTagProps) =>
                vals.map((o, i) => {
                    const isSelf = disableSelf && user && o.SID == user.SID;
                    return (
                        <Chip
                            size="small"
                            color={isSelf ? 'primary' : 'default'}
                            variant={isSelf ? 'filled' : 'outlined'}
                            label={formatPerson(o.First, o.Last, o.Callsign, o.SID)}
                            {...getTagProps({ index: i })}
                            key={o.SID}
                            disabled={disabled || isSelf}
                        />
                    );
                })
            }
            renderOption={(props, o) => {
                const { key, ...rest } = props;
                return (
                    <li key={key} {...rest}>
                        <Box>
                            <Typography variant="body2">
                                {o.First} {o.Last}
                            </Typography>
                            <Typography variant="caption" className="sb-mono">
                                {o.Callsign ? `Callsign ${o.Callsign}` : `State ID ${o.SID}`}
                            </Typography>
                        </Box>
                    </li>
                );
            }}
        />
    );
}
