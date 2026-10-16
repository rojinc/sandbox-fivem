/**
 * BizWiz page ids (as Lua's businessPages lists them) -> page component,
 * the nav label the UI shows, and which nav entry a hidden page belongs to.
 * Pages missing from PAGES show "not available yet".
 */
import Notices from './pages/Notices.svelte';
import NoticeEdit from './pages/NoticeEdit.svelte';
import Documents from './pages/Documents.svelte';
import DocumentView from './pages/DocumentView.svelte';
import DocumentEdit from './pages/DocumentEdit.svelte';
import Receipts from './pages/Receipts.svelte';
import ReceiptView from './pages/ReceiptView.svelte';
import ReceiptEdit from './pages/ReceiptEdit.svelte';
import ReceiptTotals from './pages/ReceiptTotals.svelte';
import BusinessPost from './pages/BusinessPost.svelte';
import PostProfile from './pages/PostProfile.svelte';
import Fleet from './pages/Fleet.svelte';
import BigWins from './pages/BigWins.svelte';
import PdmCredit from './pages/PdmCredit.svelte';
import Dyn8Credit from './pages/Dyn8Credit.svelte';

export const PAGES = {
    Dashboard: Notices,
    'Create/Notice': NoticeEdit,
    'Search/Document': Documents,
    'View/Document': DocumentView,
    'Create/Document': DocumentEdit,
    'Search/Receipt': Receipts,
    'View/Receipt': ReceiptView,
    'Create/Receipt': ReceiptEdit,
    'Search/ReceiptCount': ReceiptTotals,
    Tweet: BusinessPost,
    TweetSettings: PostProfile,
    FleetManagement: Fleet,
    'Casino/BigWins': BigWins,
    'PDM/Credit': PdmCredit,
    'Dynasty/Credit': Dyn8Credit,
};

export const PARENT = {
    'Create/Notice': 'Dashboard',
    'View/Document': 'Search/Document',
    'Create/Document': 'Search/Document',
    'View/Receipt': 'Search/Receipt',
    'Create/Receipt': 'Search/Receipt',
};

export const LABELS = {
    Dashboard: 'Notice board',
    'Search/Document': 'Documents',
    'Search/Receipt': 'Receipts',
    'Search/ReceiptCount': 'Receipt totals',
    Tweet: 'Business post',
    TweetSettings: 'Post profile',
    FleetManagement: 'Fleet',
    'Casino/BigWins': 'Big wins',
    'PDM/Sales': 'Vehicle stock',
    'PDM/Credit': 'Credit check',
    'PDM/Manage': 'Dealership settings',
    'PDM/SalesHistory': 'Sales history',
    'Dynasty/Credit': 'Credit check',
    'Dynasty/Properties': 'Properties',
};
