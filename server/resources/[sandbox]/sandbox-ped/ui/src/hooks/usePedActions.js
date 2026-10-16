import { useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { fetchNui } from '@sandbox/ui-kit';

/**
 * One helper per NUI callback that changes the ped: updates the store for an
 * instant panel refresh and tells Lua, which applies it to the ped in-game.
 * Body shapes are exactly what client/nui.lua reads.
 */
export function usePedActions() {
    const dispatch = useDispatch();
    return useMemo(
        () => ({
            headBlend(face, type, value) {
                dispatch({ type: 'ped/headBlend', payload: { face, type, value } });
                fetchNui('SetPedHeadBlendData', { face, type, value });
            },
            faceFeature(index, value) {
                dispatch({ type: 'ped/faceFeature', payload: { index, value } });
                fetchNui('SetPedFaceFeature', { index, value });
            },
            overlay(type, extraType, value) {
                dispatch({ type: 'ped/overlay', payload: { type, extraType, value } });
                fetchNui('SetPedHeadOverlay', { type, extraType, value });
            },
            component(name, type, value) {
                dispatch({ type: 'ped/component', payload: { name, type, value } });
                fetchNui('SetPedComponentVariation', { name, type, value });
            },
            prop(name, type, value) {
                dispatch({ type: 'ped/prop', payload: { name, type, value } });
                fetchNui('SetPedPropIndex', { name, type, value });
            },
            hairColor(name, type, value) {
                dispatch({ type: 'ped/hairColor', payload: { name, type, value } });
                fetchNui('SetPedHairColor', { name, type, value });
            },
            hairOverlay(value) {
                dispatch({ type: 'ped/hairOverlay', payload: { value } });
                fetchNui('SetPedHairOverlay', { value });
            },
            eyeColor(value) {
                dispatch({ type: 'ped/eyeColor', payload: { value } });
                fetchNui('SetPedEyeColor', { value });
            },
            tattooAdd(zone) {
                dispatch({ type: 'ped/tattooAdd', payload: { type: zone } });
                fetchNui('AddPedTattoo', { type: zone });
            },
            tattooRemove(index) {
                dispatch({ type: 'ped/tattooRemove', payload: { index } });
                fetchNui('RemovePedTattoo', { index });
            },
            tattooSet(index, data) {
                dispatch({ type: 'ped/tattooSet', payload: { index, data } });
                fetchNui('SetPedTattoo', { index, data });
            },
            sound(sound) {
                fetchNui('FrontEndSound', { sound });
            },
        }),
        [dispatch],
    );
}
