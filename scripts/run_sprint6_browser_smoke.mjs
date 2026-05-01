import { runRegressionScript } from './run_regression_wrapper.mjs';

const scripts = [
  'scripts/run_admin_review_browser_smoke.mjs',
  'scripts/run_sprint6_should_scope_browser_smoke.mjs',
];

for (const script of scripts) {
  const exitCode = await runRegressionScript(script);
  if (exitCode !== 0) {
    process.exit(exitCode);
  }
}

process.exit(0);
