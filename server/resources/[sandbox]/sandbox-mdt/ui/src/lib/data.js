/** Static lookups shared by the pages (ported from the old ui/src/data). */

export const ReportTypes = [
    { label: 'Incident report', value: 0, view: 'MDT_INCIDENT_REPORT_VIEW', create: 'MDT_INCIDENT_REPORT_CREATE', evidence: true, attorney: true, suspects: true },
    { label: 'Investigative report', value: 1, view: 'MDT_INVESTIGATIVE_REPORT_VIEW', create: 'MDT_INVESTIGATIVE_REPORT_CREATE', evidence: true, attorney: true },
    { label: 'Civilian report', value: 2, view: 'MDT_CIVILIAN_REPORT_VIEW', create: 'MDT_CIVILIAN_REPORT_CREATE', evidence: true, attorney: true },
    { label: 'Field training report', value: 3, view: 'MDT_POLICE_FTO_REPORTS', create: 'MDT_POLICE_FTO_REPORTS' },
    { label: 'Disciplinary report', value: 4, view: 'MDT_POLICE_DISCIPLINARY_REPORTS', create: 'MDT_POLICE_DISCIPLINARY_REPORTS' },
    { label: 'Command document', value: 5, view: 'PD_COMMAND', create: 'PD_COMMAND' },
    { label: 'High command document', value: 6, view: 'PD_HIGH_COMMAND', create: 'PD_HIGH_COMMAND' },
    { label: 'Medical report', value: 10, view: 'MDT_MEDICAL_REPORTS', create: 'MDT_MEDICAL_REPORTS', officers: 'Medics', officerJob: 'ems' },
    { label: 'EMS document', value: 11, view: 'MDT_MEDICAL_REPORTS', create: 'MDT_MEDICAL_REPORTS', officers: 'Medics', officerJob: 'ems' },
    { label: 'EMS high command document', value: 12, view: 'SAFD_HIGH_COMMAND', create: 'SAFD_HIGH_COMMAND', officers: 'Medics', officerJob: 'ems' },
    { label: 'Trial findings (public)', value: 20, create: 'DOJ_TRIAL_FINDINGS_CREATE', officers: 'Judges', officerJob: 'government' },
    { label: 'Judge private document', value: 21, view: 'MDT_JUDGE_REPORTS', create: 'MDT_JUDGE_REPORTS', officers: 'Judges', officerJob: 'government' },
    { label: 'DOJ document', value: 22, view: 'DOJ_DOCUMENTS_VIEW', create: 'DOJ_DOCUMENTS_CREATE', officers: 'Judges', officerJob: 'government', attorney: true },
    { label: "DA's office report", value: 25, view: 'MDT_DA_REPORTS', create: 'MDT_DA_REPORTS', officers: 'Prosecutors', officerJob: 'government' },
    { label: 'Public defender report', value: 26, view: 'MDT_PUBDEFENDER_REPORTS', create: 'MDT_PUBDEFENDER_REPORTS', officers: 'Public defenders', officerJob: 'government' },
    { label: 'DOC report', value: 30, view: 'DOC_REPORTS_VIEW', create: 'DOC_REPORTS_CREATE', officers: 'Officers', officerJob: 'prison', evidence: true },
    { label: 'DOC document', value: 31, view: 'DOC_DOCUMENTS_VIEW', create: 'DOC_DOCUMENTS_CREATE', officers: 'Officers', officerJob: 'prison' },
];

export const reportType = (v) => ReportTypes.find((r) => r.value == v);
export const reportTypeLabel = (v) => reportType(v)?.label ?? 'Report';

export const ChargeTypes = [
    { label: 'Infraction', value: 1, tone: 'info' },
    { label: 'Misdemeanour', value: 2, tone: 'warning' },
    { label: 'Felony', value: 3, tone: 'error' },
];
export const chargeType = (v) => ChargeTypes.find((t) => t.value == v) ?? { label: 'Charge', tone: 'default' };

export const VehicleTypes = ['Car', 'Boat', 'Aircraft'];

export const PropertyTypes = { house: 'House', office: 'Office', warehouse: 'Warehouse' };

export const PleaTypes = [
    { label: 'Guilty', value: 'guilty' },
    { label: 'Not guilty', value: 'not-guilty' },
    { label: 'No contest', value: 'no-contest' },
    { label: 'Unknown', value: 'unknown' },
];
export const pleaLabel = (v) => PleaTypes.find((p) => p.value == v)?.label ?? 'Unknown';

export const ReductionTypes = [
    { label: 'No reduction', value: '' },
    { label: 'Reduce jail time', value: 'months' },
    { label: 'Reduce fine', value: 'fine' },
];
export const ParoleMultiplier = 1.5;

export const EvidenceTypes = [
    { label: 'Photo', value: 'photo' },
    { label: 'Casing', value: 'casing' },
    { label: 'Projectile', value: 'projectile' },
    { label: 'Weapon', value: 'weapon' },
    { label: 'Paint fragment', value: 'fragment' },
    { label: 'Other', value: 'other' },
];
export const evidenceLabel = (v) => EvidenceTypes.find((e) => e.value == v)?.label ?? 'Other';

export const VehicleFlagTypes = [
    { label: 'Stolen vehicle', value: 'stolen', tone: 'error', radar: true },
    { label: 'Suspended registration', value: 'suspended', tone: 'warning' },
    { label: 'BOLO', value: 'BOLO', tone: 'error', radar: true },
    { label: 'History of evasion', value: 'evasion', tone: 'error' },
    { label: 'Suspected organised crime', value: 'oc', tone: 'error' },
];
export const vehicleFlag = (v) => VehicleFlagTypes.find((f) => f.value === v) ?? { label: v || 'Flag', tone: 'error' };

export const FirearmFlagTitles = ['Stolen', 'Seized', 'Flagged', 'Destroyed by police'];

export const BOLOTypes = [
    { label: 'Person', value: 'user' },
    { label: 'Vehicle', value: 'car' },
];
export const boloType = (v) => BOLOTypes.find((b) => b.value == v)?.label ?? 'Other';

export const WarrantStates = [
    { label: 'Active', value: 'active', tone: 'error' },
    { label: 'Served', value: 'served', tone: 'success' },
    { label: 'Expired', value: 'expired', tone: 'default' },
    { label: 'Void', value: 'void', tone: 'default' },
];
export const warrantState = (v) => WarrantStates.find((w) => w.value == v) ?? { label: 'Unknown', tone: 'default' };

export const UnitTypes = {
    car: 'Ground unit',
    motorcycle: 'Motorcycle unit',
    air1: 'Air unit',
    bus: 'Ambulance',
    lifeflight: 'Life flight',
    heat: 'Heat unit',
    'truck-tow': 'Tow truck',
};

export const UnitTypeOptions = {
    police: ['car', 'heat', 'motorcycle', 'air1'],
    ems: ['bus', 'car', 'lifeflight'],
};

/** Licence keys from character.Licenses, in a readable order. */
export const LicenceNames = { Drivers: 'Driver licence', Weapons: 'Weapons licence', Hunting: 'Hunting licence', Fishing: 'Fishing licence', Pilot: 'Pilot licence', Drift: 'Drift licence' };
export const licenceName = (k) => LicenceNames[k] ?? `${k} licence`;
