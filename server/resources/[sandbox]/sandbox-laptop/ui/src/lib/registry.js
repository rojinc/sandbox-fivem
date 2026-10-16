/**
 * App name -> window body. Apps without a body (Interwebz and Files are
 * `fake` server-side; SupplyMate and Terminal are not in the server's app
 * list) show the "not available yet" page.
 */
import LsuApp from '../apps/lsu/LsuApp.svelte';
import TeamsApp from '../apps/teams/TeamsApp.svelte';
import BizWizApp from '../apps/bizwiz/BizWizApp.svelte';
import SettingsApp from '../apps/settings/SettingsApp.svelte';
import NotAvailableApp from '../components/common/NotAvailableApp.svelte';

const BODIES = {
    lsunderground: LsuApp,
    teams: TeamsApp,
    bizwiz: BizWizApp,
    settings: SettingsApp,
};

export function componentFor(name) {
    return BODIES[name] ?? NotAvailableApp;
}
