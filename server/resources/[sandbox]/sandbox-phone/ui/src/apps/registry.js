/**
 * App name -> root component. Each receives { app, segs } where segs are the
 * path segments after /apps/<name>. Apps missing here show "not available yet".
 */
import PhoneApp from './phone/PhoneApp.svelte';
import ContactsApp from './contacts/ContactsApp.svelte';

export const REGISTRY = {
    phone: PhoneApp,
    contacts: ContactsApp,
};
