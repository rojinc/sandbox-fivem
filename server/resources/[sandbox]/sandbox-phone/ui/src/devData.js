/**
 * Sample data for `npm run dev` in a browser (and the source of the preview
 * scenarios). The game never loads this file's data; Lua sends the real thing.
 */
import { mockNui } from '@sandbox/ui-kit/nui';

const now = Math.floor(Date.now() / 1000);

const app = (name, label, icon, color, extra = {}) => ({ name, label, storeLabel: label, icon, color, canUninstall: true, store: true, hidden: false, unread: 0, params: '', ...extra });

export const APPS = {
    phone: app('phone', 'Phone', 'phone', '#21a500', { canUninstall: false }),
    messages: app('messages', 'Messages', 'comment', '#ff0000', { canUninstall: false, unread: 2 }),
    contacts: app('contacts', 'Contacts', 'address-book', '#ff6a00', { canUninstall: false }),
    store: app('store', 'App Store', 'hippo', '#ad8d1a', { canUninstall: false }),
    settings: app('settings', 'Settings', 'gear', '#18191e', { canUninstall: false }),
    email: app('email', 'Email', 'envelope', '#10909c', { canUninstall: false, unread: 1 }),
    bank: app('bank', 'Fleeca', 'bank', '#268f3a'),
    loans: app('loans', 'Loans', ['far', 'money-check-dollar'], '#30a60f'),
    twitter: app('twitter', 'Spammer', ['far', 'face-awesome'], '#c4b404'),
    chatter: app('chatter', 'Chatter', ['fab', 'rocketchat'], '#2d2835'),
    adverts: app('adverts', 'Ads', ['fab', 'adversal'], '#870b30'),
    documents: app('documents', 'Documents', 'file-lines', '#820366'),
    garage: app('garage', 'Garage', 'car-garage', '#50ba13'),
    comanager: app('comanager', 'BizWiz', 'briefcase', '#db5004', { canUninstall: false, store: false }),
    labor: app('labor', 'Jobs', ['fad', 'pickaxe'], '#05737d'),
    crypto: app('crypto', 'DigiDollar', ['far', 'circle-dollar'], '#354f34'),
    homemanage: app('homemanage', 'Properties', 'house-signal', '#362a4f'),
    pingem: app('pingem', 'FINDR', 'map-pin', '#e3db02'),
    calculator: app('calculator', 'Calculator', 'calculator-simple', '#E95200'),
    services: app('services', 'Services', 'clipboard-list', '#E95200'),
    media: app('media', 'Media', 'photo-film', '#59E5F7'),
    music: app('music', 'Music', 'cloud-music', '#63e6be'),
    redline: app('redline', 'Redline', ['far', 'gauge-simple-high'], '#9d1614', { restricted: { state: 'RACE_DONGLE' } }),
    chopper: app('chopper', 'Chopper', 'axe', '#8800c7', { restricted: { state: 'ACCESS_CHOPPER' } }),
};

export const PLAYER = {
    Source: 12,
    SID: 4021,
    User: 'b7f2c19a',
    First: 'Mara',
    Last: 'Kovac',
    Phone: '555-201-4477',
    Mugshot: '',
    PhoneCase: 'default',
    States: ['PHONE', 'PHONE_VPN'],
    Jobs: [{ Id: 'police', Name: 'Police', Workplace: { Id: 'lspd', Name: 'Los Santos Police Department' }, Grade: { Id: 'officer', Name: 'Officer' } }],
    Licenses: { Drivers: { Active: true, Points: 2 }, Weapons: { Active: false }, Hunting: { Active: true }, Fishing: { Active: false, Suspended: true } },
    Alias: { email: 'mara.kovac@sandbox.rp', chatter: 'mkovac' },
    Profiles: { twitter: { name: 'marak', picture: '' } },
    Apps: {
        installed: ['phone', 'messages', 'contacts', 'store', 'settings', 'email', 'bank', 'loans', 'twitter', 'chatter', 'adverts', 'documents', 'garage', 'comanager', 'labor', 'crypto', 'homemanage', 'calculator', 'services', 'music'],
        home: ['email', 'bank', 'adverts', 'documents', 'garage', 'twitter', 'chatter', 'loans', 'labor', 'crypto', 'homemanage', 'calculator', 'services', 'music', 'store', 'settings', 'comanager'],
        dock: ['phone', 'messages', 'contacts'],
    },
    PhoneSettings: {
        wallpaper: 'wallpaper8',
        ringtone: 'ringtone1.ogg',
        texttone: 'text1.ogg',
        colors: { accent: '#1a7cc1' },
        zoom: 75,
        volume: 80,
        notifications: true,
        appNotifications: { twitter: true },
    },
    PhonePermissions: { redline: { create: false } },
    Reputations: {},
};

export const CONTACTS = [
    { id: 1, name: 'Dex Morrow', number: '555-301-8820', avatar: '', color: '#1a7cc1', favorite: true },
    { id: 2, name: 'Priya Natarajan', number: '555-118-0042', avatar: '', color: '#268f3a', favorite: true },
    { id: 3, name: 'Ash Calloway', number: '555-640-2291', avatar: '', color: '#870b30', favorite: false },
    { id: 4, name: 'Bennys Original Motorworks', number: '555-900-1200', avatar: '', color: '#db5004', favorite: false },
    { id: 5, name: 'Jonah Whitlock', number: '555-772-3008', avatar: '', color: '#362a4f', favorite: false },
    { id: 6, name: 'Lucia Ferrante', number: '555-482-7316', avatar: '', color: '#10909c', favorite: false },
    { id: 7, name: 'Tow yard', number: '555-010-4545', avatar: '', color: '#50ba13', favorite: false },
];

export const CALLS = [
    { id: 11, owner: PLAYER.Phone, number: '555-301-8820', time: now - 600, duration: 184, method: true, limited: false, anonymous: false, unread: false },
    { id: 12, owner: PLAYER.Phone, number: '555-640-2291', time: now - 3600, duration: -1, method: false, limited: false, anonymous: false, unread: true },
    { id: 13, owner: PLAYER.Phone, number: '555-888-0199', time: now - 7200, duration: 42, method: false, limited: false, anonymous: false, unread: false },
    { id: 14, owner: PLAYER.Phone, number: '555-000-0000', time: now - 86400, duration: -1, method: false, limited: true, anonymous: true, unread: false },
    { id: 15, owner: PLAYER.Phone, number: '555-118-0042', time: now - 90000, duration: -1, method: true, limited: false, anonymous: false, unread: false },
];

/** The messages Lua sends at spawn, in order. */
export const messages = [
    { type: 'SET_APPS', data: APPS },
    { type: 'SET_TIME', data: { hour: 14, minute: 5 } },
    { type: 'SET_POSITION', data: { x: 1000, y: 250 } },
    { type: 'SET_DATA', data: { type: 'player', data: PLAYER } },
    { type: 'SET_DATA', data: { type: 'contacts', data: CONTACTS } },
    { type: 'SET_DATA', data: { type: 'calls', data: CALLS } },
    { type: 'PHONE_VISIBLE', data: {} },
];

export function installMocks() {
    mockNui('CreateCall', true);
    mockNui('CreateContact', 99);
    mockNui('UpdateContact', true);
    mockNui('DeleteContact', true);
}
