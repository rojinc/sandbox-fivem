import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNuiEvent, fetchNui } from '@sandbox/ui-kit';
import { connectAlerts, disconnectAlerts, alertsApi } from '../../features/alerts/socket.js';

/**
 * Bridges Lua alert messages to the socket. Renders nothing.
 * - ALERTS_WS_CONNECT    -> open the socket with the url/token Lua gave us
 * - ALERTS_WS_DISCONNECT -> close it
 * - ALERTS_UPDATE_PURSUIT_MODE / ALERTS_UPDATE_RADIO_CHANNEL -> forward to the server
 * - ADD_ALERT (client-only alert) -> ask Lua to play the sound / add the blip
 */
export default function AlertsEffects() {
    const connection = useSelector((s) => s.alerts.connection);

    useEffect(() => {
        if (connection?.url && connection?.token) connectAlerts(connection.url, connection.token);
        return () => {
            if (connection?.url) disconnectAlerts();
        };
    }, [connection]);

    useNuiEvent('ALERTS_WS_DISCONNECT', () => disconnectAlerts());
    useNuiEvent('LOGOUT', () => disconnectAlerts());
    useNuiEvent('ALERTS_UPDATE_PURSUIT_MODE', (d) => alertsApi.changePursuitMode(d?.mode ?? null));
    useNuiEvent('ALERTS_UPDATE_RADIO_CHANNEL', (d) => alertsApi.changeRadioChannel(d?.channel ?? null));
    useNuiEvent('ADD_ALERT', (d) => {
        if (d?.alert?.client) fetchNui('ReceiveAlert', d.alert).catch(() => {});
    });

    return null;
}
