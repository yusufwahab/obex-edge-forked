# Backend Integration Requirements — Mobile App

This document lists what the ObexEdge mobile app needs from the backend that either
doesn't exist yet, or exists but isn't enough to support the app's current design. It
was produced by auditing the live schema at `https://obex-edge-backend.onrender.com/openapi.json`
against every screen in the mobile app.

The target architecture for the camera pipeline (ONVIF discovery → verification →
registration → local/relayed playback) is specified in full in **`pipeline.md`** —
read that first for the *why* behind items 1–3 below. This document translates that
design into concrete additions against your *current* API shape (`/api/v1/` prefix,
camelCase JSON, `HTTPBearer` auth, `{message, data, total}` list envelopes) so it
slots into the existing codebase rather than introducing a second style.

The client is already built and waiting for these — see "What the client already
sends" under each item.

---

## Current state (context, not a request)

Confirmed live and working, for reference — no changes needed:

- Auth: `POST /api/v1/auth/{signup,login,otp/generate,otp/verify}`, org creation/lookup,
  `GET /api/v1/auth/users/{user_id}`.
- Alerts: `POST /api/v1/alerts/submit`, `GET /api/v1/alerts/{recent,stats,supported-types,type/{alert_type},{alert_id}}`,
  `DELETE /api/v1/alerts/{alert_id}`.
- Cameras (flat, no relay): `POST /api/v1/cameras/create`, `GET /api/v1/cameras/`,
  `GET/PUT/DELETE /api/v1/cameras/{camera_id}`.
- Devices (**vehicles**, not edge/relay devices): `POST /api/v1/devices/register`,
  `GET /api/v1/devices/`, `GET/PUT/DELETE /api/v1/devices/{device_id}` — fields are
  `deviceId`, `vehicleMake`, `vehicleModel`. Not currently used by any screen — see
  Open Question 1.

---

## 1. Edge device (relay) pairing + lifecycle — highest priority

**Why:** Per `pipeline.md`, a camera's remote/relayed stream depends on a physical
relay device (a Pi or similar) that's always on the camera's LAN. The phone never
runs a relay itself — it just needs to know whether a camera's assigned relay is
currently online, and get a stream URL if so. None of this exists today; the current
`/api/v1/devices/*` endpoints are for vehicles, not relays.

**What's needed — new resource, `EdgeDevice`:**

```
id              string (UUID)
userId          string
name            string
authTokenHash   string   — device's own long-lived credential, distinct from user JWTs
lastSeenAt      datetime — updated by the heartbeat endpoint below; gates remoteStreamUrl
createdAt       datetime
```

**New phone-facing endpoints (user auth, same `HTTPBearer` pattern as everything else):**

| Method | Path | Body / Response |
|---|---|---|
| `POST` | `/api/v1/edge-devices/register` | Some pairing flow — e.g. the app shows a one-time pairing code, the Pi is provisioned with it, backend exchanges it for a device token. **Needs your input on the exact UX** — the client doesn't currently assume a specific mechanism, just that one exists. |
| `GET` | `/api/v1/edge-devices/` | List the user's edge devices — `{message, data: [EdgeDevice], total}`, matching your existing list envelope. |
| `GET` / `DELETE` | `/api/v1/edge-devices/{id}` | Standard CRUD, ownership-scoped. |

