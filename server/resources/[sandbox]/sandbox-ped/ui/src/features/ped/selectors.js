const EMPTY = [];

export const selectPed = (s) => s.ped.ped;
export const selectGender = (s) => s.ped.gender;
export const selectCustomization = (s) => s.ped.ped.customization;
export const selectTattoos = (s) => {
    const t = s.ped.ped.customization?.tattoos;
    return Array.isArray(t) ? t : EMPTY;
};

/** Lua stores features under numeric keys, which may arrive as an array or as string keys. */
export const getFeature = (features, index) => Number(features?.[index] ?? features?.[String(index)] ?? 0);
