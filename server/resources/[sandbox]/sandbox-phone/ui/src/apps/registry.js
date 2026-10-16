/**
 * App name -> root component. Each receives { app, segs } where segs are the
 * path segments after /apps/<name>. Apps missing here (dyn8, homemanage,
 * redline, blueline, music) show "not available yet".
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
import StoreApp from './store/StoreApp.svelte';
import ServicesApp from './services/ServicesApp.svelte';
import CryptoApp from './crypto/CryptoApp.svelte';
import LoansApp from './loans/LoansApp.svelte';
import LaborApp from './labor/LaborApp.svelte';
import ChopperApp from './chopper/ChopperApp.svelte';
import PingemApp from './pingem/PingemApp.svelte';
import MediaApp from './media/MediaApp.svelte';
import CalculatorApp from './calculator/CalculatorApp.svelte';
import ComanagerApp from './comanager/ComanagerApp.svelte';

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
    store: StoreApp,
    services: ServicesApp,
    crypto: CryptoApp,
    loans: LoansApp,
    labor: LaborApp,
    chopper: ChopperApp,
    pingem: PingemApp,
    media: MediaApp,
    calculator: CalculatorApp,
    comanager: ComanagerApp,
};
