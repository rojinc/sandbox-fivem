/**
 * What each SET_STATE value opens: the eyebrow over the header, the price key
 * in SET_PRICING and the ordered list of sections in the side list.
 */
export const MODES = {
    CREATOR: {
        eyebrow: 'NEW CHARACTER',
        priceKey: 'CREATOR',
        canCancel: false,
        sections: ['heritage', 'features', 'skin', 'makeup', 'hair', 'brows', 'bodyhair', 'body', 'model', 'tops', 'legs', 'accessories', 'extras', 'tattoos'],
    },
    SHOP: {
        eyebrow: 'CLOTHING STORE',
        priceKey: 'SHOP',
        canCancel: true,
        sections: ['tops', 'legs', 'accessories', 'extras'],
    },
    BARBER: {
        eyebrow: 'BARBER',
        priceKey: 'BARBER',
        canCancel: true,
        sections: ['hair', 'brows', 'bodyhair', 'makeup'],
    },
    TATTOO: {
        eyebrow: 'TATTOO PARLOUR',
        priceKey: 'TATTOO',
        canCancel: true,
        sections: ['zone:ZONE_TORSO', 'zone:ZONE_HEAD', 'zone:ZONE_LEFT_ARM', 'zone:ZONE_RIGHT_ARM', 'zone:ZONE_LEFT_LEG', 'zone:ZONE_RIGHT_LEG'],
    },
    SURGERY: {
        eyebrow: 'SURGERY',
        priceKey: 'SURGERY',
        canCancel: true,
        sections: ['heritage', 'features', 'skin', 'makeup', 'hair', 'brows', 'bodyhair', 'body', 'model'],
    },
};

/** Tattoo zones (the `Zone` values in tattoos.lua). */
export const TATTOO_ZONES = [
    { zone: 'ZONE_TORSO', label: 'Torso' },
    { zone: 'ZONE_HEAD', label: 'Head' },
    { zone: 'ZONE_LEFT_ARM', label: 'Left arm' },
    { zone: 'ZONE_RIGHT_ARM', label: 'Right arm' },
    { zone: 'ZONE_LEFT_LEG', label: 'Left leg' },
    { zone: 'ZONE_RIGHT_LEG', label: 'Right leg' },
];

/** client/nui.lua keeps at most this many tattoo slots per character (old UI limit). */
export const MAX_TATTOOS = 25;

/**
 * Sections: `label` in the side list, `title` in the header, `group` for the
 * side-list headings (shown when a mode has many sections), `naked` forces the
 * undressed preview while the section is open.
 */
const BASE = {
    heritage: { label: 'Heritage', title: 'Heritage', group: 'Face' },
    features: { label: 'Features', title: 'Facial features', group: 'Face' },
    skin: { label: 'Skin', title: 'Skin', group: 'Face' },
    makeup: { label: 'Makeup', title: 'Makeup', group: 'Face' },
    hair: { label: 'Hair', title: 'Hair', group: 'Hair' },
    brows: { label: 'Brows and beard', title: 'Brows and beard', group: 'Hair' },
    bodyhair: { label: 'Body hair', title: 'Body hair', group: 'Hair' },
    body: { label: 'Body', title: 'Body', group: 'Body' },
    model: { label: 'Ped model', title: 'Ped model', group: 'Body' },
    tops: { label: 'Tops', title: 'Tops', group: 'Clothing' },
    legs: { label: 'Legs and feet', title: 'Legs and feet', group: 'Clothing' },
    accessories: { label: 'Accessories', title: 'Accessories', group: 'Clothing' },
    extras: { label: 'Masks and bags', title: 'Masks and bags', group: 'Clothing' },
    tattoos: { label: 'Tattoos', title: 'Tattoos', group: 'Tattoos', naked: true },
};

export function sectionDef(id) {
    if (id?.startsWith('zone:')) {
        const zone = id.slice(5);
        const z = TATTOO_ZONES.find((t) => t.zone === zone);
        return { id, label: z?.label ?? zone, title: `${z?.label ?? zone} tattoos`, group: 'Tattoos', naked: true, zone };
    }
    return BASE[id] ? { id, ...BASE[id] } : null;
}

/** Clothing slots (ped.customization.components.<key>). */
export const COMPONENTS = {
    torso2: 'Top',
    undershirt: 'Undershirt',
    kevlar: 'Vest',
    torso: 'Arms and gloves',
    leg: 'Trousers',
    shoes: 'Shoes',
    mask: 'Mask',
    bag: 'Bag',
    accessory: 'Neck',
    badge: 'Badge',
    hair: 'Hairstyle',
};

/** Prop slots (ped.customization.props.<key>). */
export const PROPS = {
    hat: 'Hat',
    glass: 'Glasses',
    ear: 'Earrings',
    watch: 'Watch',
    bracelet: 'Bracelet',
};

/** Readable names for the tattoo collections in tattoos.lua. */
const COLLECTIONS = {
    mpairraces_overlays: 'Air races',
    mpbeach_overlays: 'Beach',
    mpbiker_overlays: 'Biker',
    mpbusiness_overlays: 'Business',
    mpchristmas2017_overlays: 'Christmas 2017',
    mpchristmas2018_overlays: 'Christmas 2018',
    mpchristmas2_overlays: 'Christmas',
    mpgunrunning_overlays: 'Gunrunning',
    mphipster_overlays: 'Hipster',
    mpimportexport_overlays: 'Import and export',
    mplowrider2_overlays: 'Lowrider 2',
    mplowrider_overlays: 'Lowrider',
    mpluxe2_overlays: 'Luxe 2',
    mpluxe_overlays: 'Luxe',
    mpsmuggler_overlays: 'Smuggler',
    mpstunt_overlays: 'Stunt',
    multiplayer_overlays: 'Multiplayer',
    tatoo_overlays_sandbox: 'Sandbox',
};

export function collectionName(c) {
    if (!c) return 'Other';
    if (COLLECTIONS[c]) return COLLECTIONS[c];
    const s = String(c).replace(/^mp/, '').replace(/_?overlays_?/, ' ').replace(/_/g, ' ').trim();
    return s ? s[0].toUpperCase() + s.slice(1) : 'Other';
}

/** "TAT_AR_000" -> "AR 000"; free-form names ("dave_back") lose underscores. */
export function tattooName(name) {
    return String(name ?? '')
        .replace(/^TAT_/i, '')
        .replace(/_/g, ' ')
        .trim();
}

/** Camera views: index = the number the ChangeCamera callback takes (client/ped.lua _camOffsets). */
export const VIEW_FULL = 0;
export const CAMERA_VIEWS = [
    { view: 1, icon: 'user', label: 'Face' },
    { view: 2, icon: 'shirt', label: 'Upper body' },
    { view: 3, icon: 'shoe', label: 'Legs and feet' },
];
