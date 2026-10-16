#!/usr/bin/env node
/**
 * Build every NUI in the workspace (or a subset) with Vite.
 *
 *   npm run build                 # all
 *   npm run build -- hud phone    # only packages whose name contains these
 *   npm run clean                 # delete every ui/dist
 *
 * Builds run with limited parallelism so a full rebuild stays fast without
 * starving the machine.
 */
import { spawn } from 'node:child_process';
import { existsSync, readFileSync, rmSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RESOURCES = path.join(ROOT, 'server', 'resources', '[sandbox]');
const args = process.argv.slice(2);
const clean = args.includes('--clean');
const filters = args.filter((a) => !a.startsWith('--'));
const PARALLEL = Number(process.env.BUILD_PARALLEL ?? 3);

function findUiPackages() {
    const out = [];
    for (const dir of readdirSync(RESOURCES)) {
        const ui = path.join(RESOURCES, dir, 'ui');
        const pkg = path.join(ui, 'package.json');
        if (!existsSync(pkg)) continue;
        const json = JSON.parse(readFileSync(pkg, 'utf8'));
        if (!json.scripts?.build) continue;
        if (!existsSync(path.join(ui, 'vite.config.js')) && !existsSync(path.join(ui, 'vite.config.mjs'))) continue;
        out.push({ resource: dir, name: json.name, dir: ui });
    }
    return out.sort((a, b) => a.resource.localeCompare(b.resource));
}

function dirSize(p) {
    if (!existsSync(p)) return 0;
    let total = 0;
    for (const f of readdirSync(p)) {
        const fp = path.join(p, f);
        const st = statSync(fp);
        total += st.isDirectory() ? dirSize(fp) : st.size;
    }
    return total;
}

function run(pkg) {
    return new Promise((resolve) => {
        const started = Date.now();
        const child = spawn('npm', ['run', 'build', '--workspace', pkg.name, '--silent'], {
            cwd: ROOT,
            env: { ...process.env, NODE_ENV: 'production', FORCE_COLOR: '0' },
            stdio: ['ignore', 'pipe', 'pipe'],
        });
        let output = '';
        child.stdout.on('data', (d) => (output += d));
        child.stderr.on('data', (d) => (output += d));
        child.on('close', (code) => {
            resolve({ pkg, code, output, ms: Date.now() - started });
        });
    });
}

async function main() {
    let packages = findUiPackages();
    if (filters.length) {
        packages = packages.filter((p) => filters.some((f) => p.resource.includes(f) || p.name.includes(f)));
    }
    if (!packages.length) {
        console.error('No UI packages matched.');
        process.exit(1);
    }

    if (clean) {
        for (const p of packages) {
            rmSync(path.join(p.dir, 'dist'), { recursive: true, force: true });
            console.log(`cleaned ${p.resource}/ui/dist`);
        }
        return;
    }

    console.log(`Building ${packages.length} NUI package(s), ${PARALLEL} at a time…\n`);
    const queue = [...packages];
    const results = [];
    const workers = Array.from({ length: Math.min(PARALLEL, queue.length) }, async () => {
        while (queue.length) {
            const pkg = queue.shift();
            const res = await run(pkg);
            results.push(res);
            const size = (dirSize(path.join(pkg.dir, 'dist')) / 1024 / 1024).toFixed(2);
            const status = res.code === 0 ? 'ok ' : 'FAIL';
            console.log(`${status}  ${pkg.resource.padEnd(24)} ${size.padStart(6)} MB  ${(res.ms / 1000).toFixed(1)}s`);
            if (res.code !== 0) console.log(res.output.split('\n').slice(-30).join('\n'));
        }
    });
    await Promise.all(workers);

    const failed = results.filter((r) => r.code !== 0);
    console.log(`\n${results.length - failed.length}/${results.length} built successfully.`);
    process.exit(failed.length ? 1 : 0);
}

main();
