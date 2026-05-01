from __future__ import annotations

import json
import os
import sys
from pathlib import Path

from delivery_runner import ROOT, run_delivery_suite


def load_local_env() -> dict[str, str]:
    values: dict[str, str] = {}
    for candidate in (ROOT / ".env", ROOT / ".env.local"):
        if not candidate.exists():
            continue
        for raw_line in candidate.read_text(encoding="utf-8").splitlines():
            line = raw_line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            values[key.strip()] = value.strip()
    return values


def resolve_db_delivery_commands() -> list[tuple[str, str, int]]:
    local_env = load_local_env()
    database_url = os.environ.get("DATABASE_URL") or local_env.get("DATABASE_URL")
    postgres_url = os.environ.get("POSTGRES_URL") or local_env.get("POSTGRES_URL")

    if database_url:
        env_setup = (
            'powershell -NoProfile -Command '
            f'"$env:DATABASE_URL=\'{database_url}\'; '
            'pnpm db:generate; '
            'if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }; '
            'pnpm db:migrate; '
            'exit $LASTEXITCODE"'
        )
        return [
            ("db_generate_and_migrate", env_setup, 600),
        ]

    if postgres_url:
        env_setup = (
            'powershell -NoProfile -Command '
            f'"$env:POSTGRES_URL=\'{postgres_url}\'; '
            'pnpm db:generate; '
            'if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }; '
            'pnpm db:migrate; '
            'exit $LASTEXITCODE"'
        )
        return [
            ("db_generate_and_migrate", env_setup, 600),
        ]

    return [
        (
            "db_generate_and_migrate",
            'powershell -NoProfile -Command "Write-Error \'DATABASE_URL or POSTGRES_URL is required for Sprint 14 delivery.\'; exit 1"',
            30,
        )
    ]


def main() -> int:
    steps = [
        ("planning_validation", "python scripts\\validate_beta_planning_assets.py", 180),
        *resolve_db_delivery_commands(),
        ("build", "pnpm build", 900),
        (
            "api_smoke",
            "powershell -NoProfile -Command \"node scripts\\run_sprint14_smoke.mjs; if ($LASTEXITCODE -ne 0) { Start-Sleep -Seconds 2; node scripts\\run_sprint14_smoke.mjs }; exit $LASTEXITCODE\"",
            2400,
        ),
        (
            "browser_smoke",
            "powershell -NoProfile -Command \"node scripts\\run_sprint14_browser_smoke.mjs; if ($LASTEXITCODE -ne 0) { Start-Sleep -Seconds 2; node scripts\\run_sprint14_browser_smoke.mjs }; exit $LASTEXITCODE\"",
            3000,
        ),
        (
            "final_acceptance",
            "python scripts\\run_final_program_acceptance.py --phase next_phase --mode final",
            240,
        ),
    ]
    exit_code = run_delivery_suite(
        sprint_number=14,
        title="Sprint 14 Delivery Run",
        steps=steps,
        extra_payload={
            "target_stories": ["FE-073", "FE-074", "FE-075", "FE-076", "FE-077"],
        },
        backlog_root=ROOT / "tasks" / "backlog_v2_beta_launch",
        traceability_matrix_path=ROOT / "docs" / "requirements" / "next_phase_traceability_matrix.md",
    )
    print(json.dumps({"status": "passed" if exit_code == 0 else "failed"}, ensure_ascii=False))
    return exit_code


if __name__ == "__main__":
    sys.exit(main())
