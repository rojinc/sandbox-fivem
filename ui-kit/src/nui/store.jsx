import React, { useEffect } from 'react';
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import { isEnvBrowser } from './index.js';

/**
 * Build the store for a NUI.
 *
 * Every SendNUIMessage({ type, data }) from Lua is dispatched verbatim as a
 * Redux action { type, payload: {...data} } by <NuiBridge>, so reducers are
 * the contract between Lua and the interface: keep the message `type` names
 * and payload shapes stable and the UI can be rebuilt freely around them.
 *
 * @param {Record<string, Function>} reducers  slice name -> reducer
 * @param {object} [options]
 * @param {object} [options.preloadedState]
 */
export function createNuiStore(reducers, { preloadedState } = {}) {
    return configureStore({
        reducer: combineReducers(reducers),
        preloadedState,
        devTools: isEnvBrowser(),
        middleware: (getDefault) =>
            getDefault({
                serializableCheck: false,
                immutableCheck: false,
            }),
    });
}

/**
 * Forwards window 'message' events (SendNUIMessage) into the store.
 * Mount once, inside the <Provider>.
 *
 * @param {object} props
 * @param {(msg:{type:string,data:any}) => ({type:string,payload:any}|null)} [props.transform]
 *        optional hook to rewrite or drop a message before dispatch
 */
export function NuiBridge({ children = null, transform }) {
    const dispatch = useDispatch();

    useEffect(() => {
        const listener = (event) => {
            const msg = event.data;
            if (!msg || typeof msg !== 'object') return;
            const type = msg.type ?? msg.action;
            if (!type) return;

            let action = { type, payload: { ...(msg.data ?? {}) } };
            if (transform) {
                action = transform(msg);
                if (!action) return;
            }
            dispatch(action);
        };

        window.addEventListener('message', listener);
        return () => window.removeEventListener('message', listener);
    }, [dispatch, transform]);

    return children;
}
