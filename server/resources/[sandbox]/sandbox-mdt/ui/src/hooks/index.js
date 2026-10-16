import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { resolveRole } from '../lib/nav.js';
import sealSA from '../assets/seals/seal.webp';
import sealDOJ from '../assets/seals/doj_seal.webp';
import sealLS from '../assets/seals/ls_seal.webp';
import sealSAST from '../assets/seals/SAST.webp';
import sealBCSO from '../assets/seals/bcso_seal.webp';
import sealGuardius from '../assets/seals/guardius2.webp';
import sealMedical from '../assets/seals/MedicalServices.webp';
import sealDOC from '../assets/seals/corrections.webp';

export const useUser = () => useSelector((s) => s.app.user);
export const useGovJob = () => useSelector((s) => s.app.govJob);

/** hasPerm(permission, allowSysAdmin=true); hasPerm(true) = system admin only. */
export function usePermissions() {
    const permissions = useSelector((s) => s.app.govJobPermissions);
    const user = useSelector((s) => s.app.user);
    return useCallback(
        (permission, allowSysAdmin = true) => {
            if (!permission) return true;
            if (permission === true) return Boolean(user?.MDTSystemAdmin);
            return Boolean(permissions?.[permission]) || (allowSysAdmin && Boolean(user?.MDTSystemAdmin));
        },
        [permissions, user],
    );
}

export function useHasJob() {
    const myJob = useGovJob();
    return useCallback(
        (job, workplace = null) => Boolean(job && myJob?.Id === job && (!workplace || myJob?.Workplace?.Id === workplace)),
        [myJob],
    );
}

export function useQualifications() {
    const user = useUser();
    return useCallback((q) => Boolean(q && user?.Qualifications?.includes(q)), [user]);
}

export function useRole() {
    const govJob = useGovJob();
    const attorney = useSelector((s) => s.app.attorney);
    const prison = useSelector((s) => s.data.data.prison);
    return resolveRole({ govJob, attorney, prison });
}

/** Format "(123) J. Doe [SID] (You)". */
export function usePerson() {
    const user = useUser();
    return useCallback(
        (first, last, callsign = false, SID, displaySID = false, showFullName = true) => {
            if (!first || !last) return 'Unknown';
            const name = `${showFullName ? first : `${first[0]}.`} ${last}`;
            let value = callsign ? `(${callsign}) ${name}` : name;
            if (SID && displaySID) value += ` [${SID}]`;
            if (SID && user && SID === user.SID) value += ' (You)';
            return value;
        },
        [user],
    );
}

export function useSeal() {
    const govJob = useGovJob();
    const attorney = useSelector((s) => s.app.attorney);
    if (attorney && !govJob) return sealDOJ;
    switch (govJob?.Id) {
        case 'police':
            switch (govJob?.Workplace?.Id) {
                case 'lspd':
                    return sealLS;
                case 'bcso':
                    return sealBCSO;
                case 'sast':
                    return sealSAST;
                case 'guardius':
                    return sealGuardius;
                default:
                    return sealSA;
            }
        case 'prison':
            return sealDOC;
        case 'government':
            return sealDOJ;
        case 'ems':
            return sealMedical;
        default:
            return sealSA;
    }
}

/** Read/write one query-string key on the current (memory) location. */
export function useQueryParam(key) {
    const [params, setParams] = useSearchParams();
    const value = params.get(key);
    const set = useCallback(
        (next, extra = {}) => {
            setParams((prev) => {
                const n = new URLSearchParams(prev);
                if (next == null || next === '') n.delete(key);
                else n.set(key, String(next));
                for (const [k, v] of Object.entries(extra)) {
                    if (v == null || v === '') n.delete(k);
                    else n.set(k, String(v));
                }
                return n;
            });
        },
        [key, setParams],
    );
    return [value, set];
}

/** Re-render every `ms` so relative timestamps stay fresh. */
export function useTick(ms = 30000) {
    const [, setN] = useState(0);
    useEffect(() => {
        const i = setInterval(() => setN((n) => n + 1), ms);
        return () => clearInterval(i);
    }, [ms]);
}

/** Debounced callback with a stable identity. */
export function useDebounced(fn, delay) {
    const fnRef = useRef(fn);
    fnRef.current = fn;
    const timer = useRef(null);
    useEffect(() => () => clearTimeout(timer.current), []);
    return useCallback(
        (...args) => {
            clearTimeout(timer.current);
            timer.current = setTimeout(() => fnRef.current(...args), delay);
        },
        [delay],
    );
}

export function useIsHighCommand() {
    const hasPerm = usePermissions();
    return hasPerm('PD_HIGH_COMMAND') || hasPerm('SAFD_HIGH_COMMAND') || hasPerm('DOJ_JUDGE') || hasPerm('DOC_HIGH_COMMAND');
}
