import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import Slide from '@mui/material/Slide';
import { Icon, IconButton, RichText, fetchNui, useKey, colors } from '@sandbox/ui-kit';

function Row({ item, selected, onSelect, onAction, onHover }) {
    const clickable = !item.actions && (item.event || item.submenu);
    const disabled = Boolean(item.disabled);
    return (
        <Box
            role="menuitem"
            aria-disabled={disabled}
            onMouseEnter={onHover}
            onClick={clickable && !disabled ? onSelect : undefined}
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                px: '14px',
                py: '10px',
                minHeight: 44,
                cursor: clickable && !disabled ? 'pointer' : 'default',
                opacity: disabled ? 0.45 : 1,
                background: selected ? colors.surfaceHover : 'transparent',
                borderLeft: `2px solid ${selected ? colors.accent : 'transparent'}`,
                transition: 'background 120ms var(--sb-ease)',
            }}
        >
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box className="sb-truncate" sx={{ fontSize: 14, fontWeight: 500 }}>
                    {item.label}
                </Box>
                {item.description && (
                    <Box sx={{ fontSize: 12, color: colors.text2, mt: '2px', lineHeight: 1.35 }}>
                        <RichText text={item.description} component="div" />
                    </Box>
                )}
            </Box>
            {item.submenu && (
                <Box sx={{ color: colors.text3, fontSize: 12 }}>
                    <Icon icon="chevron-right" />
                </Box>
            )}
            {Array.isArray(item.actions) && (
                <Box sx={{ display: 'flex', gap: '2px' }}>
                    {item.actions.map((a, i) => (
                        <IconButton
                            key={i}
                            icon={a.icon}
                            label={a.label}
                            onClick={(e) => {
                                e.stopPropagation();
                                onAction(a.event);
                            }}
                        />
                    ))}
                </Box>
            )}
        </Box>
    );
}

/** Right-hand list menu with submenus (client/list.lua). */
export default function ListMenu() {
    const dispatch = useDispatch();
    const { showing, active, menus, stack } = useSelector((s) => s.list);
    const menu = active ? menus[active] : null;
    const items = useMemo(() => Object.values(menu?.items ?? {}), [menu]);
    const [cursor, setCursor] = useState(0);

    useEffect(() => setCursor(0), [active, showing]);

    const close = () => fetchNui('ListMenu:Close');
    const back = () => {
        fetchNui('ListMenu:Back');
        dispatch({ type: 'LIST_GO_BACK' });
    };
    const select = (item) => {
        if (!item || item.disabled) return;
        if (item.submenu) {
            fetchNui('ListMenu:SubMenu', { submenu: item.submenu });
            dispatch({ type: 'CHANGE_MENU', payload: { menu: item.submenu } });
        } else if (item.event) {
            fetchNui('ListMenu:Clicked', { event: item.event, data: item.data });
        }
    };
    const action = (item, event) => fetchNui('ListMenu:Clicked', { event, data: item.data });

    useKey('Escape', close, { enabled: showing });
    useKey('Backspace', () => (stack.length ? back() : null), { enabled: showing });
    useKey(['ArrowDown', 'ArrowUp'], (e) => {
        e.preventDefault();
        if (!items.length) return;
        setCursor((c) => (e.key === 'ArrowDown' ? (c + 1) % items.length : (c - 1 + items.length) % items.length));
    }, { enabled: showing });
    useKey('Enter', () => select(items[cursor]), { enabled: showing });

    return (
        <Slide direction="left" in={showing && Boolean(menu)} mountOnEnter unmountOnExit>
            <Box
                className="sb-glass-strong"
                sx={{
                    position: 'absolute',
                    right: '12vw',
                    top: '18vh',
                    width: 400,
                    maxHeight: '64vh',
                    display: 'flex',
                    flexDirection: 'column',
                    pointerEvents: 'auto',
                    overflow: 'hidden',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', px: '14px', py: '10px', borderBottom: `1px solid ${colors.border}` }}>
                    {stack.length > 0 && <IconButton icon="arrow-left" label="Back" onClick={back} />}
                    <Box className="sb-truncate" sx={{ flex: 1, fontSize: 15, fontWeight: 600 }}>
                        {menu?.label ?? 'Menu'}
                    </Box>
                    {menu?.headerAction?.event && (
                        <IconButton
                            icon={menu.headerAction.icon ?? 'ellipsis'}
                            label={menu.headerAction.label}
                            onClick={() => fetchNui('ListMenu:Clicked', { event: menu.headerAction.event, data: menu.headerAction.data })}
                        />
                    )}
                    <IconButton icon="xmark" label="Close" onClick={close} />
                </Box>
                <Box role="menu" sx={{ overflowY: 'auto', py: '4px' }}>
                    {items.map((item, i) => (
                        <Row
                            key={`${active}-${i}`}
                            item={item}
                            selected={i === cursor}
                            onHover={() => setCursor(i)}
                            onSelect={() => select(item)}
                            onAction={(event) => action(item, event)}
                        />
                    ))}
                    {!items.length && (
                        <Box sx={{ p: 3, textAlign: 'center', color: colors.text3, fontSize: 13 }}>Nothing here</Box>
                    )}
                </Box>
                <Box sx={{ display: 'flex', gap: '12px', px: '14px', py: '8px', borderTop: `1px solid ${colors.border}`, fontSize: 11, color: colors.text3 }}>
                    <span>↑↓ Navigate</span>
                    <span>Enter Select</span>
                    {stack.length > 0 && <span>Backspace Back</span>}
                    <span>Esc Close</span>
                </Box>
            </Box>
        </Slide>
    );
}
