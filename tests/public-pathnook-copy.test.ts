import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const trustConfigSource = readFileSync(
  new URL('../lib/site/public-trust.ts', import.meta.url),
  'utf8'
);

function normalizedSource(relativePath: string) {
  return readFileSync(new URL(relativePath, import.meta.url), 'utf8').replace(/\s+/g, ' ');
}

const filesToCheck = [
  '../app/(dashboard)/pricing/page.tsx',
  '../app/(dashboard)/sample-report/page.tsx',
  '../app/(dashboard)/dashboard/billing/page.tsx',
  '../app/contact/page.tsx',
  '../app/help/page.tsx',
  '../app/faq/page.tsx',
  '../app/data-deletion/page.tsx',
  '../app/legal/privacy/page.tsx',
  '../app/legal/terms/page.tsx',
  '../app/legal/refunds/page.tsx',
  '../components/landing/family-landing-page.tsx',
  '../components/landing/landing-footer.tsx',
] as const;

test('public pages use Pathnook and Freemius language without legacy placeholders', () => {
  for (const relativePath of filesToCheck) {
    const source = normalizedSource(relativePath);

    assert.equal(source.includes('FamilyEducation'), false, `${relativePath} should not mention FamilyEducation`);
    assert.equal(source.includes('Creem'), false, `${relativePath} should not mention Creem`);
    assert.equal(source.includes('active billing provider'), false, `${relativePath} should not mention active billing provider`);
    assert.equal(source.includes('will start working'), false, `${relativePath} should not contain unfinished login copy`);
    assert.equal(source.includes('[PRIVACY EMAIL]'), false, `${relativePath} should not contain unresolved privacy-email placeholders`);
    assert.equal(source.includes('[LEGAL ENTITY NAME]'), false, `${relativePath} should not contain unresolved legal-entity placeholders`);
    assert.equal(source.includes('support@pathnook.com'), false, `${relativePath} should not expose support@pathnook.com publicly`);
    assert.equal(source.includes('privacy@pathnook.com'), false, `${relativePath} should not expose privacy@pathnook.com publicly`);
    assert.equal(source.includes('Freemius customer portal'), false, `${relativePath} should use the billing-portal wording instead of customer portal`);
    assert.equal(source.includes('If no stable downloadable example is available yet'), false, `${relativePath} should not contain unfinished sample-report copy`);
  }
});

test('public trust surfaces consistently use admin@pathnook.com', () => {
  assert.equal(trustConfigSource.includes("PUBLIC_CONTACT_EMAIL = 'admin@pathnook.com'"), true);

  const trustFiles = [
    '../app/contact/page.tsx',
    '../app/help/page.tsx',
    '../app/data-deletion/page.tsx',
    '../app/legal/privacy/page.tsx',
    '../app/legal/terms/page.tsx',
    '../app/legal/refunds/page.tsx',
    '../components/landing/landing-nav.ts',
  ] as const;

  for (const relativePath of trustFiles) {
    const source = normalizedSource(relativePath);
    assert.equal(
      source.includes('PUBLIC_CONTACT_EMAIL') || source.includes('landingSupportEmail'),
      true,
      `${relativePath} should use the shared public contact channel`
    );
  }
});

test('legal pages contain the 1.5.3 audit-critical language', () => {
  const privacySource = normalizedSource('../app/legal/privacy/page.tsx');
  const termsSource = normalizedSource('../app/legal/terms/page.tsx');
  const refundsSource = normalizedSource('../app/legal/refunds/page.tsx');

  assert.equal(trustConfigSource.includes("PUBLIC_OPERATOR_NAME = 'Yanhui Lin'"), true);
  assert.equal(trustConfigSource.includes("PUBLIC_OPERATOR_REGION = 'Mainland China'"), true);
  assert.equal(privacySource.includes('PUBLIC_OPERATOR_LINE'), true);
  assert.equal(privacySource.includes('Children may not create accounts directly'), true);
  assert.equal(privacySource.includes('cookies, session records, and similar technical data'), true);
  assert.equal(privacySource.includes('does not use uploaded family materials'), true);
  assert.equal(privacySource.includes('Freemius acts as'), true);

  assert.equal(termsSource.includes('governed by the laws of Mainland China'), true);
  assert.equal(termsSource.includes('Children may not create accounts directly or independently purchase the service'), true);
  assert.equal(termsSource.includes('Freemius billing portal'), true);
  assert.equal(termsSource.includes('&quot;as is&quot; and &quot;as available&quot; basis'), true);

  assert.equal(trustConfigSource.includes('ONE_TIME_REFUND_WINDOW_DAYS = 7'), true);
  assert.equal(trustConfigSource.includes('SUBSCRIPTION_REFUND_WINDOW_DAYS = 7'), true);
  assert.equal(refundsSource.includes('ONE_TIME_REFUND_WINDOW_DAYS'), true);
  assert.equal(refundsSource.includes('SUBSCRIPTION_REFUND_WINDOW_DAYS'), true);
  assert.equal(refundsSource.includes('Unused one-time diagnosis credits'), true);
  assert.equal(refundsSource.includes('initial billing cycle'), true);
  assert.equal(refundsSource.includes('duplicate charge'), true);
  assert.equal(refundsSource.includes('technical failure'), true);
  assert.equal(refundsSource.includes('unauthorized charge'), true);
});

test('billing page copy and sample-report redirect match the public site contract', () => {
  const pricingSource = normalizedSource('../app/(dashboard)/pricing/page.tsx');
  const billingSource = normalizedSource('../app/(dashboard)/dashboard/billing/page.tsx');
  const sampleSource = normalizedSource('../app/(dashboard)/sample-report/page.tsx');
  const helpSource = normalizedSource('../app/help/page.tsx');

  assert.equal(pricingSource.includes('Open billing management'), true);
  assert.equal(pricingSource.includes('ONE_TIME_REFUND_WINDOW_DAYS'), true);
  assert.equal(pricingSource.includes('SUBSCRIPTION_REFUND_WINDOW_DAYS'), true);
  assert.equal(pricingSource.includes('Start from Pathnook billing management'), true);
  assert.equal(pricingSource.includes('Single Review'), true);
  assert.equal(pricingSource.includes('Starter'), true);
  assert.equal(pricingSource.includes('Plus'), true);
  assert.equal(pricingSource.includes('Family'), true);
  assert.equal(pricingSource.includes('Parent Weekly'), false);
  assert.equal(pricingSource.includes('Parent Annual'), false);
  assert.equal(pricingSource.includes('One-Time Diagnosis'), false);
  assert.equal(pricingSource.includes('learning seats'), true);
  assert.equal(pricingSource.includes('active subject slots'), true);
  assert.equal(pricingSource.includes('formal review credits'), true);

  assert.equal(billingSource.includes('Pathnook billing center'), true);
  assert.equal(billingSource.includes('Learning seats'), true);
  assert.equal(billingSource.includes('Active subject slots'), true);
  assert.equal(billingSource.includes('Review credits remaining'), true);
  assert.equal(billingSource.includes('Add-ons available inside billing'), true);
  assert.equal(billingSource.includes('Parent Weekly'), false);
  assert.equal(billingSource.includes('Parent Annual'), false);
  assert.equal(billingSource.includes('One-Time Diagnosis'), false);

  assert.equal(sampleSource.includes('redirect("/")'), true);
  assert.equal(sampleSource.includes('Sample report is intentionally disabled for the public site.'), true);

  assert.equal(helpSource.includes('Open billing management'), true);
  assert.equal(helpSource.includes('one public inbox handles support, privacy, refund, and legal questions'), true);
});
