import { useKey, fetchNui } from '@sandbox/ui-kit';

/**
 * Escape closes the console through Lua ("Close" drops NUI focus and sends
 * APP_HIDE). While a dialog, menu or select popover is open, Escape belongs to
 * that overlay instead, so events coming from inside a MUI modal are ignored.
 */
export default function EscapeToClose({ enabled }) {
    useKey(
        'Escape',
        (e) => {
            if (e.target?.closest?.('.MuiModal-root')) return;
            fetchNui('Close');
        },
        { enabled },
    );
    return null;
}
