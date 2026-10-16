/**
 * Search lists keep their term and results while a record is open, so "Back"
 * returns to the same results. status: idle | loading | ready | error.
 */
const list = () => ({ term: '', status: 'idle', results: [], page: 1, pages: 1, searched: '' });

export const search = $state({
    people: list(),
    vehicles: list(),
    reports: { ...list(), type: 0 },
    warrants: list(),
    firearms: list(),
});

/** Clear every list in place (pages hold references to these objects). */
export function resetSearches() {
    Object.assign(search.people, list());
    Object.assign(search.vehicles, list());
    Object.assign(search.reports, list(), { type: 0 });
    Object.assign(search.warrants, list());
    Object.assign(search.firearms, list());
}
