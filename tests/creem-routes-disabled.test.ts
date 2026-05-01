import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

function normalizedSource(relativePath: string) {
  return readFileSync(new URL(relativePath, import.meta.url), 'utf8').replace(/\s+/g, ' ');
}

test('Creem checkout route is guarded by FEATURE_CREEM_ROUTES', () => {
  const source = normalizedSource('../app/api/creem/checkout/route.ts');

  assert.equal(source.includes("isCreemRoutesEnabled"), true);
  assert.equal(source.includes("if (!isCreemRoutesEnabled())"), true);
  assert.equal(source.includes("Creem checkout route is disabled."), true);
  assert.equal(source.includes("status: 404"), true);
});

test('Creem webhook route is guarded by FEATURE_CREEM_ROUTES', () => {
  const source = normalizedSource('../app/api/creem/webhook/route.ts');

  assert.equal(source.includes("isCreemRoutesEnabled"), true);
  assert.equal(source.includes("if (!isCreemRoutesEnabled())"), true);
  assert.equal(source.includes("Creem webhook route is disabled."), true);
  assert.equal(source.includes("status: 404"), true);
});