**New device-facing endpoints (a *separate* auth scheme — the edge device's own token,
never a user's JWT):**

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/v1/edge-devices/me/cameras` | The Pi asks "which cameras am I responsible for" — lets it self-configure instead of being hand-edited. |
| `GET` | `/api/v1/cameras/{camera_id}/tunnel-config` | Whatever the relay client needs to connect (relay server address/port, this camera's assigned remote port, shared token) — for cameras owned by the calling device only. |
| `POST` | `/api/v1/edge-devices/me/heartbeat` | Called every 30–60s by the Pi; updates `lastSeenAt`. This single field is what gates every camera's `remoteStreamUrl` — no separate per-camera "is this stream live" flag needed. |

**Security requirements (from `pipeline.md`, repeated here since they're easy to
miss when this gets built incrementally):**
- Device tokens are **not** user tokens — mint a distinct, revocable credential per
  edge device at pairing time.
- Rate/replay-protect `heartbeat` and `tunnel-config` — they're hit by unattended
  hardware, so a stolen device token must not be usable to enumerate other users'
  tunnel configs. Scope strictly to that device's own assigned cameras, checked
  server-side on every call.
- No `stream/start` / `stream/stop` endpoints — there's nothing for the phone to
  start or stop. The phone is a pure viewer.

**What the client already sends:** `AddCameraScreen.js` already collects and sends
`edgeDeviceId` on every `POST /api/v1/cameras/create` call (see item 2) — currently a
free-text field the installer types in, since there's no pairing flow yet to pick
from. It'll switch to a picker calling `GET /api/v1/edge-devices/` the moment that
endpoint exists — no other client changes needed.

---

## 2. Camera schema needs 4 more fields + the local/remote URL split

**Why:** `pipeline.md` requires the backend to build two URLs per camera — one direct
(LAN), one relayed — and let the client pick. The current `CameraData` schema only has
a single flat `rtspUrl`.

**`CameraCreate` request — needs these additional fields** (all sent by the client
today; currently silently dropped since they're not in your Pydantic model):

```
locationId    string | null   — see item 3
edgeDeviceId  string           — required once item 1 exists; FK to EdgeDevice
onvifPort     integer          — the ONVIF device-service port (not the RTSP port —
                                  already resolved by the client's own ONVIF
                                  verification step, just needs a place to persist)
profileToken  string           — the ONVIF media profile token, needed if the backend
                                  or edge device ever needs to re-resolve/re-verify the
                                  stream later without re-running discovery
```

**`CameraData` response — needs to become:**

```
id, cameraName, ipAddress, username, port, path,   ← unchanged
userId, organizationId, createdAt,                  ← unchanged
locationId       string | null
edgeDeviceId     string
localIp          string          — same as ipAddress today, but explicit naming
                                    matters once remoteStreamUrl exists too, so the
                                    client can compare "am I on this /24" against it
localPort        integer
streamUrl        string           — rtsp://{user}:{pass}@{localIp}:{localPort}{path},
                                     always returned (same as today's `rtspUrl`)
remoteStreamUrl  string | null    — rtsp://{user}:{pass}@{relayAddr}:{relayPort}{path},
                                     only populated while
                                     edgeDevice.lastSeenAt is within your liveness
                                     window (suggest 90s, per pipeline.md)
```

**Security requirement:** encrypt the RTSP password at rest (AES-256-GCM or
equivalent, server-only key), decrypt only at the moment of building `streamUrl`/
`remoteStreamUrl`. Never return the raw password on its own in any response — only
ever embedded in the finished URL. Never log a constructed RTSP URL (it carries live
credentials). Scope every camera query to ownership — a camera belonging to another
user should 404, not 403, to avoid confirming its existence.

**What the client already does:** `CameraPlayerScreen.js` already computes
`sameNetwork` (comparing its own IP's first three octets against `camera.localIp`)
and picks `streamUrl` vs `remoteStreamUrl` accordingly, with `--rtsp-tcp` forced and
higher VLC caching for the remote case. Right now it falls back to the flat `rtspUrl`
because that's all that exists — it'll pick up the real split automatically the
moment `CameraData` returns those fields, no client changes needed.

---

## 3. Locations — new resource, or confirm out of scope

**Why:** `CameraCreate` needs `locationId` (item 2). There is currently no location
entity anywhere in the API.

**Minimum viable version**, if you want this:

```
id        string (UUID)
userId    string
name      string
```

with basic `POST /api/v1/locations/`, `GET /api/v1/locations/`,
`DELETE /api/v1/locations/{id}` — same CRUD/envelope pattern as everything else.

If locations are explicitly out of scope for now, that's fine — just confirm it, and
the client will keep the field as a free-text label sent as `locationId` (not
actually a foreign key) until this exists.

---

## 4. User profile / settings persistence

**Why:** `SettingsScreen.js` has ~10 toggles (email/SMS/WhatsApp/push/desktop
notifications, sound alerts, two-factor auth, session timeout, password expiry, max
login attempts) with nowhere to save. There's no `/user/profile` or `/settings`
endpoint in the current API (the mobile app previously had dead code pointing at a
`/user/profile` path that doesn't exist and was never called — already removed
client-side).

**What's needed:**

```
GET  /api/v1/users/me/settings   → { message, data: { <the ~10 fields above> } }
PUT  /api/v1/users/me/settings   → same body to update
```

Scoped to the authenticated user (from the bearer token), not a path param — no
ownership-check ambiguity possible.

---

## 5. Device/system health monitoring

**Why:** `DeviceHealthScreen.js` is currently fully static (hardcoded "50%" system
health, etc.). There's no equivalent of uptime/connectivity/battery/heartbeat for
anything in the current API — **note this is a different concept from both the
vehicle `devices` API and the edge-device relay in item 1** — clarify with the mobile
team which of these (if any) "device health" is actually meant to monitor before
building this, since the screen name is ambiguous. Two plausible interpretations:

- **Edge-device liveness** — if this is what it means, item 1's `lastSeenAt` heartbeat
  already covers it; no new endpoint needed, just expose it via
  `GET /api/v1/edge-devices/{id}` (already planned above).
- **Something else entirely** (app health, ML model health) — if so, this needs its
  own spec; `GET /api/v1/model-logs/summary` (already live) gives log-level counts
  that could partially back a "system status" indicator, but that's AI-model
  diagnostics, not device health, and shouldn't be silently relabeled as such.

---

## 6. Formalize `AlertStatsResponse.data`'s shape

**Why:** In the live schema, `GET /api/v1/alerts/stats` types its `data` field as an
open `object` (`additionalProperties: true`) — there's no documented shape for what
it actually contains. The mobile app currently avoids depending on it and instead
derives its own stats (total count, today's count, hourly buckets) from
`GET /api/v1/alerts/recent`'s raw list, specifically to avoid guessing at an
unstable/undocumented shape.

**Ask:** pin down and document the actual fields `alerts/stats` returns (e.g.
`totalAlerts`, `alertsToday`, `byType: {...}`), so the client can switch to using the
real aggregation instead of computing it client-side from a capped recent-alerts
list (which is not accurate at any real scale).

---

## 7. Confirm the alerts WebSocket endpoint

**Why:** The mobile app connects to `wss://obex-edge-backend.onrender.com/alerts/ws/obex?auth_token={token}`
for live alert push (`services/AlertService.js`). This isn't in the OpenAPI docs —
expected, since OpenAPI doesn't cover WebSocket routes — but it means it's entirely
unverified from the client side beyond "it was presumably working at some point."

**Ask:** confirm this exact path, query-param auth scheme, and message shape
(client currently expects JSON with `alert_type`, `device_id`, `alert_data`,
`created_at`/`timestamp`, `id`/`alert_id` — matching `AlertSubmissionRequest`'s
shape) are still correct and documented somewhere durable, since a plain HTTP probe
against that path returns 404 either way (inconclusive for a WebSocket-only route) —
there's no way to confirm liveness from outside a real socket handshake.

---

## Open questions (not blocking, just want your read on them)

1. **Vehicle devices API** (`/api/v1/devices/*` — `deviceId`, `vehicleMake`,
   `vehicleModel`) is fully built but not used by any mobile screen. Is a
   vehicle-registration flow planned on the mobile side? If not, flagging so it's not
   carried as dead weight.
2. **Organizations API** (`create`/`get`/`list users`) is only exercised indirectly
   through signup today. Is a "manage my organization" / "team members" screen
   planned? Same reasoning as above.

---

## Priority summary

| Item | Blocks |
|---|---|
| 1. Edge device pairing + heartbeat | Remote camera viewing entirely |
| 2. Camera schema fields + URL split | Local/remote switching, ONVIF port/profile persistence |
| 3. Locations | Camera grouping by site (cosmetic until then) |
| 4. Settings persistence | `SettingsScreen.js` (currently all toggles are inert) |
| 5. Device health | `DeviceHealthScreen.js` (currently fully static) |
| 6. Alert stats shape | Analytics accuracy at scale |
| 7. WebSocket confirmation | Live alert push reliability |
