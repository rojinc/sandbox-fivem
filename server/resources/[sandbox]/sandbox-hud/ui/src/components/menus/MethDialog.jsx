import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Slider from '@mui/material/Slider';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { Button, fetchNui, useKey, colors } from '@sandbox/ui-kit';

const INGREDIENTS = ['Acetone', 'Battery Acid', 'Iodine Crystals', 'Sulfuric Acid', 'Phosphorous', 'Gasoline', 'Lithium', 'Anhydrous Ammonia'];

function LabeledSlider({ label, value, onChange, min = 0, max = 100, unit = '' }) {
    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, mb: '2px' }}>
                <span>{label}</span>
                <Box component="span" className="sb-mono" sx={{ color: colors.text2 }}>
                    {value}
                    {unit}
                </Box>
            </Box>
            <Slider value={value} min={min} max={max} step={1} onChange={(_, v) => onChange(v)} />
        </Box>
    );
}

/** Ingredient mixture picker for the meth table (client/hud.lua Meth, client/meth.lua). */
export default function MethDialog() {
    const { showing, config } = useSelector((s) => s.meth);
    const count = Number(config.ingredients) || 0;
    const maxCook = Number(config.cookTimeMax ?? config.maxCookTime) || 60;
    const [amounts, setAmounts] = useState(() => Array(8).fill(0));
    const [cookTime, setCookTime] = useState(1);

    const cancel = () => fetchNui('Meth:Cancel');
    const start = () =>
        fetchNui('Meth:Start', {
            tableId: config.tableId,
            ingredients: amounts.slice(0, count),
            cookTime,
        });

    useKey('Escape', cancel, { enabled: showing });

    return (
        <Dialog open={Boolean(showing)} onClose={cancel} fullWidth maxWidth="xs">
            <DialogTitle>Select ingredient mixture</DialogTitle>
            <DialogContent>
                <Stack spacing={1.5} sx={{ pt: 1 }}>
                    {Array.from({ length: count }, (_, i) => (
                        <LabeledSlider
                            key={i}
                            label={INGREDIENTS[i] ?? `Ingredient ${i + 1}`}
                            value={amounts[i]}
                            unit="%"
                            onChange={(v) => setAmounts((a) => a.map((x, j) => (j === i ? v : x)))}
                        />
                    ))}
                    <LabeledSlider label="Cook time" value={cookTime} min={1} max={maxCook} unit=" min" onChange={setCookTime} />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button tone="ghost" onClick={cancel}>
                    Cancel
                </Button>
                <Button tone="primary" icon="fire" onClick={start}>
                    Start cooking
                </Button>
            </DialogActions>
        </Dialog>
    );
}
