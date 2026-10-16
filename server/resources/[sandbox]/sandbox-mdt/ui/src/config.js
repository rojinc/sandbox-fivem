/**
 * Operator-editable links shown in the Document Library next to the
 * database-backed documents. These used to live in ui/.env
 * (REACT_POLICE_SOP, REACT_EMS_SOP, REACT_POLICE_COMMS, REACT_EMS_COMMS).
 * Edit the URLs here and rebuild the UI. Leave a link empty to hide it.
 * Links are opened in an <iframe>, so they must be reachable from the game
 * (PDFs work best).
 */
export const STATIC_LIBRARY = {
    police: [
        { label: 'Police SOP', link: 'https://sandboxrp.gg/files/pd_sop.pdf' },
        { label: 'Police Communication Guide', link: 'https://sandboxrp.gg/files/pd_communcation_guide.pdf' },
    ],
    ems: [
        { label: 'EMS SOP', link: 'https://sandboxrp.gg/files/ems_sop.pdf' },
        { label: 'EMS Communication Guide', link: '' },
    ],
    prison: [],
    government: [],
};

/** Window size of the terminal at 1920x1080 (px). */
export const WINDOW = { width: 1680, height: 940 };
