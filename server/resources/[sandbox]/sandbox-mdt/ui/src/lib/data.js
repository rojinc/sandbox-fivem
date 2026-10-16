/** Static lookups shared by the pages (ported from the old ui/src/data). */

export const ReportTypes = [
    { label: 'Incident Report', short: 'Incident', value: 0, requiredViewPermission: 'MDT_INCIDENT_REPORT_VIEW', requiredCreatePermission: 'MDT_INCIDENT_REPORT_CREATE', hasEvidence: true, allowAttorney: true },
    { label: 'Investigative Report', short: 'Investigation', value: 1, requiredViewPermission: 'MDT_INVESTIGATIVE_REPORT_VIEW', requiredCreatePermission: 'MDT_INVESTIGATIVE_REPORT_CREATE', hasEvidence: true, allowAttorney: true },
    { label: 'Civilian Report', short: 'Civ. Report', value: 2, requiredViewPermission: 'MDT_CIVILIAN_REPORT_VIEW', requiredCreatePermission: 'MDT_CIVILIAN_REPORT_CREATE', hasEvidence: true, allowAttorney: true },
    { label: 'PD Field Training Reports', short: 'PD FTO', value: 3, requiredViewPermission: 'MDT_POLICE_FTO_REPORTS', requiredCreatePermission: 'MDT_POLICE_FTO_REPORTS' },
    { label: 'PD Disciplinary Reports', short: 'Disciplinary', value: 4, requiredViewPermission: 'MDT_POLICE_DISCIPLINARY_REPORTS', requiredCreatePermission: 'MDT_POLICE_DISCIPLINARY_REPORTS' },
    { label: 'PD Command Documents', short: 'PD Command', value: 5, requiredViewPermission: 'PD_COMMAND', requiredCreatePermission: 'PD_COMMAND' },
    { label: 'PD High Command Documents', short: 'PD HC', value: 6, requiredViewPermission: 'PD_HIGH_COMMAND', requiredCreatePermission: 'PD_HIGH_COMMAND' },
    { label: 'Medical Report', short: 'Medical', value: 10, requiredViewPermission: 'MDT_MEDICAL_REPORTS', requiredCreatePermission: 'MDT_MEDICAL_REPORTS', officerName: 'Medic', officerType: 'ems' },
    { label: 'EMS Documents', short: 'EMS Docs', value: 11, requiredViewPermission: 'MDT_MEDICAL_REPORTS', requiredCreatePermission: 'MDT_MEDICAL_REPORTS', officerName: 'Medic', officerType: 'ems' },
    { label: 'EMS HC Documents', short: 'EMS HC', value: 12, requiredViewPermission: 'SAFD_HIGH_COMMAND', requiredCreatePermission: 'SAFD_HIGH_COMMAND', officerName: 'Medic', officerType: 'ems' },
    { label: 'Trial Findings (Public)', short: 'Trial', value: 20, requiredCreatePermission: 'DOJ_TRIAL_FINDINGS_CREATE', officerName: 'Judges', officerType: 'government' },
    { label: 'Judge Private Documents', short: 'DOJ Judge', value: 21, requiredViewPermission: 'MDT_JUDGE_REPORTS', requiredCreatePermission: 'MDT_JUDGE_REPORTS', officerName: 'Judges', officerType: 'government' },
    { label: 'DOJ Documents', short: 'DOJ', value: 22, requiredViewPermission: 'DOJ_DOCUMENTS_VIEW', requiredCreatePermission: 'DOJ_DOCUMENTS_CREATE', officerName: 'Judges', officerType: 'government', allowAttorney: true },
    { label: "DA's Office Reports", short: 'DA', value: 25, requiredViewPermission: 'MDT_DA_REPORTS', requiredCreatePermission: 'MDT_DA_REPORTS', officerName: 'Prosecutors', officerType: 'government' },
    { label: 'Pub. Defender Reports', short: 'Pub. Defender', value: 26, requiredViewPermission: 'MDT_PUBDEFENDER_REPORTS', requiredCreatePermission: 'MDT_PUBDEFENDER_REPORTS', officerName: 'Public Defenders', officerType: 'government' },
    { label: 'DOC Reports', short: 'DOC Reports', value: 30, requiredViewPermission: 'DOC_REPORTS_VIEW', requiredCreatePermission: 'DOC_REPORTS_CREATE', officerName: 'Officer', officerType: 'prison', hasEvidence: true },
    { label: 'DOC Documents', short: 'DOC Documents', value: 31, requiredViewPermission: 'DOC_DOCUMENTS_VIEW', requiredCreatePermission: 'DOC_DOCUMENTS_CREATE', officerName: 'Officer', officerType: 'prison' },
];

export const getReportType = (value) => ReportTypes.find((r) => r.value == value);
export const getOfficerNameFromReportType = (v) => getReportType(v)?.officerName ?? 'Officers';
export const getOfficerJobFromReportType = (v) => getReportType(v)?.officerType ?? 'police';

