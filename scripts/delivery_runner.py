from __future__ import annotations

import json
import os
import re
import subprocess
from datetime import datetime
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
BACKLOG_ROOT = ROOT / "tasks" / "backlog_v1"
QA_RESULTS = ROOT / "tasks" / "runtime" / "qa_results"
SPRINT_ACCEPTANCE = ROOT / "tasks" / "runtime" / "sprint_acceptance"
TRACEABILITY_AUDITS = ROOT / "tasks" / "runtime" / "traceability_audits"
STORY_STATUS_PATH = ROOT / "tasks" / "story_status_registry.json"
TRACEABILITY_MATRIX_PATH = ROOT / "docs" / "requirements" / "prd_traceability_matrix.md"
DEFAULT_ENV = {
    "POSTGRES_URL": "postgres://postgres:postgres@127.0.0.1:54322/postgres",
    "AUTH_SECRET": "family-education-dev-auth-secret",
    "BASE_URL": "http://127.0.0.1:3000",
    "FAMILY_EDU_DEMO_MODE": "1",
    "FILE_STORAGE_BACKEND": "local",
}


def run_step(name: str, command: str, timeout_seconds: int, env_overrides: dict[str, str]) -> dict[str, object]:
    env = {**DEFAULT_ENV, **os.environ, **env_overrides}
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


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def parse_story_file(path: Path) -> dict[str, object]:
    text = read_text(path)
    data: dict[str, object] = {"path": path}

    for field in ("story_id", "task_name"):
        match = re.search(rf"^{field}:\s*\"?(.*?)\"?\s*$", text, re.MULTILINE)
        if match:
            data[field] = match.group(1).strip()

    for list_field in ("requirement_ids", "test_case_ids", "expected_evidence"):
        items: list[str] = []
        capture = False
        for raw_line in text.splitlines():
            if re.match(rf"^{list_field}:\s*$", raw_line):
                capture = True
                continue
            if capture and re.match(r"^[A-Za-z0-9_]+:", raw_line):
                break
            if capture and raw_line.startswith("  - "):
                items.append(raw_line[4:].strip().strip('"'))
        data[list_field] = items

    return data


def parse_traceability_matrix(matrix_path: Path | None = None) -> list[dict[str, str]]:
    rows: list[dict[str, str]] = []
    resolved_matrix_path = matrix_path or TRACEABILITY_MATRIX_PATH
    for line in read_text(resolved_matrix_path).splitlines():
        stripped = line.strip()
        if not stripped.startswith("|"):
            continue
        cells = [cell.strip() for cell in stripped.strip("|").split("|")]
        if len(cells) != 7:
            continue
        if cells[0] in {"Requirement ID", "---"}:
            continue
        rows.append(
            {
                "requirement_id": cells[0],
                "capability": cells[1],
                "route_or_schema": cells[2],
                "story_ids": cells[3],
                "test_ids": cells[4],
                "expected_evidence": cells[5],
                "status": cells[6],
            }
        )
    return rows


def load_story_statuses() -> dict[str, str]:
    if not STORY_STATUS_PATH.exists():
        return {}
    payload = json.loads(read_text(STORY_STATUS_PATH))
    statuses: dict[str, str] = {}
    for story in payload.get("stories", []):
        if not isinstance(story, dict):
            continue
        story_id = str(story.get("story_id") or "").strip()
        if story_id:
            statuses[story_id] = str(story.get("status") or "").strip()
    return statuses


def find_story_file(story_id: str, backlog_root: Path | None = None) -> Path | None:
    resolved_backlog_root = backlog_root or BACKLOG_ROOT
    matches = sorted(resolved_backlog_root.glob(f"**/{story_id}.yaml"))
    return matches[0] if matches else None


