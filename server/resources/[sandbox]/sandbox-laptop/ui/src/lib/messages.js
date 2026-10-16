/**
 * Server answers carry Title Case messages ("Not Enough Crypto!"). Known ones
 * are rewritten as plain sentences that say what to do; unknown ones are
 * put in sentence case.
 */
import { sentence } from './format.js';

const KNOWN = {
    'cannot join queue right now...': 'The queue is closed right now. Try again later.',
    "can't join queue - some team members have insufficient reputation": 'Someone in your team does not have Chopping rank 5 yet, so your team cannot join the queue.',
    'not enough crypto!': 'You do not have enough crypto for the buy-in. Add $VRM to your wallet and try again.',
    'not enough team members!': 'You need a team of 2 or more to start a contract. Invite someone in Teams.',
    "invalid vehicle (doesn't exist)": 'That vehicle model does not exist. Check the spawn name and try again.',
    'name already taken': 'That team name is taken. Choose another name.',
    'could not find state id': 'Nobody with that State ID is in the city. Check the number.',
    "person doesn't qualify for loan": 'The buyer does not qualify for a loan. Offer a cash sale instead.',
    'property already being sold': 'Someone is already selling this property. Wait for that offer to end.',
};

export function serverMessage(message, fallback) {
    if (typeof message !== 'string' || !message.trim()) return fallback;
    return KNOWN[message.trim().toLowerCase()] ?? sentence(message.trim());
}
