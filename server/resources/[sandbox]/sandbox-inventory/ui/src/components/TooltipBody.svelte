<script>
    import { RichText, Tag } from '@sandbox/ui-kit';
    import { catalog } from '../state/catalog.svelte.js';
    import { app } from '../state/app.svelte.js';
    import { inv } from '../state/inventory.svelte.js';
    import {
        itemLabel,
        typeLabel,
        rarityLabel,
        durabilityOf,
        parseMeta,
        stackMax,
        formatWeight,
        formatCount,
        formatPrice,
        formatLongDate,
        formatUntil,
        unitPrice,
        WEIGHT_UNIT,
    } from '../lib/item.js';

    /**
     * What one item is: name (bold) with a rarity Tag, the description, then
     * definition rows. `context` is player | secondary | static | recipe.
     */
    let { instance, def, context = 'player', count = null } = $props();

    const HIDDEN = new Set([
        'ammo', 'clip', 'CreateDate', 'Container', 'Quality', 'mask', 'accessory', 'watch', 'hat', 'BankId', 'VpnName',
        'EvidenceCoords', 'EvidenceType', 'EvidenceWeapon', 'EvidenceDNA', 'WeaponTint', 'CustomItemLabel', 'CustomItemImage',
        'CustomItemAction', 'Items', 'Department', 'Scratched', 'PoliceWeaponId', 'Mugshot', 'CustomAmt', 'Inviter', 'Officer',
        'Disabled', 'Brew',
    ]);

    const LABELS = {
        SerialNumber: 'Serial number',
        ScratchedSerialNumber: 'Serial number',
        StateID: 'State ID',
        PassportID: 'Passport ID',
        DOB: 'Date of birth',
        EvidenceAmmoType: 'Ammo type',
        EvidenceId: 'Evidence ID',
        EvidenceColor: 'Fragment colour',
        EvidenceDegraded: 'Degraded',
        EvidenceBloodPool: 'Blood',
        VaultCode: 'Vault access code',
        BranchName: 'Fleeca branch',
        Finished: 'Ready',
        CryptoCoin: 'Currency',
        ChopList: 'Vehicles wanted',
        WeaponComponents: 'Attachments',
        AccessCodes: 'Access codes',
        MethTable: 'Table ID',
    };
    const MONO = new Set(['SerialNumber', 'StateID', 'PassportID', 'EvidenceId', 'VaultCode', 'MethTable']);

    const shopCtx = $derived(context === 'secondary' && (inv.secondary.shop || inv.secondary.playerShop));
    const n = $derived(count ?? (Number(instance?.Count) || 1));
    const md = $derived(parseMeta(instance?.MetaData));
    const durability = $derived(context === 'recipe' ? null : durabilityOf(instance, def));
    const rarity = $derived(rarityLabel(def));
    const weight = $derived(Number(def?.weight) || 0);
    const max = $derived(stackMax(def));

    const schematic = $derived.by(() => {
        if (!def?.schematic) return null;
        const s = typeof def.schematic === 'object' ? def.schematic : catalog.schematics[def.schematic];
        const result = s?.result;
        if (!result?.name) return null;
        const out = catalog.items[result.name];
        return out ? `How to craft ${formatCount(result.count ?? 1)} ${out.label}` : null;
    });

    const fit = $derived.by(() => {
        const strings = def?.component?.strings;
        if (!strings || typeof strings !== 'object') return null;
        if (context !== 'static' && context !== 'recipe' && app.equipped) {
            const eq = catalog.items[app.equipped.Name];
            const key = eq?.weapon ?? app.equipped.Name;
            return { label: 'Fits your weapon', value: strings[key] ? 'Yes' : 'No' };
        }
        const names = Object.keys(strings);
        if (names.length > 10) return { label: 'Fits on', value: 'Most weapons' };
        const labels = names.map((w) => catalog.items[w]?.label).filter(Boolean);
        return labels.length ? { label: 'Fits on', list: labels } : null;
    });

    const permit = $derived.by(() => {
        if (!shopCtx || !inv.secondary.shop) return [];
        const rows = [];
        if (Number(def?.type) === 2 && def?.requiresLicense) {
            const ok = Boolean(inv.player.isWeaponEligble);
            rows.push({ label: 'Weapons permit', value: ok ? 'Needed, and you have one' : 'Needed, and you do not have one', tone: ok ? null : 'error' });
        }
        if (def?.qualification) {
            const ok = (inv.player.qualifications ?? []).includes(def.qualification);
            rows.push({ label: 'Qualification', value: ok ? 'Needed, and you have it' : 'Needed, and you do not have it', tone: ok ? null : 'error' });
        }
        return rows;
    });

    function metaRows(meta) {
        const rows = [];
        for (const key of Object.keys(meta).sort()) {
            if (HIDDEN.has(key)) continue;
            const v = meta[key];
            if (v === null || v === undefined || v === '') continue;
            const label = LABELS[key] ?? key;
            switch (key) {
                case 'ScratchedSerialNumber':
                    rows.push({ key, label, value: 'Scratched off' });
                    break;
                case 'DOB':
                    rows.push({ key, label, value: formatLongDate(v) });
                    break;
                case 'EvidenceColor':
                    if (v && typeof v === 'object') rows.push({ key, label, value: `Red ${v.r}, green ${v.g}, blue ${v.b}`, swatch: `rgb(${Number(v.r) || 0} ${Number(v.g) || 0} ${Number(v.b) || 0})` });
                    break;
                case 'EvidenceDegraded':
                    rows.push({ key, label, value: v ? 'Yes' : 'No' });
                    break;
                case 'EvidenceBloodPool':
                    rows.push({ key, label, value: v ? 'Pool of blood' : 'Drops of blood' });
                    break;
                case 'Finished': {
                    const ms = Number(v) < 1e12 ? Number(v) * 1000 : Number(v);
                    rows.push({ key, label, value: ms <= Date.now() ? 'Now' : formatUntil(ms) });
                    break;
                }
                case 'CustomItemText':
                    rows.push({ key, label: null, value: String(v) });
                    break;
                case 'ChopList': {
                    const list = Array.isArray(v) ? v : Object.values(v ?? {});
                    const names = [...list].sort((a, b) => (b?.hv ? 1 : 0) - (a?.hv ? 1 : 0)).map((c) => (c?.hv ? `${c.name} (high value)` : c?.name)).filter(Boolean);
                    rows.push({ key, label, list: names.length ? names : null, value: names.length ? null : 'None on the list' });
                    break;
                }
                case 'WeaponComponents': {
                    const entries = Object.entries(v ?? {})
                        .map(([slotName, a]) => {
                            const it = catalog.items[a?.item];
                            return it ? `${slotName.charAt(0).toUpperCase()}${slotName.slice(1)}: ${it.label}` : null;
                        })
                        .filter(Boolean);
                    if (entries.length) rows.push({ key, label, list: entries });
                    break;
                }
                case 'AccessCodes': {
                    const list = (Array.isArray(v) ? v : Object.values(v ?? {})).map((c) => `${c?.label}: ${c?.code}`);
                    if (list.length) rows.push({ key, label, list, mono: true });
                    break;
                }
                default:
                    if (typeof v === 'string' || typeof v === 'number') rows.push({ key, label, value: String(v), mono: MONO.has(key) });
                    else if (typeof v === 'boolean') rows.push({ key, label, value: v ? 'Yes' : 'No' });
            }
        }
        return rows;
    }

    const extra = $derived(metaRows(md));
    const quality = $derived(Number(instance?.Quality) || 0);
    const price = $derived(shopCtx && instance ? unitPrice(instance, def, inv.secondary) : null);
