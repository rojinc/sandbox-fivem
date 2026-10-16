<script>
    import { Button, Field, Modal, PageAlert, Select, Textarea } from '@sandbox/ui-kit';
    import { call, errorText, readResult } from '../../lib/api.js';
    import { BAN_LENGTHS } from '../../lib/permissions.js';
    import { app } from '../../state/app.svelte.js';
    import { toast } from '../../state/toasts.svelte.js';

    /**
     * Kick or ban confirmation. KickPlayer { targetSource, reason };
     * BanPlayer { targetSource, reason, length } (days, -1 permanent).
     */
    let { kind = 'kick', player, onclose, ondone } = $props();

    const lengths = $derived(BAN_LENGTHS.filter((l) => app.level >= l.level));
    let reason = $state('');
    let length = $state('1');
    let error = $state('');
    let failure = $state('');
    let busy = $state(false);

    const name = $derived(player?.Name ?? 'this player');

    async function confirm(e) {
        e?.preventDefault?.();
        failure = '';
        if (!reason.trim()) {
            error = kind === 'ban' ? 'Enter why you are banning this player' : 'Enter why you are kicking this player';
            return;
        }
        error = '';
        busy = true;
        try {
            const body = { targetSource: Number(player.Source), reason: reason.trim() };
            const res = kind === 'ban' ? await call('BanPlayer', { ...body, length: Number(length) }) : await call('KickPlayer', body);
            const r = readResult(res, kind === 'ban' ? `${name} is banned` : `${name} was kicked`, kind === 'ban' ? `The server refused to ban ${name}. Check your staff level and the ban length.` : `The server refused to kick ${name}. Their staff level may be the same as yours or higher.`);
            if (r.ok) {
                toast('success', r.message);
                ondone?.();
            } else {
                failure = r.message;
            }
        } catch (err) {
            failure = errorText(err);
        } finally {
            busy = false;
        }
    }
</script>

<Modal title={kind === 'ban' ? `Ban ${name}` : `Kick ${name}`} {onclose} width="560px">
    <form id="punish-form" onsubmit={confirm}>
        <p class="intro">
            {kind === 'ban' ? 'They are removed from the server and cannot join again until the ban ends.' : 'They are removed from the server straight away and can join again.'}
            The reason is shown to them and saved in the staff log.
        </p>
        {#if failure}
            <PageAlert type="error" title="Nothing was changed">{failure}</PageAlert>
        {/if}
        {#if kind === 'ban'}
            <Field label="Length" id="ban-length" hint={app.level >= 99 ? undefined : 'Bans longer than 7 days need staff level 99.'}>
                <Select id="ban-length" bind:value={length} options={lengths.map((l) => ({ value: String(l.value), label: l.label }))} />
            </Field>
        {/if}
        <Field label="Reason" id="punish-reason" {error}>
            <Textarea id="punish-reason" rows={3} bind:value={reason} invalid={Boolean(error)} />
        </Field>
    </form>
    {#snippet actions()}
        <Button variant="danger" type="submit" form="punish-form" loading={busy}>{kind === 'ban' ? 'Ban player' : 'Kick player'}</Button>
        <Button variant="secondary" onclick={onclose} disabled={busy}>Cancel</Button>
    {/snippet}
</Modal>

<style>
    .intro {
        margin: 0 0 var(--au-s4);
        color: var(--au-muted);
    }
</style>
