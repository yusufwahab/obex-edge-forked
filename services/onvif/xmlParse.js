import { XMLParser } from 'fast-xml-parser';

// removeNSPrefix strips vendor-varying namespace prefixes (SOAP-ENV:/soap:, tds:/device:, ...)
// so callers can navigate parsed responses without caring which prefix a given camera used.
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  removeNSPrefix: true,
});

export function parseSoapXml(xml) {
  return parser.parse(xml);
}
