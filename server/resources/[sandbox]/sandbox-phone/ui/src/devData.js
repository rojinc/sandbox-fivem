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

export const THREADS = [
    { id: 301, owner: PLAYER.Phone, number: '555-301-8820', method: 0, time: now - 240, count: 6, message: 'Meet at the pier at 9? Bring the paperwork.', unread: 1 },
    { id: 302, owner: PLAYER.Phone, number: '555-118-0042', method: 1, time: now - 5400, count: 2, message: 'Thanks, see you tomorrow', unread: 0 },
    { id: 303, owner: PLAYER.Phone, number: '555-888-0199', method: 0, time: now - 172800, count: 1, message: 'Your vehicle is ready for pickup at Bennys.', unread: 0 },
];

export const TEXTS = [
    { id: 6, owner: PLAYER.Phone, number: '555-301-8820', method: 0, time: now - 240, message: 'Meet at the pier at 9? Bring the paperwork.' },
    { id: 5, owner: PLAYER.Phone, number: '555-301-8820', method: 1, time: now - 600, message: 'Sure. Which pier, Del Perro or Vespucci?' },
    { id: 4, owner: PLAYER.Phone, number: '555-301-8820', method: 0, time: now - 660, message: 'Can we go over the contract tonight?' },
    { id: 3, owner: PLAYER.Phone, number: '555-301-8820', method: 0, time: now - 90000, message: 'The quote is here: https://docs.sandbox.rp/quote/4471' },
    { id: 2, owner: PLAYER.Phone, number: '555-301-8820', method: 1, time: now - 90600, message: 'Got it. I will send the quote in the morning.' },
    { id: 1, owner: PLAYER.Phone, number: '555-301-8820', method: 0, time: now - 91000, message: 'Hey, it is Dex from the garage.' },
];

export const EMAILS = [
    { id: 41, owner: PLAYER.SID, sender: 'loans@dynasty8.com', subject: 'Your loan offer for 0112 Vespucci Canals', body: '<p>Mara Kovac,</p><p>Your down payment of <b>$45,000</b> (20%) is due today. The remaining $180,000 is paid over 12 weeks at $15,000 a week.</p><p>Accept this offer within 5 minutes.</p>', time: now - 120, unread: true, flags: { hyperlink: { event: 'RealEstate:Server:AcceptLoan' } }, expires: now + 280 },
    { id: 40, owner: PLAYER.SID, sender: 'dispatch@lspd.gov', subject: 'Shift roster for this week', body: '<p>You are rostered for day shifts Monday to Thursday.</p>', time: now - 7200, unread: true },
    { id: 39, owner: PLAYER.SID, sender: 'jobs@sandbox.rp', subject: 'Pickup point for your delivery', body: '<p>Collect the packages from the warehouse at the docks.</p>', time: now - 86400 * 2, unread: false, flags: { location: { x: 1200.5, y: -3100.2, z: 5.9 } } },
];

export const ADVERTS = {
    0: {},
    12: { id: 12, author: 'Mara Kovac', number: PLAYER.Phone, time: Date.now() - 45 * 60000, title: 'Selling a Sultan RS, low miles', price: '68000', categories: ['Want-To-Sell'], full: '<p>Sultan RS in white. 4,200 miles, full service history, new tyres.</p><p>Test drives at Legion Square after 6pm.</p>' },
    31: { id: 31, author: 'Dex Morrow', number: '555-301-8820', time: Date.now() - 5 * 60000, title: 'Mechanic available tonight', price: '', categories: ['Services'], full: '<p>Mobile repairs anywhere in the city. Call or text.</p>' },
    44: { id: 44, author: 'Priya Natarajan', number: '555-118-0042', time: Date.now() - 20 * 60000, title: 'Hiring two cooks at Bean Machine', price: '', categories: ['Help Wanted'], full: '<p>Weekend shifts. Paid weekly.</p>' },
    52: { id: 52, author: 'Jonah Whitlock', number: '555-772-3008', time: Date.now() - 90 * 60000, title: 'Buying fishing rods in bulk', price: '150', categories: ['Want-To-Buy'], full: '<p>Paying $150 each for up to 20 rods.</p>' },
};

