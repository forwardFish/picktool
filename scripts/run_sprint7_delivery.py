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
        ("api_smoke", "node scripts\\run_sprint7_smoke.mjs", 480),
        ("browser_smoke", "node scripts\\run_sprint7_browser_smoke.mjs", 720),
    ]
    exit_code = run_delivery_suite(
        sprint_number=7,
        title="Sprint 7 Delivery Run",
        steps=steps,
        extra_payload={
            "target_stories": ["FE-042", "FE-043", "FE-044", "FE-045"],
        },
    )
    print(json.dumps({"status": "passed" if exit_code == 0 else "failed"}, ensure_ascii=False))
    return exit_code


if __name__ == "__main__":
    sys.exit(main())
