# sandbox-finance <-> NUI contract

Extracted from `client/*.lua`, which is the source of truth. The UI keeps every
message `type`, callback name and field name below exactly as written.

## Lua -> UI (`SendNUIMessage`)

| `type` | `data` | Sent from | Notes |
| --- | --- | --- | --- |
| `SET_APP` | `{ brand: "fleeca", app: "BANK" \| "ATM" }` | `client/client.lua` net event `Finance:Client:OpenUI` (`app = "BANK"`, after the branch keybind); `client/components/banking/atms.lua` event `Banking:Client:StartOpenATM` once the "Inserting Card" progress finishes uncancelled (`app = "ATM"`) | Lua calls `SetNuiFocus(true, true)` immediately before. `brand` is always `"fleeca"` today. |
| `APP_HIDE` | `{}` (from `UI:Client:Reset`) or no `data` at all (from `Close`) | `client/client.lua` `RegisterNUICallback("Close")` and net event `UI:Client:Reset` | Lua calls `SetNuiFocus(false, false)` immediately before. |
| `SET_DATA` | `{ type: "character", data: { ID, SID, First, Last, Cash } }` | `client/client.lua` on `Characters:Client:Spawn`, and on `Characters:Client:Updated` when `key == "Cash"` | Only `type = "character"` is ever sent. `Cash` is a number; `SID` a number. |

## UI -> Lua (`RegisterNUICallback`)

| Callback | Body fields Lua reads | Reply | Notes |
| --- | --- | --- | --- |
| `Close` | none | `{}` | Answers `{}` first (`client/client.lua`, added in the Svelte port so the fetch settles), then drops NUI focus and sends `APP_HIDE`. When the UI was opened as an ATM it also plays the 1.5 s "Removing Card" progress. The UI hides at once and never drops focus itself. |
| `Bank:Fetch` | none | `{ accounts: Account[] \| false }` | Wraps server callback `Banking:GetAccounts`. The `transactions` / `loans` / `credit` fields are commented out in `client/nui.lua` and are never returned. |
| `Bank:Register` | `type`, `name` | `Account \| false` | Only `type = "personal_savings"` is accepted server-side. |
| `Bank:AddJoint` | `account`, `target` (passed through `tonumber`) | insert id (truthy) \| `false` | Savings accounts, owner only, target may not be another character of the same user. |
| `Bank:RemoveJoint` | `account`, `target` (passed through `tonumber`) | query result (truthy) \| `false` | |
| `Bank:Rename` | `account`, `name` | `false` | Server stub: `Banking:RenameAccount` always replies `false`. |
| `Bank:Deposit` | `account`, `amount`, `comments` | `{ state: boolean, balance: number }` | `comments` becomes the transaction description (`"No Description"` when omitted). |
| `Bank:Withdraw` | `account`, `amount`, `comments` | `{ state: boolean, balance: number }` | Fails when `amount > Balance`. |
| `Bank:Transfer` | `account`, `type` (boolean: `true` = target is a State ID, `false` = target is an account number), `target`, `amount`, `comments` | `{ state: boolean, balance: nil }` | The server replies `cb(success2)` with a single value, so `balance` is never filled for transfers; the UI computes the new balance locally. |
| `Bank:GetTransactions` | `account`, `perPage`, `offset` (or `page`) | `{ data: Transaction[], pages: number, more: boolean } \| false` | Newest first. The Transactions tab pages with `offset` and `perPage = 15` (Previous / Next); the Accounts tab asks for `offset = 0, perPage = 5` for its recent activity. |

All callbacks are invoked with `fetchNui(name, body)` from `@sandbox/ui-kit`.

## Shapes (from `server/components/banking/*.lua`)

```
Account {
  Account: number                 // account number, also the id
  Balance: number                 // whole dollars
  Type: 'personal' | 'personal_savings' | 'organization'
  Owner: string                   // State ID as a string, or the job id for organisations
  Name: string                    // defaults to the account number
  Permissions: { MANAGE, BALANCE, WITHDRAW, DEPOSIT, TRANSACTIONS, BILL?: boolean }
  JointOwners?: (string|number)[] // personal_savings only; State IDs
}

Transaction {
  Type: 'deposit' | 'withdraw' | 'transfer' | 'paycheck' | 'bill' | 'fine' | 'fine_profit' | 'loan'
  Account: number
  Title: string
  Timestamp: number | string      // MySQL timestamp; oxmysql returns ms since epoch (seconds and ISO strings are also handled)
  Amount: number                  // negative = money leaving the account
  Description: string
}
```

Server-side rules the UI mirrors: deposits need `DEPOSIT` and cash on hand;
withdrawals and transfers need `WITHDRAW` and `amount <= Balance`; one
account action per 2 seconds per player (the UI applies a matching cooldown);
joint owners and renaming need `MANAGE` and account ownership.

After a deposit or withdrawal the UI patches the balance from the reply and
lowers the cash on hand optimistically (Lua follows with `SET_DATA`); it does
not refetch. After a transfer, a new savings account or a joint owner change
it refetches `Bank:Fetch` quietly. Deposits and withdrawals are made from the
Accounts tab (branch) and the Withdraw / Deposit screens (ATM, `comments`
omitted); transfers and account management exist only at the branch.

## UI-only message (previews)

| `type` | `data` | Notes |
| --- | --- | --- |
| `NAVIGATE` | `{ tab, transfer?, cash?, atm? }` | Never sent by Lua. Switches tab after `SET_APP` and optionally prefills a form once: `transfer: { from, mode: 'sid' \| 'account', target, amount, comments, submit }`, `cash: { account, amount, comments, submit: 'deposit' \| 'withdraw' }`, `atm: { amount, submit }`. Used by `ui/preview/*.json`. |

## Focus

Focus is owned by Lua. It is set with `SetNuiFocus(true, true)` before every
`SET_APP` and dropped with `SetNuiFocus(false, false)` before every
`APP_HIDE`. The UI closes only by calling `Close` (the Close / Remove card buttons and
Escape); while a confirm dialog is open, Escape closes the dialog first.

## Old UI behaviour that Lua never triggers (not ported)

- `APP_SHOW`, `RESET_DATA`, `ADD_DATA`, `UPDATE_DATA`, `REMOVE_DATA`, `CLOSE_UI`,
  `SELECT_ACCOUNT`: reducer cases only ever dispatched by the old UI itself.
- Brand logos for `maze`, `blaineco` and `ud`: Lua only sends `brand = "fleeca"`.
- Loan / credit score data: the `Loans:GetLoans` call in `client/nui.lua` is
  commented out and the old UI had no loan screen wired.
- `state.data.transactions` map filled from `Bank:Fetch`: the callback never
  returns transactions.
- `HashRouter`, `react-toastify`, draggable dialogs, the hidden-until-character
  gate: presentation details, replaced by kit primitives.
- `Bank:Rename`: kept in `src/lib/api.js` for completeness but no screen calls
  it, because the server stub always answers `false`.
