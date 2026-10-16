import React from 'react';
import { ComponentControl } from '../ped/ComponentControl.jsx';
import { PropControl } from '../ped/PropControl.jsx';

const PROP_SLOTS = ['hat', 'glass', 'ear', 'watch', 'bracelet'];
const MISC_SLOTS = ['mask', 'bag', 'accessory', 'badge'];

export function AccessoriesScreen({ section }) {
    if (section === 0) return PROP_SLOTS.map((n) => <PropControl key={n} name={n} />);
    return MISC_SLOTS.map((n) => <ComponentControl key={n} name={n} />);
}
