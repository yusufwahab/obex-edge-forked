// Typed errors surfaced by the ONVIF verification client so the UI can show
// a distinct message per failure mode instead of a generic "verification failed".
export class OnvifError extends Error {
  constructor(type, message) {
    super(message);
    this.name = 'OnvifError';
    this.type = type; // 'unreachable' | 'unauthorized' | 'unsupported'
  }
}
