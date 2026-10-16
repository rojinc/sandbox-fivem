/**
 * Lua -> UI routing. Every SendNUIMessage({ type, data }) listed in
 * CONTRACT.md lands here and mutates the rune state modules.
 */
import { onNui, fetchNui } from '@sandbox/ui-kit/nui';
import { phone, setPosition, setUnread, addUnread } from './state/phone.svelte.js';
import { setData, addData, updateData, removeData, resetData, data } from './state/data.svelte.js';
import { navigate, home } from './state/router.svelte.js';
import { addNotification, updateNotification, hideNotification, dismissAll, resetAlerts } from './state/notify.svelte.js';
import { setPending, setIncoming, setActive, endCall, resetCall } from './state/call.svelte.js';
import { setThreads, updateThreadIfExists, receivedMessage, resetMessages } from './state/messages.svelte.js';
import { share, chatter, twitter, race, pdRace, music, resetMisc } from './state/misc.svelte.js';
import { closeSheet } from './state/sheet.svelte.js';

const asList = (v) => (Array.isArray(v) ? v : Object.values(v ?? {})).filter(Boolean);

/** Old reducer timing: wait for the slide-out, reset the route, then let Lua re-open. */
const CLEAR_DELAY = 2000;
let clearTimer = null;

function clearHistory() {
    phone.visible = false;
    phone.moving = false;
    phone.clearing = true;
    clearTimeout(clearTimer);
    clearTimer = setTimeout(() => {
        home();
        closeSheet();
        phone.clearing = false;
        fetchNui('CDExpired');
    }, CLEAR_DELAY);
}

function open(limited) {
    clearTimeout(clearTimer);
    if (phone.clearing) {
        // Re-opened before the reset ran (Lua normally blocks this): finish it now.
        home();
        closeSheet();
        phone.clearing = false;
        fetchNui('CDExpired');
    }
    phone.limited = limited;
    phone.visible = true;
    if (limited) home();
}

