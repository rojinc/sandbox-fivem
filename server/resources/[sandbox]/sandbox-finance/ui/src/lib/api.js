import { fetchNui } from '@sandbox/ui-kit/nui';

/** Every RegisterNUICallback in client/*.lua, with the exact body Lua reads. */
export const api = {
    /** Lua drops focus and answers APP_HIDE; nothing useful comes back, so a failure is ignored. */
    close: () => fetchNui('Close').catch(() => null),
    fetchAccounts: () => fetchNui('Bank:Fetch'),
    /** Only `personal_savings` is accepted server-side; `name` is read by Lua but ignored by the server. */
    register: (type = 'personal_savings', name) => fetchNui('Bank:Register', name ? { type, name } : { type }),
    addJoint: (account, target) => fetchNui('Bank:AddJoint', { account, target }),
    removeJoint: (account, target) => fetchNui('Bank:RemoveJoint', { account, target }),
    /** Server stub: always answers false. Kept so the contract stays complete; no screen calls it. */
    rename: (account, name) => fetchNui('Bank:Rename', { account, name }),
    deposit: (account, amount, comments) => fetchNui('Bank:Deposit', withComments({ account, amount }, comments)),
    withdraw: (account, amount, comments) => fetchNui('Bank:Withdraw', withComments({ account, amount }, comments)),
    /** `type` true = target is a State ID, false = target is an account number. */
    transfer: (account, type, target, amount, comments) =>
        fetchNui('Bank:Transfer', withComments({ account, type: Boolean(type), target, amount }, comments)),
    transactions: (account, offset, perPage) => fetchNui('Bank:GetTransactions', { account, offset, perPage }),
};

// An omitted `comments` reaches the server as nil -> "No Description".
function withComments(body, comments) {
    const text = String(comments ?? '').trim();
    return text ? { ...body, comments: text } : body;
}
