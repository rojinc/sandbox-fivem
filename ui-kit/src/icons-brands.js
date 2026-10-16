import { library } from '@fortawesome/fontawesome-svg-core';
import { fab } from '@fortawesome/free-brands-svg-icons';

let registered = false;

/** Opt-in: brand logos (social apps on the phone, etc.). ~700 KB raw. */
export function registerBrandIcons() {
    if (registered) return;
    library.add(fab);
    registered = true;
}