export const DOCUMENTS = [
    { id: 71, sid: PLAYER.SID, time: now - 3600, title: 'Vehicle sale agreement', content: '<p>Mara Kovac sells one Sultan RS (plate 46KJL201) to Dex Morrow for $68,000.</p><p>Payment in full on handover.</p>', signature_required: false },
    { id: 72, sid: 5110, time: now - 600, title: 'Tenancy agreement, Apartment 4B', content: '<p>The tenant agrees to pay $2,500 each week, in advance.</p>', sharer: 5110, sharer_name: 'Lucia Ferrante', shared_date: now - 600, signature_required: true, signed: null },
];

export const VEHICLES = [
    { VIN: '1HGBH41JXMN109186', Make: 'Karin', Model: 'Sultan RS', RegisteredPlate: '46KJL201', Spawned: false, Storage: { Type: 1, Id: 'legion' }, Mileage: 4210.4, Damage: { Body: 980, Engine: 950 }, DamagedParts: { Clutch: 92, Brakes: 64 } },
    { VIN: '2T1BURHE0JC034461', Make: 'Vapid', Model: 'Speedo', RegisteredPlate: '83PDV114', Spawned: true, Storage: { Type: 1, Id: 'pillbox' }, Mileage: 18044, Damage: { Body: 720, Engine: 610 } },
    { VIN: '3VWFE21C04M000001', Make: 'Bravado', Model: 'Buffalo', RegisteredPlate: '09MRA552', Spawned: false, Storage: { Type: 0, Fine: 750, TimeHold: { ExpiresAt: now + 3600 } }, Mileage: 30500, Damage: { Body: 300, Engine: 480 } },
];

export const GARAGES = { impound: { label: 'Davis impound lot' }, legion: { label: 'Legion Square garage' }, pillbox: { label: 'Pillbox Hill garage' } };

export const BANK = {
    accounts: [
        { Account: 100482, Type: 'personal', Name: 'Mara Kovac', Balance: 18250.5, Permissions: { BALANCE: true, WITHDRAW: true, TRANSACTIONS: true, BILL: false } },
        { Account: 100483, Type: 'personal_savings', Name: 'Savings', Balance: 92000, Permissions: { BALANCE: true, WITHDRAW: true, TRANSACTIONS: true, BILL: false } },
        { Account: 200117, Type: 'organization', Name: 'Kovac Motors', Balance: 340120, Permissions: { BALANCE: true, WITHDRAW: true, TRANSACTIONS: true, BILL: true } },
    ],
    pendingBills: [{ Id: 9, Name: 'Pillbox Medical', Description: 'Treatment on 15 October', Amount: 1500, Timestamp: now - 1800 }],
};

export const TRANSACTIONS = {
    data: [
        { Id: 1, Title: 'Transfer from Dex Morrow', Description: 'Parts for the Sultan', Amount: 2400, Timestamp: (now - 3600) * 1000 },
        { Id: 2, Title: 'Bean Machine', Description: 'Card payment', Amount: -18.5, Timestamp: (now - 7200) * 1000 },
        { Id: 3, Title: 'LSPD wages', Description: 'Weekly pay', Amount: 3850, Timestamp: (now - 86400) * 1000 },
        { Id: 4, Title: 'Fuel, Xero Gas', Description: 'Card payment', Amount: -96.2, Timestamp: (now - 90000) * 1000 },
    ],
    more: false,
};

export const TWEETS = [
    { id: 3, time: now - 300, source: 31, SID: 5001, author: { name: 'dexfixes', picture: '' }, content: 'Mobile mechanic out tonight in Vespucci. Text 555-301-8820.', image: { using: false }, likes: [], verified: false },
    { id: 2, time: now - 1500, source: -1, SID: -1, author: { name: 'CityOfLosSantos', picture: '' }, content: 'Roadworks on Del Perro Freeway until 6pm. Use Bay City Avenue instead.', image: { using: false }, likes: [], verified: true },
    { id: 1, time: now - 4000, source: 44, SID: 5110, author: { name: 'luciaf', picture: '' }, content: 'Anyone seen a lost grey cat near Mirror Park? Answers to Pepper.', image: { using: false }, likes: [] },
];

export const CHATTER_GROUPS = [
    { id: 5, label: 'Night shift', icon: null, owner: PLAYER.SID, joined_date: now - 86400 * 3, last_message: now - 900 },
    { id: 8, label: 'Car meet Sunday', icon: null, owner: 5001, joined_date: now - 86400, last_message: now - 7200 },
];

