from __future__ import annotations

import json
import sys

from delivery_runner import run_delivery_suite


def main() -> int:
    steps = [
        ("planning_validation", "python scripts\\validate_planning_assets.py", 180),
        (
            "db_generate",
            "powershell -NoProfile -Command \"$env:POSTGRES_URL='postgres://postgres:postgres@127.0.0.1:54322/postgres'; pnpm db:generate\"",
            300,
        ),
        ("build", "pnpm build", 900),
        (
            "api_smoke",
            "powershell -NoProfile -Command \"node scripts\\run_sprint8_smoke.mjs; if ($LASTEXITCODE -ne 0) { Start-Sleep -Seconds 2; node scripts\\run_sprint8_smoke.mjs }; exit $LASTEXITCODE\"",
            1800,
        ),
        (
            "browser_smoke",
            "powershell -NoProfile -Command \"node scripts\\run_sprint8_browser_smoke.mjs; if ($LASTEXITCODE -ne 0) { Start-Sleep -Seconds 2; node scripts\\run_sprint8_browser_smoke.mjs }; exit $LASTEXITCODE\"",
            2400,
        ),
    ]
    exit_code = run_delivery_suite(
        sprint_number=8,
        title="Sprint 8 Delivery Run",
        steps=steps,
        extra_payload={
            "target_stories": ["FE-046", "FE-047", "FE-048", "FE-049"],
        },
    )
    print(json.dumps({"status": "passed" if exit_code == 0 else "failed"}, ensure_ascii=False))
    return exit_code


if __name__ == "__main__":
    sys.exit(main())
