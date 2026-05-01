import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const dashboardSource = readFileSync(
  new URL('../app/(dashboard)/dashboard/page.tsx', import.meta.url),
  'utf8'
).replace(/\s+/g, ' ');
const membersSource = readFileSync(
  new URL('../app/(dashboard)/dashboard/children/page.tsx', import.meta.url),
  'utf8'
).replace(/\s+/g, ' ');
const childDetailSource = readFileSync(
  new URL('../app/(dashboard)/dashboard/children/[childId]/page.tsx', import.meta.url),
  'utf8'
).replace(/\s+/g, ' ');
const reportsSource = readFileSync(
  new URL('../app/(dashboard)/dashboard/reports/page.tsx', import.meta.url),
  'utf8'
).replace(/\s+/g, ' ');
const reportDetailSource = readFileSync(
  new URL('../app/(dashboard)/dashboard/reports/[reportId]/page.tsx', import.meta.url),
  'utf8'
).replace(/\s+/g, ' ');
const uploadWorkspaceSource = readFileSync(
  new URL('../components/uploads/upload-workspace.tsx', import.meta.url),
  'utf8'
).replace(/\s+/g, ' ');
const sharedIntakeComposerSource = readFileSync(
  new URL('../components/intake/shared-intake-composer.tsx', import.meta.url),
  'utf8'
).replace(/\s+/g, ' ');
const intakeFileUtilsSource = readFileSync(
  new URL('../components/intake/intake-file-utils.ts', import.meta.url),
  'utf8'
).replace(/\s+/g, ' ');
const loginActionsSource = readFileSync(
  new URL('../app/(login)/actions.ts', import.meta.url),
  'utf8'
).replace(/\s+/g, ' ');
const childActionsSource = readFileSync(
  new URL('../app/(dashboard)/dashboard/children/actions.ts', import.meta.url),
  'utf8'
).replace(/\s+/g, ' ');
const newChildPageSource = readFileSync(
  new URL('../app/(dashboard)/dashboard/children/new/page.tsx', import.meta.url),
  'utf8'
).replace(/\s+/g, ' ');

test('overview and members routes consume real-data aggregators instead of prototype member arrays', () => {
  assert.equal(dashboardSource.includes('getOverviewWorkspace'), true);
  assert.equal(dashboardSource.includes('prototypeMembers'), false);
  assert.equal(membersSource.includes('getMembersPageData'), true);
  assert.equal(membersSource.includes('prototypeMembers'), false);
  assert.equal(membersSource.includes('member-detail-divider'), true);
  assert.equal(membersSource.includes('workspaceTitle'), true);
  assert.equal(childDetailSource.includes('getMembersPageData'), true);
  assert.equal(childDetailSource.includes('prototypeChild'), false);
});

test('reports surfaces consume dedicated dashboard/detail services and expose evidence tab', () => {
  assert.equal(reportsSource.includes('getReportsDashboardData'), true);
  assert.equal(reportsSource.includes('recentActivity = visibleReports.slice'), false);
  assert.equal(reportDetailSource.includes('getReportDetailData'), true);
  assert.equal(reportDetailSource.includes("'evidence'"), true);
});

test('upload workspace uses the formal start-diagnosis endpoint', () => {
  assert.equal(uploadWorkspaceSource.includes('/start-diagnosis'), true);
  assert.equal(uploadWorkspaceSource.includes('/submit'), false);
});

test('overview and landing share the real intake workflow with image/pdf support only', () => {
  assert.equal(dashboardSource.includes('SharedIntakeComposer'), true);
  assert.equal(dashboardSource.includes('composer-textarea composer-textarea-large'), false);
  assert.equal(sharedIntakeComposerSource.includes('/api/uploads'), true);
  assert.equal(sharedIntakeComposerSource.includes('/start-diagnosis'), true);
  assert.equal(intakeFileUtilsSource.includes('image/*,application/pdf'), true);
  assert.equal(intakeFileUtilsSource.includes('.zip'), false);
  assert.equal(intakeFileUtilsSource.includes('PDF or photo'), true);
});

test('resume draft flow persists through auth and first child creation', () => {
  assert.equal(sharedIntakeComposerSource.includes('saveIntakeDraft'), true);
  assert.equal(sharedIntakeComposerSource.includes('redirect=/dashboard%3FresumeDraft%3D1'), true);
  assert.equal(loginActionsSource.includes('getPostAuthRedirectTarget'), true);
  assert.equal(loginActionsSource.includes('/dashboard/children/new?resumeDraft=1'), true);
  assert.equal(newChildPageSource.includes('No child profile yet; create one to continue this diagnosis.'), true);
  assert.equal(childActionsSource.includes('/upload?resumeDraft=1'), true);
  assert.equal(uploadWorkspaceSource.includes('readIntakeDraft'), true);
  assert.equal(uploadWorkspaceSource.includes('clearIntakeDraft'), true);
});
