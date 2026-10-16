import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectClipboard } from '../../features/clipboard/reducer.js';
import { copyToClipboard } from '../../lib/nui.js';

/** Performs the copy requested by a COPY message (the reducer only records it). */
export default function ClipboardBridge() {
    const { text, seq } = useSelector(selectClipboard);
    useEffect(() => {
        if (seq > 0) copyToClipboard(text);
    }, [seq, text]);
    return null;
}
