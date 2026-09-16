// SOAP envelope builders for the four ONVIF calls used during camera verification.
// Scope: Profile S / Media1 only (see onvifClient.js).

function securityHeader(security) {
  if (!security) return '';
  return `
    <Security xmlns="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">
      <UsernameToken>
        <Username>${escapeXml(security.username)}</Username>
        <Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordDigest">${security.passwordDigest}</Password>
        <Nonce EncodingType="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-soap-message-security-1.0#Base64Binary">${security.nonce}</Nonce>
        <wsu:Created>${security.created}</wsu:Created>
      </UsernameToken>
    </Security>`;
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function envelope(namespaceAttr, body, security) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" ${namespaceAttr}>
  <soap:Header>${securityHeader(security)}</soap:Header>
  <soap:Body>
    ${body}
  </soap:Body>
</soap:Envelope>`;
}

export function getSystemDateAndTimeEnvelope() {
  return envelope(
    'xmlns:tds="http://www.onvif.org/ver10/device/wsdl"',
    '<tds:GetSystemDateAndTime/>',
    null
  );
}

export function getCapabilitiesEnvelope(security) {
  return envelope(
    'xmlns:tds="http://www.onvif.org/ver10/device/wsdl"',
    `<tds:GetCapabilities>
      <tds:Category>All</tds:Category>
    </tds:GetCapabilities>`,
    security
  );
}

export function getProfilesEnvelope(security) {
  return envelope(
    'xmlns:trt="http://www.onvif.org/ver10/media/wsdl"',
    '<trt:GetProfiles/>',
    security
  );
}

export function getStreamUriEnvelope(profileToken, security) {
  return envelope(
    'xmlns:trt="http://www.onvif.org/ver10/media/wsdl" xmlns:tt="http://www.onvif.org/ver10/schema"',
    `<trt:GetStreamUri>
      <trt:StreamSetup>
        <tt:Stream>RTP-Unicast</tt:Stream>
        <tt:Transport>
          <tt:Protocol>RTSP</tt:Protocol>
        </tt:Transport>
      </trt:StreamSetup>
      <trt:ProfileToken>${escapeXml(profileToken)}</trt:ProfileToken>
    </trt:GetStreamUri>`,
    security
  );
}
