/**
 * COPY { data: string } — Lua asks the page to put text on the clipboard
 * (Admin:CopyClipboard / "cpcoords" / "cpproperty"). The reducer only records
 * the request; <ClipboardBridge> performs the copy (no side effects in reducers).
 */
export const initialState = { text: '', seq: 0 };

export default function clipboardReducer(state = initialState, action) {
    if (action.type === 'COPY') {
        return { text: String(action.payload?.data ?? ''), seq: state.seq + 1 };
    }
    return state;
}

export const selectClipboard = (state) => state.clipboard;