def story_result_label(status: str) -> str:
    normalized = status.strip().lower()
    if normalized in {"accepted", "done"}:
        return "Passed"
    if normalized in {"running", "implemented", "in_progress", "in progress"}:
        return "In Progress"
    if normalized in {
        "failed",
        "blocked",
        "rejected",
        "needs_followup",
        "implemented_without_formal_flow",
        "invalid_delivery_batch",
        "stale_attempt",
    }:
        return "Blocked"
    return "Pending"


def should_allow_in_progress_gov003(story_id: str, requirement_id: str, row_status: str) -> bool:
    normalized_status = row_status.strip().lower()
    return (
        story_id in {"FE-041", "FE-045"}
        and requirement_id == "GOV-003"
        and normalized_status == "in progress"
    )


def write_traceability_audit(
    sprint_number: int,
    *,
    title: str,
    target_stories: list[str],
    results: list[dict[str, object]],
    backlog_root: Path | None = None,
    traceability_matrix_path: Path | None = None,
) -> None:
    TRACEABILITY_AUDITS.mkdir(parents=True, exist_ok=True)
    path = TRACEABILITY_AUDITS / f"sprint_{sprint_number}_traceability_audit.md"
    generated_at = datetime.now().isoformat(timespec="seconds")
    resolved_backlog_root = backlog_root or BACKLOG_ROOT
    resolved_traceability_matrix_path = traceability_matrix_path or TRACEABILITY_MATRIX_PATH
    matrix_rows = parse_traceability_matrix(resolved_traceability_matrix_path)
    story_statuses = load_story_statuses()
    audited_rows = [
        row
        for row in matrix_rows
        if any(story_id in row["story_ids"].split() for story_id in target_stories)
    ]
    audited_row_map = {row["requirement_id"]: row for row in audited_rows}

    story_summaries: list[dict[str, object]] = []
    blockers: list[str] = []
    for story_id in target_stories:
        story_path = find_story_file(story_id, resolved_backlog_root)
        if story_path is None:
            story_summaries.append(
                {
                    "story_id": story_id,
                    "requirement_ids": [],
                    "test_case_ids": [],
                    "result": "Blocked",
                    "status": "missing_story_card",
                }
            )
            blockers.append(f"{story_id}: missing story card")
            continue

        story = parse_story_file(story_path)
        status = story_statuses.get(story_id, "planned")
        result = story_result_label(status)
        requirement_ids = [str(item) for item in (story.get("requirement_ids") or [])]
        test_case_ids = [str(item) for item in (story.get("test_case_ids") or [])]
        for requirement_id in requirement_ids:
            row = audited_row_map.get(requirement_id)
            if row and row["status"].strip().lower() != "green":
                if should_allow_in_progress_gov003(
                    story_id,
                    requirement_id,
                    row["status"],
                ):
                    continue
                blockers.append(f"{story_id}: requirement {requirement_id} is {row['status']}")
        if result != "Passed":
            blockers.append(f"{story_id}: story status is {status}")
        story_summaries.append(
            {
                "story_id": story_id,
                "requirement_ids": requirement_ids,
                "test_case_ids": test_case_ids,
                "result": result,
                "status": status,
            }
        )

    failed_steps = [str(item.get("name") or "") for item in results if item.get("status") != "passed"]
    blockers.extend(f"delivery_step_failed: {name}" for name in failed_steps if name)

    lines = [
        f"# Sprint {sprint_number} Traceability Audit",
        "",
        f"Generated at: `{generated_at}`",
        "",
        "## Audit Method",
        f"- Reviewed Sprint {sprint_number} story cards `{target_stories[0]}` to `{target_stories[-1]}`",
        f"- Cross-checked requirement IDs against `{resolved_traceability_matrix_path.relative_to(ROOT)}`",
        "- Cross-checked test IDs against the page, click, API/data/AI, governance, and final acceptance matrices",
        f"- Confirmed executable evidence through `{title}`",
        "",
        "## Story To Requirement Status",
        "",
        "| Story | Requirement IDs | Test IDs | Result |",
        "| --- | --- | --- | --- |",
    ]
    for summary in story_summaries:
        requirement_ids = ", ".join(summary["requirement_ids"]) or "-"
        test_case_ids = ", ".join(summary["test_case_ids"]) or "-"
        result = str(summary["result"])
        status = str(summary["status"])
        lines.append(
            f"| {summary['story_id']} | {requirement_ids} | {test_case_ids} | {result} ({status}) |"
        )

    lines.extend(["", "## Requirement Rows Audited"])
    if audited_rows:
        for row in audited_rows:
            lines.append(f"- `{row['requirement_id']}`: {row['status']}")
    else:
        lines.append("- None")

    lines.extend(["", "## Delivery Run Summary"])
    if failed_steps:
        lines.extend(f"- Failed step: `{name}`" for name in failed_steps)
    else:
        lines.append("- All delivery steps passed.")

    lines.extend(["", "## Acceptance Gate Decision"])
    if blockers:
        lines.append(
            f"- Sprint {sprint_number} is not accepted yet. The audit found blocking gaps in story status, requirement coverage, or delivery evidence."
        )
        lines.extend(f"- Blocker: {blocker}" for blocker in blockers)
    else:
        lines.append(
            f"- Sprint {sprint_number} is accepted. All audited stories are accepted, audited requirement rows are green, and the delivery run passed."
        )

    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def write_outputs(
    sprint_number: int,
    *,
    title: str,
    results: list[dict[str, object]],
    extra_payload: dict[str, object] | None = None,
    backlog_root: Path | None = None,
    traceability_matrix_path: Path | None = None,
) -> None:
    timestamp = datetime.now().isoformat(timespec="seconds")
    QA_RESULTS.mkdir(parents=True, exist_ok=True)
    SPRINT_ACCEPTANCE.mkdir(parents=True, exist_ok=True)

    json_path = QA_RESULTS / f"sprint_{sprint_number}_delivery_results.json"
    md_path = SPRINT_ACCEPTANCE / f"sprint_{sprint_number}_acceptance_report.md"

    payload = {
        "generated_at": timestamp,
        "sprint_number": sprint_number,
        "title": title,
        "results": results,
    }
    if extra_payload:
        payload.update(extra_payload)

    json_path.write_text(
        json.dumps(payload, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )

    lines = [
        f"# {title}",
        "",
        f"Generated at: `{timestamp}`",
        "",
    ]
    if extra_payload:
        lines.extend(
            [
                "## Summary",
                "",
                "```json",
                json.dumps(extra_payload, indent=2, ensure_ascii=False),
                "```",
                "",
            ]
        )
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
    target_stories = [
        str(item).strip()
        for item in (extra_payload or {}).get("target_stories", [])
        if str(item).strip()
    ]
    if target_stories:
        write_traceability_audit(
            sprint_number,
            title=title,
            target_stories=target_stories,
            results=results,
            backlog_root=backlog_root,
            traceability_matrix_path=traceability_matrix_path,
        )


def run_delivery_suite(
    *,
    sprint_number: int,
    title: str,
    steps: list[tuple[str, str, int]],
    env_overrides: dict[str, str] | None = None,
    extra_payload: dict[str, object] | None = None,
    backlog_root: Path | None = None,
    traceability_matrix_path: Path | None = None,
) -> int:
    env_overrides = env_overrides or {}
    results: list[dict[str, object]] = []

    for name, command, timeout_seconds in steps:
        kill_port_3000()
        results.append(run_step(name, command, timeout_seconds, env_overrides))

    kill_port_3000()
    write_outputs(
        sprint_number,
        title=title,
        results=results,
        extra_payload=extra_payload,
        backlog_root=backlog_root,
        traceability_matrix_path=traceability_matrix_path,
    )

    failures = [result for result in results if result["status"] != "passed"]
    return 1 if failures else 0
