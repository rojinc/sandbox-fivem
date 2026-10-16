/**
 * The five values Lua sends in SET_STATE and what each screen offers.
 * Category order is the order of the rail; the first one opens by default.
 */
export const MODES = {
    CREATOR: {
        title: 'Character Creator',
        icon: 'user-pen',
        priceKey: 'CREATOR',
        canCancel: false,
        saveLabel: 'Create character',
        categories: ['face', 'body', 'hair', 'makeup', 'clothes', 'accessories', 'tattoos'],
    },
    SHOP: {
        title: 'Clothing Store',
        icon: 'shirt',
        priceKey: 'SHOP',
        canCancel: true,
        saveLabel: 'Buy',
        categories: ['clothes', 'accessories'],
    },
    BARBER: {
        title: 'Barber Shop',
        icon: 'scissors',
        priceKey: 'BARBER',
        canCancel: true,
        saveLabel: 'Pay',
        categories: ['hair', 'makeup'],
    },
    TATTOO: {
        title: 'Tattoo Parlor',
        icon: 'pen-nib',
        priceKey: 'TATTOO',
        canCancel: true,
        saveLabel: 'Pay',
        categories: ['tattoos'],
    },
    SURGERY: {
        title: 'Plastic Surgery',
        icon: 'user-doctor',
        priceKey: 'SURGERY',
        canCancel: true,
        saveLabel: 'Pay',
        categories: ['face', 'body', 'hair'],
    },
};

export const CATEGORIES = {
    face: { label: 'Face', icon: 'face-smile' },
    body: { label: 'Body', icon: 'child-reaching' },
    hair: { label: 'Hair', icon: 'scissors' },
    makeup: { label: 'Makeup', icon: 'paintbrush' },
    clothes: { label: 'Clothes', icon: 'shirt' },
    accessories: { label: 'Extras', icon: 'hat-cowboy' },
    tattoos: { label: 'Tattoos', icon: 'dragon' },
};

/** Camera views, index = the number sent to the ChangeCamera callback. */
export const CAMERA_VIEWS = [
    { icon: 'person', label: 'Full body' },
    { icon: 'face-smile', label: 'Face' },
    { icon: 'shirt', label: 'Torso' },
    { icon: 'shoe-prints', label: 'Legs' },
];