export const CHATTER_MESSAGES = [
    { id: 33, message: 'Anyone covering the 10pm?', timestamp: now - 900, author: 5001 },
    { id: 32, message: 'I can take it if someone swaps Thursday.', timestamp: now - 1200, author: PLAYER.SID },
    { id: 31, message: 'Roster is up on the board.', timestamp: now - 4000, author: 5110 },
];

export const LABOR = {
    jobs: {
        Mining: { Id: 'Mining', Name: 'Mining', Salary: 450, Limit: 10, OnDuty: [{ Joiner: 31 }] },
        Garbage: { Id: 'Garbage', Name: 'Garbage collection', Salary: 380, Limit: 6, OnDuty: [] },
        Salvaging: { Id: 'Salvaging', Name: 'Salvaging', Salary: 0, Limit: 0, OnDuty: [] },
    },
    groups: [{ Creator: { ID: 31, SID: 5001, First: 'Dex', Last: 'Morrow' }, Members: [{ ID: 44, SID: 5110, First: 'Lucia', Last: 'Ferrante' }], Working: false }],
    reputations: [{ id: 'Mining', label: 'Mining', value: 1400, current: { label: 'Rank 2', value: 1000 }, next: { label: 'Rank 3', value: 2500 } }],
};

export const COINS = [
    { Name: 'Vroom', Short: 'VRM', Price: 120, Buyable: true, Sellable: true },
    { Name: 'Meme coin', Short: 'MEME', Price: 4, Buyable: true, Sellable: 3 },
];

export const LOANS = {
    creditScore: 612,
    loans: [{ _id: 'l1', Type: 'vehicle', AssetIdentifier: '1HGBH41JXMN109186', Total: 68000, DownPayment: 13600, Paid: 20400, Remaining: 47600, InterestRate: 10, TotalPayments: 10, PaidPayments: 3, MissedPayments: 1, MissablePayments: 3, NextPayment: (now + 86400 * 2) * 1000, Defaulted: false }],
};

/** The messages Lua sends at spawn, in order. */
export const messages = [
    { type: 'SET_APPS', data: APPS },
    { type: 'SET_TIME', data: { hour: 14, minute: 5 } },
    { type: 'SET_POSITION', data: { x: 1000, y: 250 } },
    { type: 'SET_DATA', data: { type: 'player', data: PLAYER } },
    { type: 'SET_DATA', data: { type: 'contacts', data: CONTACTS } },
    { type: 'SET_DATA', data: { type: 'calls', data: CALLS } },
    { type: 'SET_DATA', data: { type: 'emails', data: EMAILS } },
    { type: 'SET_DATA', data: { type: 'adverts', data: ADVERTS } },
    { type: 'SET_DATA', data: { type: 'myDocuments', data: DOCUMENTS } },
    { type: 'SET_DATA', data: { type: 'garages', data: GARAGES } },
    { type: 'CHATTER_SET_GROUPS', data: { groups: CHATTER_GROUPS } },
    { type: 'CHATTER_SET_INVITES', data: { invites: { 9: { group: 9, label: 'Fishing club', sender: 5110, timestamp: now - 600 } } } },
    { type: 'PHONE_VISIBLE', data: {} },
];

export function installMocks() {
    mockNui('CreateCall', true);
    mockNui('CreateContact', 99);
    mockNui('UpdateContact', true);
    mockNui('DeleteContact', true);
    mockNui('Messages:InitLoad', () => {
        window.dispatchEvent(new MessageEvent('message', { data: { type: 'SET_MESSAGE_THREADS', data: { threads: THREADS } } }));
        return true;
    });
    mockNui('Messages:LoadTexts', ({ offset }) => (offset ? [] : TEXTS));
    mockNui('SendMessage', () => Math.floor(Math.random() * 1e6));
    mockNui('Garage:GetCars', VEHICLES);
    mockNui('Garage:TrackVehicle', true);
    mockNui('Banking:GetData', BANK);
    mockNui('Banking:GetTransactions', TRANSACTIONS);
    mockNui('Documents:GetSignatures', []);
    mockNui('GetLaborDetails', LABOR);
    mockNui('GetCryptoCoins', COINS);
    mockNui('Loans:GetData', LOANS);
    mockNui('Twitter:GetCount', TWEETS.length);
    mockNui('Twitter:GetTweets', TWEETS);
    mockNui('Chatter:GetMessageCount', CHATTER_MESSAGES.length);
    mockNui('Chatter:LoadMessages', ({ offset }) => (offset ? [] : CHATTER_MESSAGES));
}
