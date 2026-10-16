import { FaceScreen } from './FaceScreen.jsx';
import { BodyScreen } from './BodyScreen.jsx';
import { HairScreen } from './HairScreen.jsx';
import { MakeupScreen } from './MakeupScreen.jsx';
import { ClothesScreen } from './ClothesScreen.jsx';
import { AccessoriesScreen } from './AccessoriesScreen.jsx';
import { TattooScreen } from './TattooScreen.jsx';
import { TATTOO_ZONES } from '../../data/tattooZones.js';

/** Category -> screen component and its sub-sections (tabs), if any. */
export const SCREENS = {
    face: { Component: FaceScreen, sections: () => ['Shape', 'Features', 'Skin'] },
    body: { Component: BodyScreen, sections: () => ['Arms', 'Skin', 'Model'] },
    hair: { Component: HairScreen, sections: () => ['Head', 'Face', 'Body'] },
    makeup: { Component: MakeupScreen, sections: null },
    clothes: { Component: ClothesScreen, sections: null },
    accessories: { Component: AccessoriesScreen, sections: () => ['Props', 'Misc'] },
    tattoos: { Component: TattooScreen, sections: () => TATTOO_ZONES.map((z) => z.short) },
};
