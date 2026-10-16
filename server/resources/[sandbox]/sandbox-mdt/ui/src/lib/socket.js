/**
 * Minimal Socket.IO v4 client over the browser WebSocket (no socket.io-client).
 *
 * Wire format (Engine.IO v4, websocket transport only, text frames only):
 *   server -> "0{sid,pingInterval,pingTimeout,...}"   engine open
 *   client -> "40/mdt-alerts,"                         join the namespace (socket.io CONNECT)
 *   server -> "40/mdt-alerts,{"sid":"..."}"            namespace joined
 *   server -> "44/mdt-alerts,{"message":"..."}"        namespace refused (connect_error)
 *   server -> "41/mdt-alerts,"                         namespace disconnect (e.g. bad token)
 *   server -> "2"  /  client -> "3"                    ping / pong (the server pings in v4)
 *   server -> "42/mdt-alerts,[event, ...args]"         event (an ack id may sit before the "[")
 *   client -> "42/mdt-alerts,[event, ...args]"         emit
 *   either -> "1"                                      engine close
 *
 * The handshake query carries the JWT: sandbox-ws reads socket.handshake.query.token.
 * Binary packets (45/46) and acks are not used by sandbox-ws and are ignored.
 *
 * `url` is what Lua sends (WS_MDT_ALERTS, default "http://localhost:4002/mdt-alerts"):
 * its origin is the server and a non-root path is the namespace, as socket.io-client's
 * io(url) reads it. A bare origin joins `defaultNamespace`.
 */
export function parseSocketUrl(url, defaultNamespace = '/mdt-alerts') {
    const u = new URL(url);
    const protocol = u.protocol === 'https:' || u.protocol === 'wss:' ? 'wss:' : 'ws:';
    let path = u.pathname.replace(/\/+$/, '');
    let namespace = defaultNamespace;
    if (path && path !== '/socket.io') namespace = path;
    return { endpoint: `${protocol}//${u.host}/socket.io/`, namespace };
}

export function createSocket(url, { token, namespace: nsOverride, onStatus } = {}) {
    const { endpoint, namespace: nsFromUrl } = parseSocketUrl(url);
    const namespace = nsOverride ?? nsFromUrl;
    const prefix = namespace === '/' ? '' : `${namespace},`;
    const listeners = new Map();

    let ws = null;
    let closedByUser = false;
    let joined = false;
    let attempt = 0;
    let retryTimer = null;
    let heartbeatTimer = null;
    let pingWindow = 45000;

    const status = (s) => onStatus?.(s);

    function fire(event, args) {
        for (const fn of listeners.get(event) ?? []) {
            try {
                fn(...args);
            } catch (err) {
                console.error(`[mdt-alerts] handler for ${event} failed`, err);
            }
        }
    }

    function armHeartbeat() {
        clearTimeout(heartbeatTimer);
        // No ping within pingInterval + pingTimeout: the link is dead, reconnect.
        heartbeatTimer = setTimeout(() => ws?.close(), pingWindow);
    }

    function scheduleReconnect() {
        if (closedByUser || retryTimer) return;
        attempt += 1;
        const base = Math.min(30000, 1000 * 2 ** Math.min(attempt - 1, 5));
        const delay = Math.round(base * (0.75 + Math.random() * 0.5));
        status('offline');
        retryTimer = setTimeout(() => {
            retryTimer = null;
            open();
        }, delay);
    }

    function handlePacket(raw) {
        // "<type>[/<namespace>,]<body>": keep packets for our namespace only.
        const type = raw[0];
        let rest = raw.slice(1);
        let ns = '/';
        if (rest[0] === '/') {
            const comma = rest.indexOf(',');
            ns = comma < 0 ? rest : rest.slice(0, comma);
            rest = comma < 0 ? '' : rest.slice(comma + 1);
        }
        if (ns !== namespace) return;
        const body = rest;
        switch (type) {
            case '0': // CONNECT ack
                joined = true;
                attempt = 0;
                status('connected');
                fire('connect', []);
                break;
            case '1': // DISCONNECT from the server
                joined = false;
                fire('disconnect', ['io server disconnect']);
                ws?.close();
                break;
            case '2': {
                // EVENT: optional ack id, then a JSON array
                const start = body.indexOf('[');
                if (start < 0) return;
                let payload;
                try {
                    payload = JSON.parse(body.slice(start));
                } catch {
                    return;
                }
                if (!Array.isArray(payload) || typeof payload[0] !== 'string') return;
                fire(payload[0], payload.slice(1));
                break;
            }
            case '4': {
                // CONNECT_ERROR
                let err = {};
                try {
                    err = JSON.parse(body || '{}');
                } catch {
                    /* keep empty */
                }
                fire('connect_error', [err]);
                ws?.close();
                break;
            }
            default:
                break;
        }
    }

    function onMessage(event) {
        const data = typeof event.data === 'string' ? event.data : '';
        if (!data) return;
        switch (data[0]) {
            case '0': {
                // engine open: join our namespace
                try {
                    const info = JSON.parse(data.slice(1));
                    pingWindow = (Number(info.pingInterval) || 25000) + (Number(info.pingTimeout) || 20000);
                } catch {
                    /* defaults */
                }
                armHeartbeat();
                ws.send(`40${prefix}`);
                break;
            }
            case '2': // ping
                armHeartbeat();
                ws.send(`3${data.slice(1)}`);
                break;
            case '1': // engine close
                ws.close();
                break;
            case '4': // socket.io packet
                handlePacket(data.slice(1));
                break;
            default:
                break; // 3 pong, 5 upgrade, 6 noop
        }
    }

    function open() {
        if (closedByUser) return;
        status('connecting');
        const query = new URLSearchParams({ EIO: '4', transport: 'websocket' });
        if (token) query.set('token', token);
        let socket;
        try {
            socket = new WebSocket(`${endpoint}?${query.toString()}`);
        } catch (err) {
            console.error('[mdt-alerts] cannot open socket', err);
            scheduleReconnect();
            return;
        }
        ws = socket;
        socket.onmessage = onMessage;
        socket.onclose = () => {
            if (ws !== socket) return;
            clearTimeout(heartbeatTimer);
            const wasJoined = joined;
            joined = false;
            ws = null;
            if (wasJoined) fire('disconnect', ['transport close']);
            scheduleReconnect();
        };
        socket.onerror = () => {
            /* onclose follows and schedules the retry */
        };
    }

    open();

    return {
        get connected() {
            return joined;
        },
        on(event, fn) {
            if (!listeners.has(event)) listeners.set(event, new Set());
            listeners.get(event).add(fn);
            return () => listeners.get(event)?.delete(fn);
        },
        /** Emit an event; returns false (and drops it) while not joined. */
        emit(event, ...args) {
            if (!joined || !ws || ws.readyState !== 1) return false;
            ws.send(`42${prefix}${JSON.stringify([event, ...args])}`);
            return true;
        },
        close() {
            closedByUser = true;
            clearTimeout(retryTimer);
            clearTimeout(heartbeatTimer);
            retryTimer = null;
            listeners.clear();
            if (ws) {
                try {
                    if (joined && ws.readyState === 1) ws.send(`41${prefix}`);
                    ws.close();
                } catch {
                    /* already closed */
                }
            }
            ws = null;
            joined = false;
            status('idle');
        },
    };
}
