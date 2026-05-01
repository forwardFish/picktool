import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const billingPageSource = readFileSync(
  new URL('../app/(dashboard)/dashboard/billing/page.tsx', import.meta.url),
  'utf8'
).replace(/\s+/g, ' ');

test('billing page surfaces pricing v2 snapshot and add-on language', () => {
  assert.equal(billingPageSource.includes('Pathnook billing center'), true);
  assert.equal(billingPageSource.includes('Current account snapshot'), true);
  assert.equal(billingPageSource.includes('Learning seats'), true);
  assert.equal(billingPageSource.includes('Active subject slots'), true);
  assert.equal(billingPageSource.includes('Review credits remaining'), true);
  assert.equal(billingPageSource.includes('Subject allocation policy'), true);
  assert.equal(billingPageSource.includes('Add-ons available inside billing'), true);
  assert.equal(billingPageSource.includes('Add seat'), true);
  assert.equal(billingPageSource.includes('Add subject slot'), true);
  assert.equal(billingPageSource.includes('Extra review credits'), true);
  assert.equal(billingPageSource.includes('Open Freemius Billing Portal'), true);
});
