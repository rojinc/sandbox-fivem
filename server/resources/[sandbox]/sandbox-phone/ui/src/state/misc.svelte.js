/**
 * Smaller stores: QuickShare offers, Chatter groups, the Spammer feed and
 * race events. Each keeps the fields of the old reducer it replaces.
 */
export const share = $state({
    sharing: null, // { type: 'contacts' | 'documents', data }
    open: false,
});

export const chatter = $state({
    groups: [],
    invites: {},
    messages: {}, // { [groupId]: [{ group, author, message, timestamp }] } received while the app is open
});

export const twitter = $state({
    tweets: [],
    loaded: false,
});

export const race = $state({
    races: {},
    invites: [],
    inRace: false,
    creator: false,
    track: { show: false, dnf: false, lap: 0, totalLaps: 0, cp: 0, totalCheckpoints: 0, track: null, dnfTime: null },
});

export const pdRace = $state({
    races: {},
    inRace: false,
    creator: false,
});

export const music = $state({
    playing: null,
});

export function resetMisc() {
    share.sharing = null;
    share.open = false;
    chatter.groups = [];
    chatter.invites = {};
    chatter.messages = {};
    twitter.tweets = [];
    twitter.loaded = false;
    race.races = {};
    race.invites = [];
    race.inRace = false;
    race.creator = false;
    race.track = { show: false, dnf: false, lap: 0, totalLaps: 0, cp: 0, totalCheckpoints: 0, track: null, dnfTime: null };
    pdRace.races = {};
    pdRace.inRace = false;
    pdRace.creator = false;
    music.playing = null;
}
