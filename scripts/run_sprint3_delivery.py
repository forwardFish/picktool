from __future__ import annotations

import json
import os
import subprocess
import sys
from datetime import datetime
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
QA_RESULTS = ROOT / "tasks" / "runtime" / "qa_results"
SPRINT_ACCEPTANCE = ROOT / "tasks" / "runtime" / "sprint_acceptance"

ENV = {
    "POSTGRES_URL": "postgres://postgres:postgres@127.0.0.1:54322/postgres",
    "AUTH_SECRET": "family-education-dev-auth-secret",
    "BASE_URL": "http://127.0.0.1:3000",
    "FAMILY_EDU_DEMO_MODE": "1",
}


def run_step(name: str, command: str, timeout_seconds: int) -> dict[str, object]:
    env = {**os.environ, **ENV}
    try:
        completed = subprocess.run(
            command,
            cwd=ROOT,
            env=env,
            shell=True,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=timeout_seconds,
        )
        return {
            "name": name,
            "command": command,
            "returncode": completed.returncode,
            "stdout": completed.stdout,
            "stderr": completed.stderr,
            "status": "passed" if completed.returncode == 0 else "failed",
        }
    except subprocess.TimeoutExpired as error:
        return {
            "name": name,
            "command": command,
            "returncode": -1,
            "stdout": error.stdout or "",
            "stderr": (error.stderr or "") + f"\nTimed out after {timeout_seconds} seconds.",
            "status": "failed",
        }


def kill_port_3000() -> None:
    lookup = subprocess.run(
        "powershell -NoProfile -Command \""
        "$conn = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue; "
        "if ($conn) { $conn.OwningProcess }\"",
        cwd=ROOT,
        shell=True,
        capture_output=True,
        text=True,
    )
    pid = lookup.stdout.strip()
    if not pid:
        return

    subprocess.run(
        f"taskkill /PID {pid} /T /F",
        cwd=ROOT,
        shell=True,
        capture_output=True,
        text=True,
    )


def write_outputs(results: list[dict[str, object]]) -> None:
    timestamp = datetime.now().isoformat(timespec="seconds")
    QA_RESULTS.mkdir(parents=True, exist_ok=True)
    SPRINT_ACCEPTANCE.mkdir(parents=True, exist_ok=True)

    json_path = QA_RESULTS / "sprint_3_delivery_results.json"
    md_path = SPRINT_ACCEPTANCE / "sprint_3_delivery_report.md"

    json_path.write_text(
        json.dumps(
            {
                "generated_at": timestamp,
                "results": results,
            },
            indent=2,
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )

    lines = [
        "# Sprint 3 Delivery Run",
        "",
        f"Generated at: `{timestamp}`",
        "",
    ]
    for result in results:
        lines.extend(
            [
                f"## {result['name']}",
                "",
                f"- Status: `{result['status']}`",
                f"- Command: `{result['command']}`",
                "",
                "### Stdout",
                "```text",
                (result["stdout"] or "").strip(),
                "```",
                "",
                "### Stderr",
                "```text",
                (result["stderr"] or "").strip(),
                "```",
                "",
            ]
        )

    md_path.write_text("\n".join(lines), encoding="utf-8")


def main() -> int:
    steps = [
        ("planning_validation", "python scripts\\validate_planning_assets.py", 180),
        (
            "db_generate",
            "powershell -NoProfile -Command \"$env:POSTGRES_URL='postgres://postgres:postgres@127.0.0.1:54322/postgres'; pnpm db:generate\"",
            300,
        ),
        ("build", "pnpm build", 900),
        ("api_smoke", "node scripts\\run_sprint3_smoke.mjs", 360),
        ("browser_smoke", "node scripts\\run_sprint3_browser_smoke.mjs", 420),
    ]

    results: list[dict[str, object]] = []

    for name, command, timeout_seconds in steps:
        kill_port_3000()
        results.append(run_step(name, command, timeout_seconds))

    kill_port_3000()
    write_outputs(results)

    failures = [result for result in results if result["status"] != "passed"]
    if failures:
        print(
            json.dumps(
                {
                    "status": "failed",
                    "failed_steps": [item["name"] for item in failures],
                },
                ensure_ascii=False,
            )
        )
        return 1

    print(json.dumps({"status": "passed"}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
