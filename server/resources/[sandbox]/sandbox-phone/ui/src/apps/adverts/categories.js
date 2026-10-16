/** Advert categories. `value` is what the old phone stored, so existing ads keep their categories. */
export const CATEGORIES = [
    { value: 'Services', label: 'Services' },
    { value: 'Want-To-Buy', label: 'Want to buy' },
    { value: 'Want-To-Sell', label: 'Want to sell' },
    { value: 'Help Wanted', label: 'Help wanted' },
];

export function categoryLabel(value) {
    return CATEGORIES.find((c) => c.value === value)?.label ?? value;
}
