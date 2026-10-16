#!/usr/bin/env node
/**
 * Render a built NUI in headless Chromium, feed it fake SendNUIMessage
 * events, and save screenshots. This is how the interfaces are verified
 * without launching the game.
 *
 *   node scripts/preview.mjs --ui sandbox-hud --scenario hud/ui/preview/default.json --out /tmp/hud.png
 *   node scripts/preview.mjs --ui sandbox-hud            # runs every ui/preview/*.json
 *
 * Scenario file: { "viewport": [1920,1080], "settle": 600,
 *                  "messages": [ { "type": "SHOW_HUD", "data": {...}, "delay": 100 }, ... ],
 *                  "mocks": { "SomeCallback": {...} } }
 *
 * fetch() calls to https://<resource>/... are answered with the mock for
 * that callback (default {}), and window.invokeNative is stubbed so the
 * page believes it runs inside the game.
 */
import { createServer } from 'node:http';
import { existsSync, readFileSync, readdirSync, mkdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

/**
 * Playwright normally downloads its own Chromium (`npx playwright install chromium`).
 * When that is not possible, point PW_CHROMIUM_PATH at a Chrome/Chromium binary or
 * let this look through PLAYWRIGHT_BROWSERS_PATH for any installed revision.
 */
function findChromium() {
    if (process.env.PW_CHROMIUM_PATH) return process.env.PW_CHROMIUM_PATH;
    const root = process.env.PLAYWRIGHT_BROWSERS_PATH;
    if (!root || !existsSync(root)) return undefined;
    const candidates = [];
    for (const d of readdirSync(root)) {
        const p = path.join(root, d);
        try {
            if (statSync(p).isFile() && d.startsWith('chromium')) {
                candidates.push(p);
                continue;
            }
        } catch (e) {
            continue;
        }
        for (const sub of [
            'chrome-linux/chrome',
            'chrome-linux64/chrome',
            'chrome-linux/headless_shell',
            'chrome-headless-shell-linux64/chrome-headless-shell',
        ]) {
            const f = path.join(p, sub);
            if (existsSync(f)) candidates.push(f);
        }
    }
    return candidates.find((c) => /chromium-\d+\/chrome-linux\/chrome$/.test(c)) ?? candidates[0];
}

async function launchBrowser() {
    try {
        return await chromium.launch();
    } catch (err) {
        const executablePath = findChromium();
        if (!executablePath) throw err;
        return chromium.launch({ executablePath });
    }
}

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RESOURCES = path.join(ROOT, 'server', 'resources', '[sandbox]');

const args = process.argv.slice(2);
const opt = (name, def) => {
    const i = args.indexOf(`--${name}`);
    return i >= 0 ? args[i + 1] : def;
};
const resource = opt('ui');
if (!resource) {
    console.error('usage: preview.mjs --ui <resource> [--dist dir] [--scenario file.json] [--out file.png] [--outdir dir]');
    process.exit(1);
}

const dist = opt('dist') ? path.resolve(opt('dist')) : path.join(RESOURCES, resource, 'ui', 'dist');
if (!existsSync(path.join(dist, 'index.html'))) {
    console.error(`No build found at ${dist}. Run: npm run build -- ${resource}`);
    process.exit(1);
}

const MIME = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.mp3': 'audio/mpeg',
    '.ogg': 'audio/ogg',
    '.mp4': 'video/mp4',
};

function serve(dir) {
    return new Promise((resolve) => {
        const server = createServer((req, res) => {
            const url = decodeURIComponent(req.url.split('?')[0]);
            let file = path.join(dir, url === '/' ? 'index.html' : url);
            if (!file.startsWith(dir) || !existsSync(file)) {
                res.writeHead(404);
                res.end();
                return;
            }
            res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] ?? 'application/octet-stream' });
            res.end(readFileSync(file));
        });
        server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port }));
    });
}

/**
 * Scenario values may use time tokens so countdowns and timed buffs render:
 *   "$now"        -> current unix time in seconds      "$now+90"   -> 90 s from now
 *   "$nowMs"      -> current time in milliseconds      "$nowMs-5000"
 */
function resolveTimeTokens(value) {
    if (typeof value === 'string') {
        const m = /^\$(now|nowMs)([+-]\d+)?$/.exec(value);
        if (!m) return value;
        const base = m[1] === 'now' ? Math.floor(Date.now() / 1000) : Date.now();
        return base + (m[2] ? Number(m[2]) : 0);
    }
    if (Array.isArray(value)) return value.map(resolveTimeTokens);
    if (value && typeof value === 'object') {
        return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, resolveTimeTokens(v)]));
    }
    return value;
}

function loadScenarios() {
    const single = opt('scenario');
    if (single) return [{ name: path.basename(single, '.json'), ...JSON.parse(readFileSync(single, 'utf8')) }];
    const dir = path.join(RESOURCES, resource, 'ui', 'preview');
    if (!existsSync(dir)) return [{ name: 'blank', messages: [] }];
    return readdirSync(dir)
        .filter((f) => f.endsWith('.json'))
        .map((f) => ({ name: path.basename(f, '.json'), ...JSON.parse(readFileSync(path.join(dir, f), 'utf8')) }));
}

async function main() {
    const { server, port } = await serve(dist);
    const browser = await launchBrowser();
    const outdir = opt('outdir', path.join(ROOT, '.preview', resource));
    mkdirSync(outdir, { recursive: true });
    let failures = 0;

    for (const scenario of loadScenarios()) {
        const [w, h] = scenario.viewport ?? [1920, 1080];
        const context = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
        page.on('console', (m) => {
            if (m.type() === 'error') errors.push(`console: ${m.text()}`);
        });

        // Pretend to be the game: resource name + invokeNative, and answer NUI callbacks with mocks.
        await page.addInitScript(
            ({ res }) => {
                window.invokeNative = () => {};
                window.GetParentResourceName = () => res;
            },
            { res: resource },
        );
        const mocks = scenario.mocks ?? {};
        await page.route(/^https:\/\/[a-z0-9-]+\/.*/i, (route) => {
            const cb = new URL(route.request().url()).pathname.slice(1);
            route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mocks[cb] ?? {}) });
        });

        await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'load' });
        // backdrop: true paints the kit's dark stand-in for the game world so over-world text reads as it will in game.
        if (scenario.backdrop) await page.evaluate(() => document.body.classList.add('nui-dev'));
        await page.waitForTimeout(scenario.settle ?? 400);

        for (const msg of scenario.messages ?? []) {
            if (msg.delay) await page.waitForTimeout(msg.delay);
            // { raw: {...} } posts the object verbatim (FiveM loadscreen events use eventName, not type).
            const payload = resolveTimeTokens(msg.raw ?? { type: msg.type, data: msg.data ?? {} });
            await page.evaluate((data) => window.dispatchEvent(new MessageEvent('message', { data })), payload);
        }
        await page.waitForTimeout(scenario.wait ?? 700);

        const out = opt('out') ?? path.join(outdir, `${scenario.name}.png`);
        await page.screenshot({ path: out, fullPage: false, omitBackground: !scenario.backdrop });
        const flag = errors.length ? 'ERRORS' : 'ok';
        if (errors.length) failures += 1;
        console.log(`${flag.padEnd(6)} ${resource}/${scenario.name} -> ${out}`);
        for (const e of errors.slice(0, 10)) console.log(`       ${e}`);
        await context.close();
    }

    await browser.close();
    server.close();
    process.exit(failures ? 1 : 0);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
