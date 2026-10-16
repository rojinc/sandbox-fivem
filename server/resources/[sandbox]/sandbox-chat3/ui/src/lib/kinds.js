/**
 * Presentation of the sandbox message kinds (`message.type`, see
 * server/component.lua CHAT.Send.*): the Tag tone for the channel label and
 * whether the body may carry HTML. server/system/broadcast/dispatch/tests
 * were rendered as HTML by the old UI, the rest as plain text. Unknown kinds
 * fall back to a neutral tag made from the type.
 */
export const KINDS = {
    ooc: { label: 'OOC', tone: 'default', solid: false, html: false },
    server: { label: 'Server', tone: 'error', solid: false, html: true },
    system: { label: 'System', tone: 'action', solid: false, html: true },
    broadcast: { label: 'Broadcast', tone: 'warning', solid: true, html: true },
    911: { label: '911', tone: 'error', solid: true, html: false },
    311: { label: '311', tone: 'info', solid: false, html: false },
    411: { label: '411', tone: 'success', solid: true, html: false },
    '411A': { label: '411-A', tone: 'success', solid: false, html: false },
    dispatch: { label: 'Dispatch', tone: 'warning', solid: false, html: true },
    tests: { label: 'Test results', tone: 'info', solid: false, html: true },
};

export function kindOf(type) {
    if (type !== undefined && type !== null && KINDS[type]) return KINDS[type];
    return { label: String(type ?? 'Chat'), tone: 'default', solid: false, html: false };
}
