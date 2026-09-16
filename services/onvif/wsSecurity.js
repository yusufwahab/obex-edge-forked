import CryptoJS from 'crypto-js';

// WS-Security UsernameToken PasswordDigest = Base64(SHA1(nonce + created + password)),
// computed over raw bytes (not strings), per the ONVIF/WS-Security spec.
export function buildWsSecurity(username, password, clockOffsetMs = 0) {
  const nonce = CryptoJS.lib.WordArray.random(16);
  const created = new Date(Date.now() + clockOffsetMs).toISOString().split('.')[0] + 'Z';

  const createdWordArray = CryptoJS.enc.Utf8.parse(created);
  const passwordWordArray = CryptoJS.enc.Utf8.parse(password);
  const digestInput = nonce.clone().concat(createdWordArray).concat(passwordWordArray);
  const digest = CryptoJS.SHA1(digestInput);

  return {
    username,
    passwordDigest: CryptoJS.enc.Base64.stringify(digest),
    nonce: CryptoJS.enc.Base64.stringify(nonce),
    created,
  };
}
