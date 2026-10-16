/** Sound files Lua plays (sandbox-sounds); labels as the old settings app named them. */
export const RINGTONES = Array.from({ length: 16 }, (_, i) => ({ value: `ringtone${i + 1}.ogg`, label: `Ringtone ${i + 1}` }));
export const TEXTTONES = Array.from({ length: 4 }, (_, i) => ({ value: `text${i + 1}.ogg`, label: `Text tone ${i + 1}` }));

export function labelOf(list, value) {
    return list.find((o) => o.value === value)?.label ?? 'Not set';
}
