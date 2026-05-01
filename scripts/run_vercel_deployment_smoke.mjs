import { execFile } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const outputPath = path.join(
  process.cwd(),
  'tasks',
  'runtime',
  'final_acceptance',
  'vercel_deployment_smoke.json'
);
function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function normalizeBaseUrl(input) {
  return String(input || '').trim().replace(/\/$/, '');
}

async function readLocalVercelProjectLink() {
  const projectPath = path.join(process.cwd(), '.vercel', 'project.json');
  try {
    const payload = JSON.parse(await readFile(projectPath, 'utf8'));
    return {
      projectId: String(payload.projectId || '').trim(),
      orgId: String(payload.orgId || '').trim(),
    };
  } catch {
    return {
      projectId: '',
      orgId: '',
    };
  }
}

function getNpxInvocation() {
  if (process.platform === 'win32') {
    return {
      command: process.execPath,
      args: [
        path.join(
          path.dirname(process.execPath),
          'node_modules',
          'npm',
          'bin',
          'npx-cli.js'
        ),
      ],
    };
  }

  return {
    command: 'npx',
    args: [],
  };
}

async function runVercelCommand(args) {
  const invocation = getNpxInvocation();
  const childEnv = { ...process.env };
  if (!childEnv.VERCEL_PROJECT_ID || !childEnv.VERCEL_ORG_ID) {
    delete childEnv.VERCEL_PROJECT_ID;
    delete childEnv.VERCEL_ORG_ID;
  }
  const result = await execFileAsync(
    invocation.command,
    [...invocation.args, 'vercel', ...args],
    {
      cwd: process.cwd(),
      env: childEnv,
      windowsHide: true,
      maxBuffer: 1024 * 1024 * 10,
    }
  );

  return {
    stdout: result.stdout || '',
    stderr: result.stderr || '',
  };
}

async function readProjectSnapshot(projectId) {
  const { stdout } = await runVercelCommand([
    'api',
    `/v9/projects/${projectId}`,
    '--raw',
  ]);
  return JSON.parse(stdout);
}

function normalizeDeploymentUrl(input) {
  const value = normalizeBaseUrl(input);
  if (!value) {
    return '';
  }

  return value.startsWith('http://') || value.startsWith('https://')
    ? value
    : `https://${value}`;
}

function getStatusFromCurlOutput(output) {
  const trimmed = String(output || '').trim();
  const match = trimmed.match(/^(\d{3})/m);
  if (!match) {
    throw new Error(`Unable to parse HTTP status from curl output: ${trimmed}`);
  }

  return Number(match[1]);
}

async function runGitCommand(args) {
  const result = await execFileAsync('git', args, {
    cwd: process.cwd(),
    windowsHide: true,
    maxBuffer: 1024 * 1024,
  });
  return String(result.stdout || '').trim();
}

function parseGitRemote(input) {
  const raw = String(input || '').trim();
  const normalized = raw.replace(/\.git$/, '');
  const httpsMatch = normalized.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)$/i);
  if (httpsMatch) {
    return {
      raw,
      provider: 'github',
      owner: httpsMatch[1],
      repo: httpsMatch[2],
      full: `${httpsMatch[1]}/${httpsMatch[2]}`,
    };
  }

  const sshMatch = normalized.match(/^git@github\.com:([^/]+)\/([^/]+)$/i);
  if (sshMatch) {
    return {
      raw,
      provider: 'github',
      owner: sshMatch[1],
      repo: sshMatch[2],
      full: `${sshMatch[1]}/${sshMatch[2]}`,
    };
  }

  return {
    raw,
    provider: null,
    owner: null,
    repo: null,
    full: raw || null,
  };
}

async function readLocalGitSnapshot() {
  const [head, branch, remote] = await Promise.all([
    runGitCommand(['rev-parse', 'HEAD']).catch(() => ''),
    runGitCommand(['rev-parse', '--abbrev-ref', 'HEAD']).catch(() => ''),
    runGitCommand(['remote', 'get-url', 'origin']).catch(() => ''),
  ]);

  return {
    head: head || null,
    branch: branch || null,
    remote: parseGitRemote(remote),
  };
}

async function checkRoute(baseUrl, route, expectedStatuses) {
  const url = `${baseUrl}${route}`;
  const { stdout, stderr } = await runVercelCommand([
    'curl',
    route,
    '--deployment',
    baseUrl,
    '--',
    '--insecure',
    '--silent',
    '--show-error',
    '--output',
    process.platform === 'win32' ? 'NUL' : '/dev/null',
    '--write-out',
    '%{http_code}',
  ]);
  const responseStatus = getStatusFromCurlOutput(stdout || stderr);

  assert(
    expectedStatuses.includes(responseStatus),
    `${url} returned ${responseStatus}, expected one of ${expectedStatuses.join(', ')}`
  );

  return {
    route,
    url,
    status: responseStatus,
  };
}

function getLinkedRepo(project) {
  if (!project?.link?.org || !project?.link?.repo) {
    return null;
  }

  return {
    owner: project.link.org,
    repo: project.link.repo,
    full: `${project.link.org}/${project.link.repo}`,
  };
}

function getDeploymentGithubMeta(deployment) {
  if (!deployment?.meta) {
    return {
      owner: null,
      repo: null,
      sha: null,
      message: null,
      ref: null,
    };
  }

  return {
    owner: deployment.meta.githubCommitOrg || null,
    repo: deployment.meta.githubCommitRepo || null,
    sha: deployment.meta.githubCommitSha || null,
    message: deployment.meta.githubCommitMessage || null,
    ref: deployment.meta.githubCommitRef || null,
  };
}