export function installBridge() {
    /* ------------------------------------------------------ visibility */
    onNui('PHONE_VISIBLE', () => open(false));
    onNui('PHONE_VISIBLE_LIMITED', () => open(true));
    onNui('PHONE_NOT_VISIBLE', () => {
        // Sent on logout. The old reducer answered with ClosePhone so Lua drops focus and plays the put-away animation.
        const wasOpen = phone.visible;
        phone.visible = false;
        phone.limited = false;
        phone.moving = false;
        if (wasOpen) fetchNui('ClosePhone');
    });
    onNui('PHONE_NOT_VISIBLE_FORCED', () => {
        phone.visible = false;
        phone.limited = false;
        phone.moving = false;
    });
    onNui('CLEAR_HISTORY', clearHistory);
    onNui('ALERTS_RESET', resetAlerts);
    onNui('UI_RESET', () => {
        phone.visible = false;
        phone.limited = false;
        phone.moving = false;
        home();
        closeSheet();
        resetCall();
        resetMessages();
        resetAlerts();
        share.sharing = null;
        share.open = false;
    });

    /* ----------------------------------------------------------- shell */
    onNui('SET_APPS', (d) => {
        const apps = {};
        for (const [k, v] of Object.entries(d ?? {})) {
            if (v && typeof v === 'object') apps[v.name ?? k] = { ...v, name: v.name ?? k, unread: Number(v.unread) || 0 };
        }
        phone.apps = apps;
    });
    onNui('SET_TIME', (d = {}) => {
        if (d && typeof d === 'object') phone.time = { hour: Number(d.hour) || 0, minute: Number(d.minute) || 0 };
    });
    onNui('SET_POSITION', (d) => setPosition(d));
    onNui('SET_EXPANDED', (d = {}) => (phone.expanded = Boolean(d?.expanded)));
    onNui('LOAD_PERMS', (d) => (phone.permissions = d ?? null));
    onNui('ADD_UNREAD', (d = {}) => addUnread(d.name, d.count));
    onNui('SET_UNREAD', (d = {}) => setUnread(d.name, d.count));

    /* ------------------------------------------------------------ data */
    onNui('SET_DATA', (d = {}) => setData(d.type, d.data));
    onNui('ADD_DATA', (d = {}) => addData(d.type, d.data, d.key, d.first));
    onNui('UPDATE_DATA', (d = {}) => updateData(d.type, d.id, d.data, d.key));
    onNui('REMOVE_DATA', (d = {}) => removeData(d.type, d.id, d.key));
    onNui('RESET_DATA', () => {
        resetData();
        resetMisc();
        resetMessages();
    });

    /* --------------------------------------------------- notifications */
    onNui('NOTIF_ADD', (d = {}) => addNotification(d.notification));
    onNui('NOTIF_UPDATE', (d = {}) => updateNotification(d));
    onNui('NOTIF_HIDE', (d = {}) => hideNotification(d.id));
    onNui('NOTIF_DISMISS_ALL', dismissAll);

    /* ----------------------------------------------------------- share */
    onNui('RECEIVE_SHARE', (d) => {
        if (d && (d.type === 'contacts' || d.type === 'documents')) share.sharing = d;
    });

    /* ------------------------------------------------------------ call */
    onNui('SET_CALL_PENDING', (d = {}) => setPending(d.number));
    onNui('SET_CALL_INCOMING', (d = {}) => setIncoming(d.number, d.limited));
    onNui('SET_CALL_ACTIVE', setActive);
    onNui('END_CALL', endCall);

    /* -------------------------------------------------------- messages */
    onNui('SET_MESSAGE_THREADS', (d = {}) => setThreads(d.threads));
    onNui('UPDATE_THREAD_IF_EXISTS', (d = {}) => updateThreadIfExists(d.thread));
    onNui('RECEIVED_NEW_MESSAGE', (d) => receivedMessage(d));

    /* --------------------------------------------------------- chatter */
    onNui('CHATTER_SET_GROUPS', (d = {}) => (chatter.groups = asList(d.groups)));
    onNui('CHATTER_SET_INVITES', (d = {}) => (chatter.invites = d.invites && typeof d.invites === 'object' ? d.invites : {}));
    onNui('CHATTER_UPDATE_GROUP', (d = {}) => {
        const g = chatter.groups.find((x) => x.id == d.group?.id);
        if (g) Object.assign(g, d.group);
    });
    onNui('CHATTER_RECEIVED_MESSAGE', (d = {}) => {
        if (d.group === undefined) return;
        if (!chatter.messages[d.group]) chatter.messages[d.group] = [];
        chatter.messages[d.group].push(d);
        const g = chatter.groups.find((x) => x.id == d.group);
        if (g) g.last_message = d.timestamp;
    });
    onNui('CHATTER_RECEIVE_INVITE', (d = {}) => {
        if (d.invite?.group !== undefined) chatter.invites[d.invite.group] = d.invite;
    });
    onNui('CHATTER_CHANNEL_DELETED', (d = {}) => {
        chatter.groups = chatter.groups.filter((g) => g.id != d.group);
    });

    /* --------------------------------------------------------- spammer */
    onNui('RECEIVED_NEW_TWEET', (d) => {
        if (d && typeof d === 'object') twitter.tweets.unshift(d);
    });
    onNui('REMOVE_ACCOUNT_TWEETS', (d = {}) => {
        twitter.tweets = twitter.tweets.filter((t) => t.SID != d.account);
    });
    onNui('CLEAR_TWEETS', () => (twitter.tweets = []));

    /* ------------------------------------------------------- documents */
    onNui('DOCUMENTS_RECEIVED_SIGNATURE', (d = {}) => {
        const doc = asList(data.myDocuments).find((x) => x.id == d.id);
        if (!doc || !d.signature) return;
        const sigs = Array.isArray(doc.signatures) ? doc.signatures : [];
        const i = sigs.findIndex((s) => s.sid == d.signature.sid);
        if (i >= 0) sigs[i] = { ...sigs[i], ...d.signature };
        else sigs.push(d.signature);
        doc.signatures = sigs;
    });
    onNui('DOCUMENTS_DOCUMENT_DELETED', (d = {}) => removeData('myDocuments', d.id));

    /* ----------------------------------------------------------- music */
    onNui('MUSIC_END', () => (music.playing = null));

    /* --------------------------------------------------- redline races */
    onNui('EVENT_SPAWN', (d = {}) => (race.races = d.races && typeof d.races === 'object' ? d.races : {}));
    onNui('ADD_PENDING_RACE', (d = {}) => {
        if (d.race?.id !== undefined) race.races[d.race.id] = d.race;
    });
    onNui('CANCEL_RACE', (d = {}) => {
        delete race.races[d.race];
        if (d.myRace) race.inRace = false;
    });
    onNui('FINISH_RACE', (d = {}) => {
        if (d.id !== undefined) race.races[d.id] = d.race;
    });
    onNui('STATE_UPDATE', (d = {}) => {
        if (race.races[d.race]) race.races[d.race].state = d.state;
    });
    onNui('JOIN_RACE', (d = {}) => {
        const r = race.races[d.race];
        if (r) r.racers = { ...(r.racers ?? {}), [d.racer]: d.racerData ?? true };
    });
    onNui('LEAVE_RACE', (d = {}) => {
        const r = race.races[d.race];
        if (r?.racers) delete r.racers[d.racer];
    });
    onNui('I_RACE', (d = {}) => (race.inRace = Boolean(d.state)));
    onNui('NEW_INVITE', (d = {}) => {
        if (d.invite) race.invites.push(d.invite);
    });
    onNui('RACE_STATE_CHANGE', (d = {}) => (race.creator = Boolean(d.state)));
    onNui('DNF_START', (d = {}) => {
        race.track.dnf = true;
        race.track.dnfTime = d.time ?? null;
    });
    onNui('RACE_DNF', () => (race.track = { ...race.track, show: false, dnf: false }));
    onNui('RACE_START', (d = {}) => {
        race.track = { show: true, dnf: false, lap: 1, cp: 0, totalLaps: Number(d.totalLaps) || 0, totalCheckpoints: Number(d.totalCheckpoints) || 0, track: d.track ?? null, dnfTime: null };
    });
    onNui('RACE_LAP', () => (race.track.lap += 1));
    onNui('RACE_CP', (d = {}) => (race.track.cp = Number(d.cp) || 0));
    onNui('RACE_END', () => (race.track = { ...race.track, show: false, dnf: false }));

    /* ------------------------------------------- blueline police trials */
    onNui('PD_EVENT_SPAWN', (d = {}) => (pdRace.races = d.races && typeof d.races === 'object' ? d.races : {}));
    onNui('PD_ADD_PENDING_RACE', (d) => {
        if (d?.id !== undefined) pdRace.races[d.id] = d;
    });
    onNui('PD_CANCEL_RACE', (d = {}) => {
        delete pdRace.races[d.race];
        if (d.myRace) pdRace.inRace = false;
    });
    onNui('PD_FINISH_RACE', (d = {}) => {
        if (d.id !== undefined) pdRace.races[d.id] = d.race;
    });
    onNui('PD_STATE_UPDATE', (d = {}) => {
        if (pdRace.races[d.race]) pdRace.races[d.race].state = d.state;
    });
    onNui('PD_JOIN_RACE', (d = {}) => {
        const r = pdRace.races[d.race];
        if (r) r.racers = { ...(r.racers ?? {}), [d.racer]: true };
    });
    onNui('PD_LEAVE_RACE', (d = {}) => {
        const r = pdRace.races[d.race];
        if (r?.racers) delete r.racers[d.racer];
    });
    onNui('PD_I_RACE', (d = {}) => (pdRace.inRace = Boolean(d.state)));
    onNui('PD_RACE_STATE_CHANGE', (d = {}) => (pdRace.creator = Boolean(d.state)));

    /* ------------------------------------------------- UI-only (preview) */
    // Never sent by Lua: lets ui/preview scenarios open a screen. { path: '/apps/messages/convo/555-0100' }
    onNui('NAVIGATE', (d = {}) => {
        if (typeof d.path === 'string') navigate(d.path);
    });
}
