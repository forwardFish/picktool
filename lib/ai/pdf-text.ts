import { inflateSync } from 'node:zlib';

function decodePdfLiteralString(value: string) {
  return value
    .replace(/\\\r?\n/g, '')
    .replace(/\\([nrtbf()\\])/g, (_match, token: string) => {
      switch (token) {
        case 'n':
          return '\n';
        case 'r':
          return '\r';
        case 't':
          return '\t';
        case 'b':
          return '\b';
        case 'f':
          return '\f';
        case '(':
        case ')':
        case '\\':
          return token;
        default:
          return token;
      }
    })
    .replace(/\\([0-7]{1,3})/g, (_match, octal: string) =>
      String.fromCharCode(Number.parseInt(octal, 8))
    );
}

function decodePdfHexString(value: string) {
  const normalized = value.length % 2 === 0 ? value : `${value}0`;
  const bytes = Buffer.from(normalized, 'hex');

  if (
    bytes.length >= 2 &&
    ((bytes[0] === 0xfe && bytes[1] === 0xff) || (bytes[0] === 0xff && bytes[1] === 0xfe))
  ) {
    const utf16Buffer =
      bytes[0] === 0xff && bytes[1] === 0xfe
        ? bytes.subarray(2)
        : Buffer.from(bytes.subarray(2)).swap16();
    return utf16Buffer.toString('utf16le');
  }

  return bytes.toString('utf8');
}

function normalizeWhitespace(value: string) {
  return value.replace(/\0/g, ' ').replace(/\s+/g, ' ').trim();
}

function extractTextOperators(content: string) {
  const segments: string[] = [];

  for (const match of content.matchAll(/\((?:\\.|[^\\()])*\)\s*Tj/g)) {
    const literal = match[0].replace(/\s*Tj$/, '');
    segments.push(decodePdfLiteralString(literal.slice(1, -1)));
  }

  for (const match of content.matchAll(/<([0-9A-Fa-f\s]+)>\s*Tj/g)) {
    segments.push(decodePdfHexString(match[1].replace(/\s+/g, '')));
  }

  for (const match of content.matchAll(/\[((?:.|\n|\r)*?)\]\s*TJ/g)) {
    const arrayBody = match[1];
    for (const innerLiteral of arrayBody.matchAll(/\((?:\\.|[^\\()])*\)/g)) {
      segments.push(decodePdfLiteralString(innerLiteral[0].slice(1, -1)));
    }
    for (const innerHex of arrayBody.matchAll(/<([0-9A-Fa-f\s]+)>/g)) {
      segments.push(decodePdfHexString(innerHex[1].replace(/\s+/g, '')));
    }
  }

  return normalizeWhitespace(segments.join(' '));
}

export function extractPdfText(buffer: Buffer) {
  const binary = buffer.toString('latin1');
  const segments: string[] = [];
  const streamRegex = /<<([\s\S]*?)>>\s*stream\r?\n([\s\S]*?)\r?\nendstream/g;

  for (const match of binary.matchAll(streamRegex)) {
    const dictionary = match[1];
    const streamBody = Buffer.from(match[2], 'latin1');
    let decoded = Buffer.from(streamBody);

    if (/\/FlateDecode\b/.test(dictionary)) {
      try {
        decoded = Buffer.from(inflateSync(streamBody));
      } catch {
        decoded = Buffer.from(streamBody);
      }
    }

    const extracted = extractTextOperators(decoded.toString('latin1'));
    if (extracted) {
      segments.push(extracted);
    }
  }

  if (segments.length > 0) {
    return normalizeWhitespace(segments.join(' '));
  }

  return extractTextOperators(binary);
}
