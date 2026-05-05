import test from 'node:test';
import assert from 'node:assert/strict';
import { POST } from '../app/api/decision/route.ts';
import { GET as GET_TOOL } from '../app/api/tools/[slug]/route.ts';
import { GET as GET_SETUP } from '../app/api/setups/[slug]/route.ts';

test('POST /api/decision returns result for TikTok product video input', async () => {
  const request = new Request('http://localhost/api/decision', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input: 'I want to create a product promo video for TikTok.' })
  });

  const response = await POST(request);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.resultTitle, 'Best Tool Setup for This Task');
  assert.equal(body.setupSlug, 'tiktok-product-promo-video');
});

test('POST /api/decision rejects too-short input', async () => {
  const request = new Request('http://localhost/api/decision', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input: 'Hi' })
  });

  const response = await POST(request);
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.match(body.error, /at least 3/);
});

test('GET /api/tools/capcut returns CapCut detail', async () => {
  const response = await GET_TOOL(new Request('http://localhost/api/tools/capcut'), {
    params: Promise.resolve({ slug: 'capcut' })
  });
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.name, 'CapCut');
  assert.ok(body.worthUsingIf.length > 0);
});

test('GET /api/tools/not-existing returns 404', async () => {
  const response = await GET_TOOL(new Request('http://localhost/api/tools/not-existing'), {
    params: Promise.resolve({ slug: 'not-existing' })
  });
  const body = await response.json();

  assert.equal(response.status, 404);
  assert.equal(body.error, 'Tool not found.');
});

test('GET /api/setups/tiktok-product-promo-video returns setup detail', async () => {
  const response = await GET_SETUP(new Request('http://localhost/api/setups/tiktok-product-promo-video'), {
    params: Promise.resolve({ slug: 'tiktok-product-promo-video' })
  });
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.setupSlug, 'tiktok-product-promo-video');
  assert.equal(body.resultTitle, 'Best Tool Setup for This Task');
});

test('GET /api/setups/not-existing returns 404', async () => {
  const response = await GET_SETUP(new Request('http://localhost/api/setups/not-existing'), {
    params: Promise.resolve({ slug: 'not-existing' })
  });
  const body = await response.json();

  assert.equal(response.status, 404);
  assert.equal(body.error, 'Setup not found.');
});
