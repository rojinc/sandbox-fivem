/** Government badge / state ID card (MDT.Badges, MDT.Licenses) and the body camera overlay. */
export const overlays = $state({
    card: { showing: false, kind: 'badge', data: {} }, // kind: badge (SHOW_GOV_ID) | licence (SHOW_DRIVER_LICENSE)
    bodycam: false,
});

export function showCard(kind, data) {
    overlays.card = { showing: true, kind, data: data ?? {} };
}

export function hideCard(kind) {
    if (overlays.card.kind === kind) overlays.card.showing = false;
}
