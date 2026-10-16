import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Shared Vite preset for every NUI.
 *
 *   // ui/vite.config.js
 *   import { nuiViteConfig } from '@sandbox/ui-kit/vite';
 *   export default nuiViteConfig({ root: import.meta.dirname, port: 3001 });
 *
 * Output goes to <root>/dist with relative asset URLs, which is what a
 * FiveM `ui_page 'ui/dist/index.html'` needs. List `ui/dist/index.html`
 * and `ui/dist/assets/*` under `files` in fxmanifest.lua.
 *
 * @param {object} options
 * @param {string} options.root        the ui/ folder (import.meta.dirname)
 * @param {number} [options.port]      dev-server port
 * @param {string} [options.outDir]    defaults to 'dist'
 * @param {object} [options.extend]    merged over the generated config
 */
export function nuiViteConfig({ root, port = 3000, outDir = 'dist', extend = {} }) {
    return defineConfig({
        root,
        base: './',
        plugins: [react()],
        resolve: {
            alias: { '@': path.resolve(root, 'src') },
            dedupe: ['react', 'react-dom', 'react-redux', '@emotion/react', '@emotion/styled', '@mui/material'],
        },
        define: {
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'production'),
        },
        build: {
            outDir: path.resolve(root, outDir),
            emptyOutDir: true,
            assetsDir: 'assets',
            // FiveM's CEF is a recent Chromium; keep syntax conservative anyway.
            target: 'chrome103',
            cssTarget: 'chrome103',
            sourcemap: false,
            // Preload hints trigger extra nui:// fetches that bring no benefit.
            modulePreload: { polyfill: false },
            // Inline tiny images only; fonts and media always stay as files.
            assetsInlineLimit: (filePath, content) =>
                /\.(png|jpe?g|gif|webp|svg)$/i.test(filePath) && content.length < 4096,
            chunkSizeWarningLimit: 4000,
            reportCompressedSize: false,
        },
        server: { port, open: false, strictPort: false },
        preview: { port },
        ...extend,
    });
}

export default nuiViteConfig;
