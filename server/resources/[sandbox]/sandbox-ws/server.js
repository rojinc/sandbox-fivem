/**
 * sandbox-ws
 *
 * Hosts a Socket.IO server that external tools (for example the MDT alerts web
 * page) connect to. Access is gated by short-lived JWTs that this resource
 * signs with a key pair generated at boot, so no secret is ever committed.
 *
 * Convars (set in a server cfg):
 *   WS_PORT         port to listen on                         (default 4002)
 *   WS_MDT_ALERTS   public URL handed to clients               (default http://localhost:<port>)
 *   WS_CORS_ORIGIN  allowed browser origin                      (default http://localhost:8080)
 *   WS_TLS_KEY      absolute path to a PEM private key          (optional, enables HTTPS)
 *   WS_TLS_CERT     absolute path to the matching PEM cert      (optional, enables HTTPS)
 *   WS_PRINT_TOKEN  "true" to print a development token at boot (default false)
 */
const crypto = require("crypto");
const fs = require("fs");
const https = require("https");
const jwt = require("jsonwebtoken");
const socket = require("socket.io");

const PORT = parseInt(GetConvar("WS_PORT", "4002"), 10) || 4002;
const PUBLIC_URL = GetConvar("WS_MDT_ALERTS", `http://localhost:${PORT}`);
const CORS_ORIGIN = GetConvar("WS_CORS_ORIGIN", "http://localhost:8080");
const TLS_KEY = GetConvar("WS_TLS_KEY", "");
const TLS_CERT = GetConvar("WS_TLS_CERT", "");
const PRINT_DEV_TOKEN = GetConvar("WS_PRINT_TOKEN", "false") === "true";

const useTls = Boolean(TLS_KEY && TLS_CERT);
let httpsServer = null;

if (useTls) {
  try {
    httpsServer = https.createServer({
      key: fs.readFileSync(TLS_KEY),
      cert: fs.readFileSync(TLS_CERT),
    });
  } catch (err) {
    console.error(`^1[sandbox-ws] Failed to read TLS material (${err.message}); falling back to HTTP^7`);
    httpsServer = null;
  }
}

const io = new socket.Server(httpsServer || PORT, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

if (httpsServer) {
  httpsServer.listen(PORT);
}

// The root namespace is never used; namespaces authenticate individually.
io.on("connection", (client) => client.disconnect());

// Fresh RS256 key pair per boot. Tokens only need to outlive a session.
const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048,
});

function generateSocketToken(namespace, data) {
  return jwt.sign({ namespace, ...data }, privateKey, {
    algorithm: "RS256",
    expiresIn: "1h",
  });
}

function verifySocketToken(namespace, token) {
  try {
    const res = jwt.verify(token, publicKey, { algorithms: ["RS256"] });
    if (res && res.namespace === namespace) return res;
  } catch (e) {
    // invalid or expired token
  }
  return undefined;
}

exports("emitServer", (namespace, event, ...data) => {
  io.of(namespace).serverSideEmit(event, ...data);
});

exports("emit", (namespace, event, ...data) => {
  io.of(namespace).emit(event, ...data);
});

exports("generateSocketToken", generateSocketToken);

on("Core:Shared:Ready", () => {
  setTimeout(() => {
    if (PRINT_DEV_TOKEN) {
      const token = generateSocketToken("mdt-alerts", {
        source: 99,
        job: "police",
        callsign: "101",
        development: true,
      });
      console.log("[sandbox-ws] Development token (source 99):", token);
    }

    console.log(
      `[sandbox-ws] Listening on ${PORT} (${httpsServer ? "HTTPS" : "HTTP"}), public URL: ${PUBLIC_URL}`
    );
  }, 10000);
});
