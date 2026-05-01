import http from 'node:http';
import https from 'node:https';

import { HttpsProxyAgent } from 'https-proxy-agent';

function getProxyUrl(target: URL) {
  if (target.protocol === 'https:') {
    return process.env.HTTPS_PROXY || process.env.HTTP_PROXY || '';
  }

  return process.env.HTTP_PROXY || '';
}

function getRequestModule(target: URL) {
  return target.protocol === 'https:' ? https : http;
}

function normalizeBody(body: BodyInit | null | undefined) {
  if (!body) {
    return undefined;
  }

  if (typeof body === 'string' || body instanceof Buffer) {
    return body;
  }

  if (body instanceof URLSearchParams) {
    return body.toString();
  }

  if (body instanceof ArrayBuffer) {
    return Buffer.from(body);
  }

  if (ArrayBuffer.isView(body)) {
    return Buffer.from(body.buffer, body.byteOffset, body.byteLength);
  }

  throw new Error('Unsupported request body type for proxy-aware fetch.');
}

export async function proxyAwareFetch(
  input: string | URL,
  init: RequestInit = {}
): Promise<Response> {
  const target = input instanceof URL ? input : new URL(input);
  const body = normalizeBody(init.body);
  const headers = new Headers(init.headers);

  if (body && !headers.has('content-length')) {
    headers.set(
      'content-length',
      typeof body === 'string' ? Buffer.byteLength(body).toString() : body.length.toString()
    );
  }

  return await new Promise<Response>((resolve, reject) => {
    const proxyUrl = getProxyUrl(target);
    const request = getRequestModule(target).request(
      target,
      {
        method: init.method || 'GET',
        headers: Object.fromEntries(headers.entries()),
        agent: proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined,
      },
      (response) => {
        const chunks: Buffer[] = [];
        response.on('data', (chunk) =>
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
        );
        response.on('end', () => {
          const responseBody = Buffer.concat(chunks);
          resolve(
            new Response(responseBody, {
              status: response.statusCode || 500,
              statusText: response.statusMessage || '',
              headers: response.headers as HeadersInit,
            })
          );
        });
      }
    );

    request.on('error', reject);

    if (body) {
      request.write(body);
    }

    request.end();
  });
}
