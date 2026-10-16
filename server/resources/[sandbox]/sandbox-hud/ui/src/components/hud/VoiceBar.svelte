<script>
    import { hud } from '../../state/hud.svelte.js';
    import VStatBar from './VStatBar.svelte';

    /** Proximity level as a vertical bar; yellow while talking, blue on the radio. */
    const value = $derived((Math.max(0, Math.min(3, Number(hud.voip) || 0)) / 3) * 100);
    const color = $derived(hud.talking === 1 ? 'var(--hud-yellow)' : hud.talking === 2 ? 'var(--hud-blue)' : 'rgba(242, 242, 242, 0.65)');
</script>

<VStatBar icon={hud.voipIcon || 'microphone'} {value} {color} iconColor={hud.talking ? color : 'var(--hud-white)'} label="Voice" />
