**Obex Camera Pipeline: Discovery → RTSP URL → Playback**
Architecture in one sentence
The phone does ONVIF discovery and verification directly (steps 1–4) because that has to happen on a device physically on the camera's LAN — but once a camera is registered, the phone's only remaining job is to display a stream URL the backend hands it. It never runs, starts, or stops any relay itself. A separate edge device (a Pi or similar, permanently on the camera's LAN) owns that job.

Step 1 — App loads, user starts "Add Camera"
Confirm the phone is on Wi-Fi before attempting discovery — WS-Discovery is UDP multicast and silently fails over cellular.

Step 2 — WS-Discovery (auto-discovery)
Native (platform-specific) code sends a WS-Discovery Probe:

Destination: UDP multicast 239.255.255.250:3702 (fixed ONVIF discovery address/port)
Body: SOAP envelope with <Types>dn:NetworkVideoTransmitter</Types>
Two easy-to-miss requirements on Android: acquire a Wi-Fi multicast lock (multicast is dropped on Wi-Fi by default), and bind the socket to the Wi-Fi network explicitly (not just "default network") so the probe doesn't leak out another interface.
Collect ProbeMatch replies for ~5s, extract each <XAddrs>, dedupe by IP, return { ip, port }[] — port here is the ONVIF device-service port (often 80), not the RTSP port.
Always provide a manual IP-entry fallback — some networks (isolated VLANs, multicast disabled) never get a reply.

Step 3 — Collect credentials
Name, ONVIF username/password, and which location/site this camera belongs to. No network calls yet.

Step 4 — ONVIF verification (SOAP over HTTP, gets you the RTSP URL)
Against http://<ip>:<port>/onvif/device_service, in order:

GetSystemDateAndTime — unauthenticated first; used only to compute clock offset for WS-Security timestamps later.
GetCapabilities (<Category>All</Category>) → parse <Media><XAddr>, the media service URL.
GetProfiles (against the media service URL) → take the first <Profiles token="...">.
GetStreamUri:

<GetStreamUri xmlns="http://www.onvif.org/ver10/media/wsdl">
  <StreamSetup>
    <Stream xmlns="http://www.onvif.org/ver10/schema">RTP-Unicast</Stream>
    <Transport xmlns="http://www.onvif.org/ver10/schema"><Protocol>RTSP</Protocol></Transport>
  </StreamSetup>
  <ProfileToken>{profileToken}</ProfileToken>
</GetStreamUri>
→ response <Uri> (e.g. rtsp://192.168.1.42:554/onvif1) — parse out port (default 554) and path. This is the actual payoff of steps 1–4.
Auth: WS-Security UsernameToken with PasswordDigest = base64(SHA-1(nonce + timestamp + password)) on every call after the first. Map failures to unreachable / unauthorized / unsupported for the UI.

Scope note: Profile S / Media1 only — Profile T / Media2 cameras need a different GetProfiles/GetStreamUri shape.

Step 5 — Register the camera, assigned to an edge device

POST /cameras
{ name, locationId, edgeDeviceId, ip, username, password, rtspPath, localPort }
edgeDeviceId is new here versus the naive version of this flow — every camera belongs to exactly one edge device (the one physically on its LAN), decided at registration time (the app already knows which edge device it's pairing against, since that's presumably how the user got this far). This is what lets the edge device later ask "which cameras am I responsible for?"

Step 6 — Backend constructs both possible URLs

streamUrl = rtsp://{user}:{pass}@{localIp}:{localPort}{rtspPath} -- always returned
remoteStreamUrl = rtsp://{user}:{pass}@{relayAddr}:{relayPort}{rtspPath} -- only when the camera's edge device is currently online
remoteStreamUrl's availability is a direct reflection of edge device liveness (see heartbeat, below) — not anything the viewing phone did, and not a "someone tapped start" flag. Multiple phones can view the same camera's remoteStreamUrl simultaneously; none of them owns or affects the relay.

Step 7 — Client picks which URL to use

sameNetwork = (my IP's first 3 octets) == (camera's localIp's first 3 octets)
effectiveUrl = sameNetwork ? streamUrl : remoteStreamUrl
That's the entire client-side decision. No "am I the one relaying" state, no start/stop action, no toggle UI — just "which of these two URLs, if any, is currently usable."

Step 8 — Playback
react-native-vlc-media-player (genuine libVLC, not a relabeled <video> tag):

<VLCPlayer
source={{ uri: effectiveUrl, initOptions: ['--network-caching=150', '--rtsp-caching=150', '--rtsp-tcp'] }}
paused={paused}
onError={...}
onStopped={...}
/>
--rtsp-tcp — forces RTSP-over-TCP, much more reliable through NAT/relays.
Slightly higher caching for the relayed (remote) case than the direct-LAN case.
Implement your own stall watchdog: libVLC's onError/onStopped don't reliably fire on a silent relay drop. Track last-progress time via onProgress; if stale past ~6s, force a full player remount (bump a key prop) to reconnect.

**Backend Requirements for the Camera Pipeline**
Data model
Table Fields Notes
EdgeDevice id, userId, name, authTokenHash, lastSeenAt one per physical relay device (Pi). lastSeenAt drives liveness.
Camera id, userId, locationId, edgeDeviceId (fk), localIp, localPort, rtspPath, rtspUsername, rtspPassword (encrypted), status edgeDeviceId is required — every camera is owned by exactly one relay device.
Tunnel/relay config per-camera remotePort + shared secret, or equivalent for whatever relay tech you pick only needed if remote viewing is in scope
Endpoints — phone-facing (user auth)
POST /cameras — create, as in Step 5.
GET /cameras, GET /cameras/:id — return streamUrl always, remoteStreamUrl only when the camera's edgeDevice.lastSeenAt is within your liveness window (e.g. last 90s).
PATCH /cameras/:id, DELETE /cameras/:id — standard, ownership-checked.
No stream/start / stream/stop endpoints — there's nothing for the phone to start or stop.

Endpoints — edge-device-facing (device auth, separate from user auth)
Device pairing/registration — however a Pi gets its authTokenHash provisioned (e.g. a one-time pairing code shown in the app, exchanged for a long-lived device token). Don't skip this and reuse a user's personal login token as a device credential.
GET /devices/me/cameras — the edge device asks "which cameras am I responsible for," authenticated as itself. This is what lets a Pi self-configure instead of being hand-edited per device.
GET /cameras/:id/tunnel-config — returns whatever the relay client needs to connect (relay server address/port, this camera's assigned remote port, shared token), for cameras owned by the calling device only.
POST /devices/me/heartbeat — the edge device pings this periodically (e.g. every 30–60s); updates lastSeenAt. This single field is what gates every camera's remoteStreamUrl — no separate per-camera "is this stream live" concept needed.
This design deliberately resolves the ambiguity Obex's own current backend hasn't settled yet (phone-triggered start/stop vs. always-on) — go straight to the heartbeat-driven model above; it's simpler and matches an edge device that's physically always there.

Security requirements — explicit ask for the backend person
Encrypt rtspPassword at rest — AES-256-GCM (or equivalent), key from a server-only secret, decrypted only at the moment of building a streamUrl.
Never return the raw password in any API response — only the finished URL with credentials embedded.
Never log a constructed RTSP URL — it carries live credentials in plaintext; scrub it from request/error logs.
Scope every camera query to ownership — a camera belonging to another user (or another edge device) should 404, not 403, to avoid confirming its existence.
Device tokens are not user tokens — mint a distinct, revocable credential per edge device at pairing time; don't let a Pi authenticate as if it were a logged-in user.
Rate/replay-protect the heartbeat and tunnel-config endpoints — they're hit by unattended hardware, not a human clicking through a UI, so make sure a stolen device token can't be used to enumerate other users' tunnel-config responses (scope strictly to that device's own assigned cameras, checked server-side on every call, not just at pairing time).
