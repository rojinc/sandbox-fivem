/** Browser-only sample data for `npm run dev`. The game and the preview script never run this. */
import { isEnvBrowser, debugData } from '@sandbox/ui-kit/nui';

export function installDevMocks() {
    if (!isEnvBrowser()) return;
    import('./devData.js').then(({ messages, installMocks }) => {
        installMocks();
        debugData(messages, 50);
    });
}
