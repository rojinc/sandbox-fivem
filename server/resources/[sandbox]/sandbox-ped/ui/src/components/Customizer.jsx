import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { Panel, PanelHeader, Tag, fetchNui, useKey } from '@sandbox/ui-kit';
import { MODES, CATEGORIES } from '../data/modes.js';
import { hide, navigate } from '../features/app/reducer.js';
import { formatMoney } from '../lib/format.js';
import { useThrottledSend } from '../hooks/useThrottledSend.js';
import { Rail } from './layout/Rail.jsx';
import { Footer } from './layout/Footer.jsx';
import { CameraDock } from './layout/CameraDock.jsx';
import { HelpTip } from './layout/HelpTip.jsx';
import { ConfirmDialog } from './layout/ConfirmDialog.jsx';
import { CatalogLoader } from './CatalogLoader.jsx';
import { SCREENS } from './screens/index.js';

/**
 * The customisation session for one SET_STATE value: side panel with the
 * category rail, section tabs, scrolling controls and the save/cancel footer,
 * plus the camera dock and key hints over the game.
 */
export function Customizer({ modeKey }) {
    const mode = MODES[modeKey];
    const dispatch = useDispatch();
    const nav = useSelector((s) => s.app.nav);
    const pricing = useSelector((s) => s.app.pricing);
    const busy = useSelector((s) => s.app.busy);

    const category = mode.categories.includes(nav.category) ? nav.category : mode.categories[0];
    const screen = SCREENS[category];
    const sections = screen.sections ? screen.sections(modeKey) : null;
    const section = sections ? Math.min(Math.max(nav.section, 0), sections.length - 1) : 0;
    const price = Number(pricing?.[mode.priceKey]) || 0;

    const [dialog, setDialog] = useState(null); // 'save' | 'cancel' | null
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const scrollRef = useRef(null);

    // Mouse wheel over the game zooms the camera; over the panel it scrolls.
    useEffect(() => {
        const onWheel = (e) => {
            if (e.target instanceof Element && e.target.closest('[data-nui-interactive]')) return;
            fetchNui('Zoom', { zoom: e.deltaY / 2000 });
        };
        window.addEventListener('wheel', onWheel, { passive: true });
        return () => window.removeEventListener('wheel', onWheel);
    }, []);

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: 0 });
    }, [category, section]);

    const rotate = useThrottledSend((cb) => fetchNui(cb), 50);
    useKey(['q', 'Q'], () => rotate.push('RotateLeft'));
    useKey(['e', 'E'], () => rotate.push('RotateRight'));
    useKey(['r', 'R'], () => fetchNui('Animation'), { event: 'keyup' });
    useKey('Escape', () => {
        if (saving) return;
        if (dialog) setDialog(null);
        else setDialog(mode.canCancel ? 'cancel' : 'save');
    });

    const onSave = async () => {
        setSaving(true);
        setError(null);
        let ok = false;
        try {
            ok = await fetchNui('Save');
        } catch (e) {
            ok = false;
        }
        if (ok) {
            setDialog(null);
            dispatch(hide());
            return;
        }
        setSaving(false);
        setDialog(null);
        setError(mode.canCancel ? 'Payment failed — you may not have enough cash.' : 'Could not save the character. Try again.');
    };

    const onCancel = () => {
        setDialog(null);
        dispatch(hide());
        fetchNui('Cancel');
    };

    const Screen = screen.Component;
    const priceLabel = price > 0 ? formatMoney(price) : 'Free';

    return (
        <>
            <CatalogLoader />
            <Panel
                data-nui-interactive="true"
                className="sb-anim-rise"
                padding={0}
                sx={{ position: 'absolute', left: 24, top: 24, bottom: 24, width: 476, display: 'flex', overflow: 'hidden', pointerEvents: 'auto' }}
            >
                <Rail
                    categories={mode.categories}
                    active={category}
                    onSelect={(c) => {
                        if (c === category) return;
                        fetchNui('FrontEndSound', { sound: 'SELECT' });
                        dispatch(navigate(c, 0));
                    }}
                />
                <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ px: 2, pt: 2 }}>
                        <PanelHeader
                            icon={mode.icon}
                            title={mode.title}
                            subtitle={`${CATEGORIES[category].label} · changes preview live on your character`}
                            actions={
                                <Tag tone={price > 0 ? 'warning' : 'success'} icon="money-bill">
                                    {priceLabel}
                                </Tag>
                            }
                            sx={{ mb: sections ? 0.5 : 0.25, pb: sections ? 1 : 1.5 }}
                        />
                        {sections && (
                            <Tabs
                                value={section}
                                onChange={(e, v) => dispatch(navigate(category, v))}
                                variant="fullWidth"
                                sx={{ mx: -0.5, minHeight: 36, '& .MuiTab-root': { minHeight: 36, minWidth: 0, px: 1 } }}
                            >
                                {sections.map((label) => (
                                    <Tab key={label} label={label} />
                                ))}
                            </Tabs>
                        )}
                    </Box>
                    <Box ref={scrollRef} sx={{ flex: 1, minHeight: 0, overflowY: 'auto', px: 2, py: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        <Screen key={`${category}-${section}`} modeKey={modeKey} section={section} />
                    </Box>
                    <Footer mode={mode} price={price} busy={busy} saving={saving} error={error} onCancel={() => setDialog('cancel')} onSave={() => setDialog('save')} />
                </Box>
            </Panel>

            <CameraDock />
            <HelpTip canCancel={mode.canCancel} />

            <ConfirmDialog
                open={dialog === 'save'}
                title={mode.canCancel ? 'Save changes?' : 'Create this character?'}
                confirmLabel={mode.canCancel ? (price > 0 ? `Pay ${priceLabel}` : 'Save') : 'Create'}
                confirmIcon="check"
                busy={saving}
                onConfirm={onSave}
                onCancel={() => setDialog(null)}
            >
                {mode.canCancel ? (
                    <span>
                        {price > 0 ? `You will be charged ${priceLabel}. ` : ''}
                        Your character keeps everything you changed here.
                    </span>
                ) : (
                    <>
                        <span>Some of these choices cannot be changed later.</span>
                        <span>Make sure you are happy with your character before you continue.</span>
                    </>
                )}
            </ConfirmDialog>
            <ConfirmDialog
                open={dialog === 'cancel'}
                title="Discard changes?"
                confirmLabel="Discard"
                confirmIcon="xmark"
                cancelLabel="Keep editing"
                tone="danger"
                onConfirm={onCancel}
                onCancel={() => setDialog(null)}
            >
                <span>Everything you changed will be reverted and you will not be charged.</span>
            </ConfirmDialog>
        </>
    );
}
