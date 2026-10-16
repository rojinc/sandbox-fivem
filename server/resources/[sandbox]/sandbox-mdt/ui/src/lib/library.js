/**
 * Operator-editable links shown in the Library next to the database-backed
 * documents (these used to live in ui/.env as REACT_POLICE_SOP and friends).
 * Edit the URLs and rebuild. Leave a link empty to hide it. Documents open in
 * an iframe, so they must be reachable from the game (PDFs work best).
 */
export const STATIC_LIBRARY = {
    police: [
        { label: 'Police standard operating procedures', link: 'https://sandboxrp.gg/files/pd_sop.pdf' },
        { label: 'Police communication guide', link: 'https://sandboxrp.gg/files/pd_communcation_guide.pdf' },
    ],
    ems: [
        { label: 'EMS standard operating procedures', link: 'https://sandboxrp.gg/files/ems_sop.pdf' },
        { label: 'EMS communication guide', link: '' },
    ],
    prison: [],
    government: [],
};
