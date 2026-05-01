import { spawn } from 'node:child_process';

const commands = [
  {
    label: 'beta_api_smoke',
    command: process.execPath,
    args: ['scripts/run_final_program_smoke.mjs'],
  },
  {
    label: 'beta_release_checklist',
    command: 'python',
    args: ['scripts/run_final_program_acceptance.py', '--phase', 'next_phase', '--mode', 'beta_smoke'],
  },
];

function runCommand(target) {
  return new Promise((resolve, reject) => {
    const child = spawn(target.command, target.args, {
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

  for (const entry of commands) {
    await killPort3000();
    const code = await runCommand(entry);
    executed.push({ label: entry.label, status: code === 0 ? 'passed' : 'failed' });
    if (code !== 0) {
      console.error(
        JSON.stringify(
          {
            status: 'failed',
            failed_step: entry.label,
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
        suites: ['ops', 'api', 'beta_release'],
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
