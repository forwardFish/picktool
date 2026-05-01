import { spawn } from 'node:child_process';
import path from 'node:path';

const scripts = [
  'scripts/run_final_browser_evidence_pack.mjs',
  'scripts/run_admin_review_browser_smoke.mjs',
];

function runScript(target) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(process.cwd(), target)], {
      cwd: process.cwd(),
      env: process.env,
      stdio: 'inherit',
    });
    child.on('exit', (code) => resolve(code ?? 1));
    child.on('error', reject);
  });
}

function killPort3000() {
  return new Promise((resolve) => {
    if (process.platform !== 'win32') {
      resolve();
      return;
    }

    const child = spawn(
      'powershell',
      [
        '-NoProfile',
        '-Command',
        "$conn = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue; if ($conn) { taskkill /PID $conn.OwningProcess /T /F | Out-Null }",
      ],
      {
        cwd: process.cwd(),
        env: process.env,
        stdio: 'ignore',
      }
    );
    child.on('exit', () => resolve());
    child.on('error', () => resolve());
  });
}

async function main() {
  const executed = [];

  for (const script of scripts) {
    await killPort3000();
    const code = await runScript(script);
    executed.push({ script, status: code === 0 ? 'passed' : 'failed' });
    if (code !== 0) {
      console.error(
        JSON.stringify(
          {
            status: 'failed',
            failed_script: script,
            executed,
          },
          null,
          2
        )
      );
      process.exit(code);
    }
  }

  console.log(
    JSON.stringify(
      {
        status: 'pass',
        executed,
        suites: ['page', 'click', 'responsive'],
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