async function runSuite(label, deployment, linkedRepo) {
  const baseUrl = normalizeDeploymentUrl(
    deployment?.deploymentUrl || deployment?.url || deployment?.baseUrl
  );
  const github = getDeploymentGithubMeta(deployment);
  const errors = [];
  const checks = [];
  const linkedRepoMatch = linkedRepo
    ? github.owner === linkedRepo.owner && github.repo === linkedRepo.repo
    : null;

  if (!deployment) {
    errors.push(`Missing deployment metadata for ${label}.`);
  }
  if (!baseUrl) {
    errors.push(`Missing deployment URL for ${label}.`);
  }
  if (deployment?.readyState !== 'READY') {
    errors.push(
      `${label} deployment readyState is ${deployment?.readyState || 'missing'}, expected READY.`
    );
  }
  if (linkedRepo && linkedRepoMatch === false) {
    errors.push(
      `${label} deployment is built from ${github.owner || 'unknown'}/${github.repo || 'unknown'}, expected ${linkedRepo.full}.`
    );
  }

  if (baseUrl) {
    for (const [route, expectedStatuses] of [
      ['/', [200]],
      ['/pricing', [200]],
      ['/sign-up', [200]],
      ['/sign-in', [200]],
      ['/dashboard', [200, 302, 303, 307, 308]],
      ['/dashboard/billing', [200, 302, 303, 307, 308]],
    ]) {
      try {
        checks.push(await checkRoute(baseUrl, route, expectedStatuses));
      } catch (error) {
        errors.push(String(error.message || error));
      }
    }
  }

  return {
    label,
    baseUrl,
    aliases: deployment?.aliases || [],
    deploymentId: deployment?.id || null,
    target: deployment?.target || null,
    readyState: deployment?.readyState || null,
    readySubstate: deployment?.readySubstate || null,
    github,
    linkedRepoMatch,
    checks,
    status: errors.length === 0 ? 'passed' : 'failed',
    errors,
  };
}

async function main() {
  const [localProjectLink, localGit] = await Promise.all([
    readLocalVercelProjectLink(),
    readLocalGitSnapshot(),
  ]);
  const projectId =
    process.env.VERCEL_PROJECT_ID ||
    process.env.FAMILY_EDU_VERCEL_PROJECT_ID ||
    localProjectLink.projectId;
  assert(
    projectId,
    'Set VERCEL_PROJECT_ID before running the Vercel deployment smoke.'
  );
  const project = await readProjectSnapshot(projectId);
  const linkedRepo = getLinkedRepo(project);
  const expectedRootDirectory =
    process.env.FAMILY_EDU_EXPECTED_ROOT_DIRECTORY || '.';
  const resolvedRootDirectory = project.rootDirectory || '.';
  const previewDeployment = project.targets?.preview || null;
  const productionDeployment = project.targets?.production || null;
  const previewUrl = normalizeDeploymentUrl(
    process.env.FAMILY_EDU_PREVIEW_URL || process.env.VERCEL_PREVIEW_URL
  );
  const productionUrl = normalizeDeploymentUrl(
    process.env.FAMILY_EDU_PRODUCTION_URL ||
      process.env.BASE_URL ||
      productionDeployment?.alias?.[0]
  );

  const previewSuiteSource = previewUrl
    ? {
        ...previewDeployment,
        deploymentUrl: previewUrl,
      }
    : previewDeployment;
  const productionSuiteSource = productionDeployment
    ? {
        ...productionDeployment,
        deploymentUrl:
          normalizeDeploymentUrl(productionDeployment.url) || productionUrl,
      }
    : productionUrl
      ? {
          deploymentUrl: productionUrl,
          aliases: [],
          id: null,
          target: 'production',
        }
      : null;

  const issues = [];
  if (resolvedRootDirectory !== expectedRootDirectory) {
    issues.push(
      `Vercel project rootDirectory is ${resolvedRootDirectory}, expected ${expectedRootDirectory}.`
    );
  }
  if (project.link?.productionBranch !== 'main') {
    issues.push(
      `Vercel production branch is ${project.link?.productionBranch || 'missing'}, expected main.`
    );
  }

  const suites = [];
  if (previewSuiteSource) {
    suites.push(await runSuite('preview', previewSuiteSource, linkedRepo));
  } else {
    issues.push('Preview deployment metadata could not be resolved from the Vercel project.');
  }
  if (productionSuiteSource) {
    suites.push(await runSuite('production', productionSuiteSource, linkedRepo));
  } else {
    issues.push('Production deployment metadata could not be resolved from the Vercel project.');
  }
  assert(suites.length > 0, 'No preview or production deployment could be resolved.');

  for (const suite of suites) {
    for (const error of suite.errors || []) {
      issues.push(error);
    }
  }

  const payload = {
    generated_at: new Date().toISOString(),
    status: issues.length === 0 ? 'pass' : 'fail',
    issues,
    project: {
      id: project.id,
      name: project.name,
      rootDirectory: resolvedRootDirectory,
      expectedRootDirectory,
      linkedRepo,
      productionBranch: project.link?.productionBranch || null,
      localGit,
      localRemoteMatchesLinkedRepo: linkedRepo
        ? linkedRepo.full === localGit.remote.full
        : null,
      localRemoteWarning:
        linkedRepo && localGit.remote.full && linkedRepo.full !== localGit.remote.full
          ? `Local git remote is ${localGit.remote.full}, while Vercel auto deploy is linked to ${linkedRepo.full}.`
          : null,
      previewDeploymentId: previewDeployment?.id || null,
      productionDeploymentId: productionDeployment?.id || null,
      productionAliases: productionDeployment?.alias || [],
    },
    suites,
  };

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, JSON.stringify(payload, null, 2), 'utf8');
  console.log(
    JSON.stringify(
      { status: payload.status, report: outputPath, issues: payload.issues },
      null,
      2
    )
  );
  if (issues.length > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