</script>

<div class="tip">
    <div class="tip__head">
        <strong class="tip__name">{itemLabel(instance, def)}</strong>
        {#if rarity}<Tag>{rarity}</Tag>{/if}
    </div>
    {#if def?.description}
        <RichText class="tip__desc" tag="p" text={def.description} />
    {/if}

    <dl class="au-dl tip__rows">
        <dt>Type</dt>
        <dd>{typeLabel(def)}{def?.isUsable ? ', usable' : ''}</dd>

        {#if price !== null}
            <dt>Price</dt>
            <dd class="au-mono">{price > 0 ? `${formatPrice(price)} each` : 'Free'}</dd>
        {/if}

        <dt>Weight</dt>
        <dd>
            <span class="au-mono">{formatWeight(weight)} {WEIGHT_UNIT}</span>{#if n > 1 && weight > 0}<span class="au-muted"> each, </span><span class="au-mono">{formatWeight(weight * n)} {WEIGHT_UNIT}</span><span class="au-muted"> in total</span>{/if}
        </dd>

        <dt>{shopCtx && inv.secondary.shop ? 'Buy at once' : 'Count'}</dt>
        <dd><span class="au-mono">{formatCount(n)}</span>{#if max > 0}<span class="au-muted"> (stacks to </span><span class="au-mono">{formatCount(max)}</span><span class="au-muted">)</span>{/if}</dd>

        {#if durability !== null}
            <dt>Durability</dt>
            {#if durability > 0}
                <dd class="au-mono">{Math.min(100, durability)}%</dd>
            {:else}
                <dd class="is-error">Broken</dd>
            {/if}
        {/if}

        {#if quality > 0}
            <dt>Quality</dt>
            <dd class="au-mono">{quality}%</dd>
        {/if}

        {#each permit as row (row.label)}
            <dt>{row.label}</dt>
            <dd class:is-error={row.tone === 'error'}>{row.value}</dd>
        {/each}

        {#if schematic}
            <dt>Teaches</dt>
            <dd>{schematic}</dd>
        {/if}

        {#if fit}
            <dt>{fit.label}</dt>
            {#if fit.list}
                <dd><ul class="tip__list">{#each fit.list as w, i (i)}<li>{w}</li>{/each}</ul></dd>
            {:else}
                <dd>{fit.value}</dd>
            {/if}
        {/if}

        {#if instance?.id}
            <dt>Item ID</dt>
            <dd class="au-mono">{instance.id}</dd>
        {/if}

        {#each extra as row (row.key)}
            {#if row.label === null}
                <dd class="tip__full">{row.value}</dd>
            {:else}
                <dt>{row.label}</dt>
                {#if row.list}
                    <dd><ul class="tip__list" class:au-mono={row.mono}>{#each row.list as entry, i (i)}<li>{entry}</li>{/each}</ul></dd>
                {:else}
                    <dd class:au-mono={row.mono}>
                        {#if row.swatch}<span class="tip__swatch" style:background={row.swatch}></span>{/if}{row.value}
                    </dd>
                {/if}
            {/if}
        {/each}
    </dl>
</div>

<style>
    .tip {
        font-size: var(--au-fs-xs);
        line-height: 1.45;
    }
    .tip__head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: var(--au-s3);
        margin-bottom: var(--au-s2);
    }
    .tip__name {
        font-size: var(--au-fs-sm);
        line-height: 1.3;
    }
    .tip :global(.tip__desc) {
        display: block;
        margin: 0 0 var(--au-s3);
        color: var(--au-muted);
    }
    .tip__rows {
        margin: 0;
        padding-top: var(--au-s3);
        border-top: 1px solid var(--au-border);
        grid-template-columns: max-content minmax(0, 1fr);
        word-break: break-word;
    }
    .tip__full {
        grid-column: 1 / -1;
        margin: 0;
    }
    .tip__list {
        margin: 0;
        padding: 0;
        list-style: none;
    }
    .is-error {
        color: var(--au-error);
        font-weight: 700;
    }
    .tip__swatch {
        display: inline-block;
        width: 12px;
        height: 12px;
        margin-right: var(--au-s2);
        vertical-align: -1px;
        border: 1px solid var(--au-ink);
    }
</style>
