/**
 * App name -> root component. Each receives { app, segs } where segs are the
 * path segments after /apps/<name>. Apps missing here show "not available yet".
 */
import PhoneApp from './phone/PhoneApp.svelte';
import ContactsApp from './contacts/ContactsApp.svelte';
import MessagesApp from './messages/MessagesApp.svelte';
import SettingsApp from './settings/SettingsApp.svelte';
import EmailApp from './email/EmailApp.svelte';
import AdvertsApp from './adverts/AdvertsApp.svelte';
import DocumentsApp from './documents/DocumentsApp.svelte';
import GarageApp from './garage/GarageApp.svelte';
import BankApp from './bank/BankApp.svelte';
import TwitterApp from './twitter/TwitterApp.svelte';
import ChatterApp from './chatter/ChatterApp.svelte';

export const REGISTRY = {
    phone: PhoneApp,
    contacts: ContactsApp,
    messages: MessagesApp,
    settings: SettingsApp,
    email: EmailApp,
    adverts: AdvertsApp,
    documents: DocumentsApp,
    garage: GarageApp,
    bank: BankApp,
    twitter: TwitterApp,
    chatter: ChatterApp,
};
