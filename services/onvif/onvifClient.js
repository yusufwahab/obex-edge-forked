import { OnvifError } from './errors';
import { buildWsSecurity } from './wsSecurity';
import { parseSoapXml } from './xmlParse';
import {
  getCapabilitiesEnvelope,
  getProfilesEnvelope,
  getStreamUriEnvelope,
  getSystemDateAndTimeEnvelope,
} from './soapEnvelopes';

const REQUEST_TIMEOUT_MS = 8000;

async function postSoap(url, body) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/soap+xml; charset=utf-8' },
      body,
      signal: controller.signal,
    });
  } catch (error) {
    throw new OnvifError('unreachable', `Could not reach camera at ${url}: ${error.message}`);
  } finally {
    clearTimeout(timeout);
  }

  const text = await response.text();
  let parsed;
  try {
    parsed = parseSoapXml(text);
  } catch (error) {
    throw new OnvifError('unreachable', `Camera returned an unparseable response: ${error.message}`);
  }

  const fault = parsed?.Envelope?.Body?.Fault;
  if (fault) {
    const reasonText =
      fault?.Reason?.Text?.['#text'] ?? fault?.Reason?.Text ?? fault?.faultstring ?? 'ONVIF fault';
    const reasonLower = String(reasonText).toLowerCase();
    if (
      response.status === 401 ||
      reasonLower.includes('auth') ||
      reasonLower.includes('sender') && reasonLower.includes('not authorized')
    ) {
      throw new OnvifError('unauthorized', `Camera rejected credentials: ${reasonText}`);
    }
    throw new OnvifError('unsupported', `Camera returned a fault: ${reasonText}`);
  }

  if (response.status === 401) {
    throw new OnvifError('unauthorized', 'Camera rejected credentials');
  }
  if (!response.ok) {
    throw new OnvifError('unreachable', `Camera returned HTTP ${response.status}`);
  }

  return parsed;
}

function deviceServiceUrl(ip, onvifPort) {
  return `http://${ip}:${onvifPort}/onvif/device_service`;
}

async function getClockOffsetMs(ip, onvifPort) {
  const parsed = await postSoap(deviceServiceUrl(ip, onvifPort), getSystemDateAndTimeEnvelope());
  const utc = parsed?.Envelope?.Body?.GetSystemDateAndTimeResponse?.SystemDateAndTime?.UTCDateTime;
  if (!utc) {
    // Not fatal — proceed with zero offset if the camera didn't answer this cleanly.
    return 0;
  }
  const date = utc.Date ?? {};
  const time = utc.Time ?? {};
  const cameraDate = Date.UTC(
    Number(date.Year),
    Number(date.Month) - 1,
    Number(date.Day),
    Number(time.Hour),
    Number(time.Minute),
    Number(time.Second)
  );
  if (Number.isNaN(cameraDate)) return 0;
  return cameraDate - Date.now();
}

async function getMediaServiceUrl(ip, onvifPort, security) {
  const parsed = await postSoap(deviceServiceUrl(ip, onvifPort), getCapabilitiesEnvelope(security));
  const mediaXAddr = parsed?.Envelope?.Body?.GetCapabilitiesResponse?.Capabilities?.Media?.XAddr;
  if (!mediaXAddr) {
    throw new OnvifError('unsupported', 'Camera did not report a Media service (Profile T/Media2-only cameras are not supported)');
  }
  return mediaXAddr;
}

async function getFirstProfileToken(mediaServiceUrl, security) {
  const parsed = await postSoap(mediaServiceUrl, getProfilesEnvelope(security));
  const profiles = parsed?.Envelope?.Body?.GetProfilesResponse?.Profiles;
  const first = Array.isArray(profiles) ? profiles[0] : profiles;
  const token = first?.['@_token'];
  if (!token) {
    throw new OnvifError('unsupported', 'Camera reported no media profiles');
  }
  return token;
}

function parseRtspUri(uri) {
  const match = /^rtsp:\/\/([^:/]+)(?::(\d+))?(\/.*)?$/i.exec(uri);
  if (!match) {
    throw new OnvifError('unsupported', `Camera returned a non-RTSP stream URI: ${uri}`);
  }
  return {
    host: match[1],
    rtspPort: match[2] ? Number(match[2]) : 554,
    path: match[3] || '/',
  };
}

async function getStreamUri(mediaServiceUrl, profileToken, security) {
  const parsed = await postSoap(mediaServiceUrl, getStreamUriEnvelope(profileToken, security));
  const uri = parsed?.Envelope?.Body?.GetStreamUriResponse?.MediaUri?.Uri;
  if (!uri) {
    throw new OnvifError('unsupported', 'Camera did not return a stream URI');
  }
  return uri;
}

/**
 * Runs the ONVIF verification sequence against a discovered/manually-entered camera and
 * resolves the real RTSP stream location. `onvifPort` is the ONVIF device-service port
 * (e.g. 80) — deliberately not named `port` to avoid confusion with the RTSP port returned
 * below, which is a different value entirely.
 *
 * Scope: Profile S / Media1 only. Profile T / Media2-only cameras surface as `unsupported`.
 */
export async function verifyCamera({ ip, onvifPort, username, password }) {
  const clockOffsetMs = await getClockOffsetMs(ip, onvifPort);

  const security = buildWsSecurity(username, password, clockOffsetMs);
  const mediaServiceUrl = await getMediaServiceUrl(ip, onvifPort, security);

  const profileSecurity = buildWsSecurity(username, password, clockOffsetMs);
  const profileToken = await getFirstProfileToken(mediaServiceUrl, profileSecurity);

  const streamSecurity = buildWsSecurity(username, password, clockOffsetMs);
  const rtspUri = await getStreamUri(mediaServiceUrl, profileToken, streamSecurity);
  const { rtspPort, path } = parseRtspUri(rtspUri);

  return {
    rtspUrl: rtspUri,
    rtspPort,
    path,
    profileToken,
  };
}
