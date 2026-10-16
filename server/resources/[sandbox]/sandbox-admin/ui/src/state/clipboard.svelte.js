/**
 * COPY { data: string } from Lua (Admin:CopyClipboard export, /cpcoords,
 * /cpproperty) and the console's own copy buttons share this path.
 */
import { copyToClipboard } from '../lib/clipboard.js';
import { toast } from './toasts.svelte.js';

export const clipboard = $state({ last: '', count: 0 });

/** `what` names the value for the confirmation ("account ID"); Lua copies stay silent, Lua notifies itself. */
export function copyText(value, what) {
    const text = String(value ?? '');
    if (!text) return false;
    const ok = copyToClipboard(text);
    clipboard.last = text;
    clipboard.count += 1;
    if (what) toast(ok ? 'success' : 'error', ok ? `Copied ${what}` : 'Your clipboard is not available. Select the text and copy it by hand.');
    return ok;
}
