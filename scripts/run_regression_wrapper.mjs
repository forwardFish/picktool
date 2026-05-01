import { spawn } from 'node:child_process';
import path from 'node:path';

export function runRegressionScript(targetScript) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(process.cwd(), targetScript)], {
      cwd: process.cwd(),
      env: process.env,
      stdio: 'inherit',
    });
    child.on('exit', (code) => resolve(code ?? 1));
    child.on('error', reject);
  });
}
