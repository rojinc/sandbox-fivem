import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { fetchNui } from '@sandbox/ui-kit';
import { StepButton } from './StepButton.jsx';
import { LiveSlider } from './LiveSlider.jsx';

/**
 * Label + −/+ stepper with the current value, and a slider beneath when the
 * range is known. `max` may be null while the game has not reported a range
 * yet: the stepper then counts freely upwards.
 *
 * @param {object} p
 * @param {(v:number)=>string} [p.display]  how to print the value (default: the number)
 * @param {React.ReactNode} [p.caption]     small text under the label ("7 of 93")
 * @param {React.ReactNode} [p.leading]     node before the label (e.g. a colour chip)
 */
export function StepperRow({
    label,
    value,
    min = 0,
    max,
    onChange,
    display,
    caption,
    leading,
    disabled = false,
    loop = true,
    slider = true,
    valueWidth = 44,
}) {
    const known = typeof max === 'number' && Number.isFinite(max) && max >= min;
    const current = typeof value === 'number' ? value : min;

    const step = (dir) => {
        if (disabled) return;
        let next = current + dir;
        if (known) {
            if (next > max) next = loop ? min : max;
            if (next < min) next = loop ? max : min;
        } else if (next < min) {
            next = min;
        }
        if (next === current) return;
        fetchNui('FrontEndSound', { sound: 'UPDOWN' });
        onChange(next);
    };

    const textColor = disabled ? 'var(--sb-text-3)' : 'var(--sb-text)';

    return (
        <Box sx={{ opacity: disabled ? 0.55 : 1, transition: 'opacity var(--sb-dur-fast) var(--sb-ease)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minHeight: 32 }}>
                {leading}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" className="sb-truncate" sx={{ color: textColor, fontWeight: 500, lineHeight: 1.3 }}>
                        {label}
                    </Typography>
                    {caption && (
                        <Typography variant="caption" className="sb-truncate" sx={{ display: 'block', lineHeight: 1.3 }}>
                            {caption}
                        </Typography>
                    )}
                </Box>
                <StepButton icon="minus" label={`${label}: previous`} disabled={disabled} onClick={() => step(-1)} />
                <Typography
                    component="span"
                    className="sb-mono"
                    sx={{ minWidth: valueWidth, textAlign: 'center', fontSize: 13, fontWeight: 600, color: textColor }}
                >
                    {display ? display(current) : current}
                </Typography>
                <StepButton icon="plus" label={`${label}: next`} disabled={disabled} onClick={() => step(1)} />
            </Box>
            {slider && known && max > min && (
                <LiveSlider value={current} min={min} max={max} onChange={onChange} disabled={disabled} sx={{ mt: 0.25 }} />
            )}
        </Box>
    );
}