export const ChargeTypes = [
    { label: 'Infraction', value: 1, tone: 'info' },
    { label: 'Misdemeanor', value: 2, tone: 'warning' },
    { label: 'Felony', value: 3, tone: 'danger' },
];
export const chargeTone = (type) => ChargeTypes.find((t) => t.value == type)?.tone ?? 'neutral';
export const chargeLabel = (type) => ChargeTypes.find((t) => t.value == type)?.label ?? 'Charge';

export const VehicleTypes = ['Vehicle', 'Boat', 'Aircraft'];
export const VehicleIcons = ['car-side', 'ship', 'plane'];

export const PropertyTypes = { house: 'House', office: 'Office', warehouse: 'Warehouse' };

export const PleaTypes = [
    { label: 'Guilty', value: 'guilty' },
    { label: 'Not Guilty', value: 'not-guilty' },
    { label: 'No Contest', value: 'no-contest' },
    { label: 'Unknown', value: 'unknown' },
];
export const pleaLabel = (v) => PleaTypes.find((p) => p.value == v)?.label ?? 'Unknown';

export const ReductionTypes = [
    { label: 'Jail Time', value: 'months' },
    { label: 'Fine', value: 'fine' },
];
export const ParoleMultiplier = 1.5;

export const EvidenceTypes = [
    { label: 'Photo', value: 'photo', color: '#a56cff' },
    { label: 'Casing', value: 'casing', color: '#9aa3ad' },
    { label: 'Projectile', value: 'projectile', color: '#f0744f' },
    { label: 'Weapon', value: 'weapon', color: '#e2516d' },
    { label: 'Paint Fragment', value: 'fragment', color: '#3ddc84' },
    { label: 'Other', value: 'other', color: '#4f9cff' },
];
export const evidenceType = (v) => EvidenceTypes.find((e) => e.value == v) ?? EvidenceTypes[EvidenceTypes.length - 1];

export const VehicleFlagTypes = [
    { label: 'Stolen Vehicle', value: 'stolen', tone: 'danger', radarFlag: true },
    { label: 'Suspended Registration', value: 'suspended', tone: 'warning' },
    { label: 'BOLO', value: 'BOLO', tone: 'danger', radarFlag: true },
    { label: 'History of Evasion', value: 'evasion', tone: 'danger' },
    { label: 'Suspected OC Involvement', value: 'oc', tone: 'danger' },
];

export const FirearmFlagTitles = ['Stolen', 'Seized', 'Flagged', 'PD Trashed/Broken'];

export const BOLOTypes = [
    { label: 'Person', value: 'user', icon: 'user' },
    { label: 'Vehicle', value: 'car', icon: 'car' },
];

export const WarrantStates = [
    { label: 'Active', value: 'active', tone: 'success' },
    { label: 'Served', value: 'served', tone: 'info' },
    { label: 'Expired', value: 'expired', tone: 'neutral' },
    { label: 'Void', value: 'void', tone: 'danger' },
];
export const warrantState = (v) => WarrantStates.find((w) => w.value == v) ?? { label: 'Unknown', tone: 'neutral' };

export const UnitTypeNames = {
    car: 'Ground',
    motorcycle: 'Motorcycle',
    air1: 'Air',
    bus: 'Ambo',
    lifeflight: 'Life Flight',
    heat: 'Heat',
};

export const UnitTypeOptions = {
    police: [
        { value: 'car', label: 'Ground Unit' },
        { value: 'heat', label: 'Heat Unit' },
        { value: 'motorcycle', label: 'Motorcycle Unit' },
        { value: 'air1', label: 'Air Unit' },
    ],
    ems: [
        { value: 'bus', label: 'Ambulance' },
        { value: 'car', label: 'Rapid Response' },
        { value: 'lifeflight', label: 'Life Flight' },
    ],
};

export const JobNames = { police: 'Police', ems: 'EMS', prison: 'DOC', tow: 'Tow' };
export const JobShort = { police: 'PD', ems: 'EMS', prison: 'DOC', tow: 'TOW' };

/** Per-department accent colour for the window chrome. */
export const DepartmentAccent = {
    lspd: '#f5b82e',
    bcso: '#e0a44c',
    sast: '#8fa8ff',
    guardius: '#f5b82e',
    safd: '#5ec8d8',
    doctors: '#5ec8d8',
    corrections: '#a7b8c9',
    doj: '#d4b36a',
    dattorney: '#d4b36a',
    publicdefenders: '#d4b36a',
    mayoroffice: '#d4b36a',
};

export const DepartmentData = {
    lspd: { name: 'Los Santos Police Department', color: '#2a4179' },
    bcso: { name: "Blaine County Sheriff's Office", color: '#755613' },
    guardius: { name: 'Guardius', color: '#8a7a2e' },
    sast: { name: 'San Andreas State Troopers', color: '#3a4a7a' },
    sasp: { name: 'San Andreas Highway Patrol', color: '#5a5a5a' },
    safd: { name: 'San Andreas Medical Services', color: '#2f4fb0' },
    doj: { name: 'San Andreas Department of Justice', color: '#452f00' },
    dattorney: { name: "District Attorney's Office", color: '#452f00' },
    publicdefenders: { name: 'Public Defenders Office', color: '#452f00' },
    corrections: { name: 'San Andreas Department of Corrections', color: '#4a5560' },
};
