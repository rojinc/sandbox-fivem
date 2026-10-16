<script>
    import { formatDay } from '../../lib/format.js';
    import sealState from '../../assets/seals/seal.webp';
    import sealLS from '../../assets/seals/ls_seal.webp';
    import sealBCSO from '../../assets/seals/bcso_seal.webp';
    import sealSAST from '../../assets/seals/SAST.webp';
    import sealGuardius from '../../assets/seals/guardius2.webp';
    import sealMedical from '../../assets/seals/MedicalServices.webp';
    import sealDOC from '../../assets/seals/corrections.webp';
    import sealDOJ from '../../assets/seals/doj_seal.webp';

    /**
     * The card someone shows you, bottom left: a government employee ID
     * (SHOW_GOV_ID, kind "badge") or a state identification card
     * (SHOW_DRIVER_LICENSE, kind "licence"). Lua hides it after 9 seconds.
     */
    let { kind = 'badge', data = {} } = $props();

    const DEPTS = {
        lspd: { short: 'LSPD', name: 'Los Santos Police Department', seal: sealLS },
        bcso: { short: 'BCSO', name: "Blaine County Sheriff's Office", seal: sealBCSO },
        sast: { short: 'SAST', name: 'San Andreas State Troopers', seal: sealSAST },
        guardius: { short: 'Guardius', name: 'Guardius', seal: sealGuardius },
        safd: { short: 'EMS', name: 'San Andreas Medical Services', seal: sealMedical },
        doctors: { short: 'EMS', name: 'San Andreas Medical Services', seal: sealMedical },
        corrections: { short: 'DOC', name: 'San Andreas Department of Corrections', seal: sealDOC },
        doj: { short: 'DOJ', name: 'San Andreas Department of Justice', seal: sealDOJ },
        dattorney: { short: 'DA', name: "District Attorney's Office", seal: sealDOJ },
        publicdefenders: { short: 'OPD', name: "Public Defender's Office", seal: sealDOJ },
    };

    const dept = $derived(kind === 'badge' ? (DEPTS[data.Department] ?? { short: 'SA', name: data['Department Name'] ?? 'State of San Andreas', seal: sealState }) : { short: 'San Andreas', name: 'State of San Andreas', seal: sealState });
    const deptName = $derived(kind === 'badge' ? (data['Department Name'] ?? dept.name) : dept.name);
    const name = $derived(kind === 'badge' ? `${data.First ?? ''} ${data.Last ?? ''}`.trim() : (data.Name ?? 'Unknown'));
</script>

<article class="card" aria-label={kind === 'badge' ? 'Government identification' : 'State identification card'}>
    <header class="top">
        <img class="seal" src={dept.seal} alt="" />
        <div>
            <strong class="short">{dept.short}</strong>
            <div class="dept">{kind === 'badge' ? deptName : 'Identification card'}</div>
        </div>
    </header>
    <div class="main">
        {#if data.Mugshot}
            <img class="photo" src={data.Mugshot} alt="Photo of {name}" />
        {:else}
            <div class="photo photo--none">No photo</div>
        {/if}
        <div class="facts">
            <div class="name">{name || 'Unknown'}</div>
            {#if kind === 'badge'}
                <div class="title">{data.Title ?? 'Employee'}</div>
            {/if}
            <dl>
                {#if kind === 'badge' && data.Callsign}
                    <dt>Callsign</dt>
                    <dd class="au-mono">{data.Callsign}</dd>
                {/if}
                <dt>State ID</dt>
                <dd class="au-mono">{data.SID ?? 'Unknown'}</dd>
                {#if data.DOB}
                    <dt>Born</dt>
                    <dd>{formatDay(data.DOB)}</dd>
                {/if}
                {#if kind === 'licence' && data.Gender !== undefined}
                    <dt>Sex</dt>
                    <dd>{Number(data.Gender) === 1 || data.Gender === true ? 'Female' : 'Male'}</dd>
                {/if}
            </dl>
        </div>
    </div>
</article>

<style>
    .card {
        position: absolute;
        left: 32px;
        bottom: 32px;
        width: 460px;
        height: 290px; /* ID-1 card proportions, 85.6 x 54 mm */
        display: flex;
        flex-direction: column;
        background: var(--au-bg-shade);
        color: var(--au-text);
        border: 2px solid var(--au-border);
        pointer-events: none;
        animation: au-fade-in var(--au-normal) var(--au-ease);
    }
    .top {
        display: flex;
        align-items: center;
        gap: var(--au-s3);
        padding: var(--au-s3) var(--au-s4);
        border-bottom: 4px solid var(--au-ink);
    }
    .seal {
        width: 44px;
        height: 44px;
        object-fit: contain;
    }
    .short {
        display: block;
        font-weight: 800;
        font-size: var(--au-fs-sm);
        line-height: 1.2;
    }
    .dept {
        color: var(--au-muted);
    }
    .main {
        flex: 1;
        display: flex;
        gap: var(--au-s4);
        padding: var(--au-s4);
        min-height: 0;
    }
    .photo {
        width: 136px;
        align-self: stretch;
        object-fit: cover;
        background: var(--au-bg-sunk);
        flex-shrink: 0;
    }
    .photo--none {
        display: grid;
        place-items: center;
        color: var(--au-muted);
    }
    .facts {
        min-width: 0;
        flex: 1;
    }
    .name {
        font-size: var(--au-fs-md);
        font-weight: 700;
        line-height: 1.2;
    }
    .title {
        color: var(--au-muted);
        margin-top: 2px;
    }
    dl {
        display: grid;
        grid-template-columns: max-content 1fr;
        gap: 2px var(--au-s3);
        margin: var(--au-s3) 0 0;
    }
    dt {
        color: var(--au-muted);
    }
    dd {
        margin: 0;
    }
</style>
