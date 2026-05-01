from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
from datetime import datetime
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
STORY_STATUS_PATH = ROOT / "tasks" / "story_status_registry.json"
OUTPUT_DIR = ROOT / "tasks" / "runtime" / "final_program_acceptance"
FINAL_ACCEPTANCE_DIR = ROOT / "tasks" / "runtime" / "final_acceptance"
BROWSER_EVIDENCE_DIR = ROOT / "tasks" / "runtime" / "browser_evidence"


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

    project_link_path = ROOT / ".vercel" / "project.json"
    if project_link_path.exists():
        try:
            payload = json.loads(project_link_path.read_text(encoding="utf-8"))
            project_id = str(payload.get("projectId") or "").strip()
            org_id = str(payload.get("orgId") or "").strip()
            if project_id and "VERCEL_PROJECT_ID" not in values:
                values["VERCEL_PROJECT_ID"] = project_id
            if org_id and "VERCEL_ORG_ID" not in values:
                values["VERCEL_ORG_ID"] = org_id
        except json.JSONDecodeError:
            pass
    return values


def load_json_if_exists(path: Path) -> dict[str, object] | list[object] | None:
    if not path.exists():
        return None
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return None


def load_vercel_env_keys(local_values: dict[str, str]) -> dict[str, str]:
    project_id = str(
        os.environ.get("VERCEL_PROJECT_ID")
        or local_values.get("VERCEL_PROJECT_ID")
        or ""
    ).strip()
    org_id = str(
        os.environ.get("VERCEL_ORG_ID")
        or local_values.get("VERCEL_ORG_ID")
        or ""
    ).strip()
    if not project_id or not org_id:
        return {}

    try:
        npx_command = "npx.cmd" if os.name == "nt" else "npx"
        completed = subprocess.run(
            [
                npx_command,
                "vercel",
                "api",
                f"/v9/projects/{project_id}/env",
                "--scope",
                org_id,
                "--raw",
            ],
            cwd=ROOT,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            check=True,
        )
    except (OSError, subprocess.SubprocessError):
        return {}

    try:
        payload = json.loads(completed.stdout or "{}")
    except json.JSONDecodeError:
        return {}

    env_values: dict[str, str] = {}
    for item in payload.get("envs", []):
        if not isinstance(item, dict):
            continue
        key = str(item.get("key") or "").strip()
        if key:
            env_values[key] = "__VERCEL_ENV_PRESENT__"
    return env_values


def parse_traceability_matrix(matrix_path: Path) -> list[dict[str, str]]:
    rows: list[dict[str, str]] = []
    if not matrix_path.exists():
        return rows
    for line in matrix_path.read_text(encoding="utf-8").splitlines():
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
    payload = json.loads(STORY_STATUS_PATH.read_text(encoding="utf-8"))
    statuses: dict[str, str] = {}
    for story in payload.get("stories", []):
        if not isinstance(story, dict):
            continue
        story_id = str(story.get("story_id") or "").strip()
        if not story_id:
            continue
        statuses[story_id] = str(story.get("status") or "").strip()
    return statuses


def existing_paths(paths: list[Path]) -> list[str]:
    return [str(path) for path in paths if path.exists()]


def build_story_range(start: int, end: int) -> list[str]:
    return [f"FE-{number:03d}" for number in range(start, end + 1)]


def phase_config(phase: str) -> dict[str, object]:
    if phase == "next_phase":
        return {
            "phase": "next_phase",
            "matrix_path": ROOT / "docs" / "requirements" / "next_phase_traceability_matrix.md",
            "acceptance_doc": ROOT / "docs" / "testing" / "next_phase" / "final_program_acceptance.md",
            "story_ids": build_story_range(50, 77),
            "required_sprints": list(range(9, 15)),
            "verdict_pass": "PASS",
            "verdict_fail": "FAIL",
            "report_stem": "final_program_acceptance",
        }
    return {
        "phase": "classic",
        "matrix_path": ROOT / "docs" / "requirements" / "prd_traceability_matrix.md",
        "acceptance_doc": ROOT / "docs" / "testing" / "final_program_acceptance.md",
        "story_ids": ["FE-046", "FE-047", "FE-048", "FE-049"],
        "required_sprints": [6, 7, 8],
        "verdict_pass": "COMPLETE",
        "verdict_fail": "NOT COMPLETE",
        "report_stem": "final_program_acceptance",
    }


def build_artifact_expectations(required_sprints: list[int]) -> dict[str, list[Path]]:
    expectations: dict[str, list[Path]] = {}
    for sprint in required_sprints:
        expectations[f"sprint_{sprint}"] = [
            ROOT / "tasks" / "runtime" / "qa_results" / f"sprint_{sprint}_delivery_results.json",
            ROOT / "tasks" / "runtime" / "sprint_acceptance" / f"sprint_{sprint}_acceptance_report.md",
            ROOT / "tasks" / "runtime" / "traceability_audits" / f"sprint_{sprint}_traceability_audit.md",
        ]
    return expectations


def build_evidence_pack_index(config: dict[str, object]) -> dict[str, object]:
    required_sprints = [int(item) for item in config["required_sprints"]]
    return {
        "traceability_matrix": str(config["matrix_path"]),
        "final_acceptance_doc": str(config["acceptance_doc"]),
        "qa_results": existing_paths(
            [ROOT / "tasks" / "runtime" / "qa_results" / f"sprint_{sprint}_delivery_results.json" for sprint in required_sprints]
        ),
        "sprint_acceptance_reports": existing_paths(
            [ROOT / "tasks" / "runtime" / "sprint_acceptance" / f"sprint_{sprint}_acceptance_report.md" for sprint in required_sprints]
        ),
        "traceability_audits": existing_paths(
            [ROOT / "tasks" / "runtime" / "traceability_audits" / f"sprint_{sprint}_traceability_audit.md" for sprint in required_sprints]
        ),
        "browser_manifest": existing_paths(
            [BROWSER_EVIDENCE_DIR / "final_browser_evidence_manifest.json"]
        ),
        "api_manifest": existing_paths(
            [FINAL_ACCEPTANCE_DIR / "final_api_smoke_manifest.json"]
        ),
        "vercel_deployment_smoke": existing_paths(
            [FINAL_ACCEPTANCE_DIR / "vercel_deployment_smoke.json"]
        ),
        "handoff": existing_paths(
            [
                ROOT / "docs" / "handoff" / "current_handoff.md",
                ROOT / "PROJECT_STATE.md",
                OUTPUT_DIR / "remaining_risks.md",
                OUTPUT_DIR / "final_evidence_pack_index.md",
            ]
        ),
    }


def collect_missing_artifacts(required_sprints: list[int]) -> dict[str, list[str]]:
    missing_artifacts = {
        sprint_id: [str(path) for path in paths if not path.exists()]
        for sprint_id, paths in build_artifact_expectations(required_sprints).items()
    }
    return {sprint_id: items for sprint_id, items in missing_artifacts.items() if items}


def collect_external_dependency_status(phase: str) -> list[dict[str, object]]:
    if phase != "next_phase":
        return []

    vercel_smoke_artifact = FINAL_ACCEPTANCE_DIR / "vercel_deployment_smoke.json"
    local_env = load_local_env()
    vercel_env = load_vercel_env_keys(local_env)
    vercel_env_keys = set(vercel_env.keys())
    env = {**local_env, **vercel_env, **os.environ}
    vercel_smoke_payload = load_json_if_exists(vercel_smoke_artifact)

    def vercel_smoke_ready() -> bool:
        if not isinstance(vercel_smoke_payload, dict):
            return False
        if str(vercel_smoke_payload.get("status") or "").strip().lower() != "pass":
            return False
        project_payload = vercel_smoke_payload.get("project")
        suites_payload = vercel_smoke_payload.get("suites")
        if not isinstance(project_payload, dict) or not isinstance(suites_payload, list):
            return False
        return all(
            isinstance(item, dict)
            and item.get("status") == "passed"
            and item.get("readyState") == "READY"
            and item.get("linkedRepoMatch") is not False
            for item in suites_payload
        )

    def vercel_git_alignment_ready() -> bool:
        if not isinstance(vercel_smoke_payload, dict):
            return False
        project_payload = vercel_smoke_payload.get("project")
        suites_payload = vercel_smoke_payload.get("suites")
        if not isinstance(project_payload, dict):
            return False
        if project_payload.get("productionBranch") != "main":
            return False
        if not isinstance(suites_payload, list) or not suites_payload:
            return False
        return all(
            isinstance(item, dict) and item.get("linkedRepoMatch") is not False
            for item in suites_payload
        )

    def build_result(
        *,
        check_id: str,
        description: str,
        required_env: list[str],
        follow_up: str,
        extra_check,
        required_artifacts: list[Path] | None = None,
    ) -> dict[str, object]:
        required_artifacts = required_artifacts or []
        if vercel_env_keys:
            configured_env = [name for name in required_env if name in vercel_env_keys]
        else:
            configured_env = [name for name in required_env if str(env.get(name) or "").strip()]
        configured_artifacts = [str(path) for path in required_artifacts if path.exists()]
        configured = (
            len(configured_env) == len(required_env)
            and len(configured_artifacts) == len(required_artifacts)
            and bool(extra_check(env))
        )
        return {
            "id": check_id,
            "description": description,
            "required_env": required_env,
            "configured_env": configured_env,
            "required_artifacts": [str(path) for path in required_artifacts],
            "configured_artifacts": configured_artifacts,
            "status": "configured" if configured else "follow_up",
            "follow_up": follow_up,
        }

    checks = [
        build_result(
            check_id="neon_database",
            description="Neon Postgres connection for Vercel-hosted FamilyEducation tables",
            required_env=["DATABASE_URL"],
            required_artifacts=[],
            extra_check=lambda current_env: True,
            follow_up="Attach a Neon Postgres database to the Vercel project and run the Drizzle migrations against DATABASE_URL.",
        ),
        build_result(
            check_id="openai_live_processing",
            description="OpenAI live vision pipeline for FamilyEducation analysis runs",
            required_env=["OPENAI_API_KEY", "OPENAI_MODEL_VISION"],
            required_artifacts=[],
            extra_check=lambda current_env: not str(current_env.get("FAMILY_EDU_DEMO_MODE") or "1").strip().startswith("1"),
            follow_up="Provide a live OpenAI API key and model so preview and production runs use the real extraction pipeline instead of demo mode.",
        ),
        build_result(
            check_id="creem_live_checkout",
            description="Creem live billing credentials and product mapping",
            required_env=[
                "CREEM_API_KEY",
                "CREEM_WEBHOOK_SECRET",
                "CREEM_PRODUCT_ONE_TIME_ID",
                "CREEM_PRODUCT_MONTHLY_ID",
                "CREEM_PRODUCT_ANNUAL_ID",
            ],
            required_artifacts=[],
            extra_check=lambda current_env: not str(current_env.get("CREEM_TEST_MODE") or "1").strip().startswith("1"),
            follow_up="Switch off test mode and point checkout/webhook flows at live Creem products.",
        ),
        build_result(
            check_id="google_oauth",
            description="Google OAuth production registration",
            required_env=["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "GOOGLE_REDIRECT_URI"],
            required_artifacts=[],
            extra_check=lambda current_env: True,
            follow_up="Register the production callback URL and verify success and failure paths against Google.",
        ),
        build_result(
            check_id="vercel_blob_storage",
            description="Vercel Blob storage for upload, artifact, export, and share payloads",
            required_env=["FILE_STORAGE_BACKEND", "BLOB_READ_WRITE_TOKEN"],
            required_artifacts=[],
            extra_check=lambda current_env: str(current_env.get("FILE_STORAGE_BACKEND") or "local").strip().lower() == "blob",
            follow_up="Move artifact reads and writes onto Vercel Blob and verify blob lifecycle in preview and production lanes.",
        ),
        build_result(
            check_id="vercel_preview_and_prod",
            description="Preview and production Vercel smoke evidence",
            required_env=["VERCEL_PROJECT_ID", "VERCEL_ORG_ID"],
            required_artifacts=[vercel_smoke_artifact],
            extra_check=lambda current_env: vercel_smoke_ready(),
            follow_up="Rerun Git-based preview and production deployments until both deployments are READY, route smoke passes, and the smoke report stays green.",
        ),
        build_result(
            check_id="vercel_git_autodeploy",
            description="Vercel linked GitHub repository and main branch auto deploy path stay aligned with the actual deployments",
            required_env=["VERCEL_PROJECT_ID", "VERCEL_ORG_ID"],
            required_artifacts=[vercel_smoke_artifact],
            extra_check=lambda current_env: vercel_git_alignment_ready(),
            follow_up="Keep the Vercel project linked to the FamilyEducation GitHub repo, confirm main stays the production branch, and rerun Git-based preview and production deployments until the smoke report shows deployment repo alignment.",
        ),
    ]

    return checks


def write_markdown_list(lines: list[str], items: list[str], *, fallback: str = "- None") -> None:
    if not items:
        lines.append(fallback)
        return
    lines.extend([f"- {item}" for item in items])


def write_evidence_pack_index(path: Path, evidence_pack_index: dict[str, object]) -> None:
    lines = ["# Final Evidence Pack Index", ""]
    for key, value in evidence_pack_index.items():
        if isinstance(value, list):
            lines.append(f"## {key}")
            lines.append("")
            write_markdown_list(lines, value)
            lines.append("")
            continue
        lines.append(f"- {key}: `{value}`")
    path.write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")


def write_remaining_risks(path: Path, blockers: list[str], dependency_status: list[dict[str, object]]) -> None:
    lines = ["# Remaining Risks", ""]
    if blockers:
        lines.append("## Active Blockers")
        lines.append("")
        write_markdown_list(lines, blockers)
        lines.append("")
    else:
        lines.append("## Active Blockers")
        lines.append("")
        lines.append("- None")
        lines.append("")

    lines.append("## External Follow-Up")
    lines.append("")
    external_followups = [
        f"{item['id']}: {item['follow_up']}"
        for item in dependency_status
        if item.get("status") != "configured"
    ]
    write_markdown_list(lines, external_followups)
    path.write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")


def run_beta_smoke_mode(config: dict[str, object]) -> int:
    generated_at = datetime.now().isoformat(timespec="seconds")
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    matrix_rows = parse_traceability_matrix(Path(config["matrix_path"]))
    non_green_rows = [row for row in matrix_rows if row["status"].lower() != "green"]
    dependency_status = collect_external_dependency_status(str(config["phase"]))
    blockers = [
        f"{row['requirement_id']}: status={row['status']}"
        for row in non_green_rows
    ]
    blockers.extend(
        f"{item['id']}: {item['follow_up']}"
        for item in dependency_status
        if item["status"] != "configured"
    )

    smoke_manifest = FINAL_ACCEPTANCE_DIR / "final_api_smoke_manifest.json"
    browser_manifest = BROWSER_EVIDENCE_DIR / "final_browser_evidence_manifest.json"
    checklist = {
        "generated_at": generated_at,
        "phase": config["phase"],
        "checklist": [
            {
                "name": "local_beta_smoke",
                "status": "pass" if smoke_manifest.exists() else "missing",
                "artifact": str(smoke_manifest),
            },
            {
                "name": "browser_evidence_pack",
                "status": "pass" if browser_manifest.exists() else "missing",
                "artifact": str(browser_manifest),
            },
            {
                "name": "release_packet_definition",
                "status": "pass" if Path(config["acceptance_doc"]).exists() else "missing",
                "artifact": str(config["acceptance_doc"]),
            },
        ],
        "non_green_requirements": [row["requirement_id"] for row in non_green_rows],
        "external_dependencies": dependency_status,
        "blockers": blockers,
    }

    checklist_json = OUTPUT_DIR / "beta_release_checklist.json"
    checklist_md = OUTPUT_DIR / "beta_release_checklist.md"
    blocker_json = OUTPUT_DIR / "beta_blocker_register.json"
    blocker_md = OUTPUT_DIR / "beta_blocker_register.md"
    checklist_json.write_text(json.dumps(checklist, indent=2, ensure_ascii=False), encoding="utf-8")
    blocker_json.write_text(
        json.dumps(
            {
                "generated_at": generated_at,
                "phase": config["phase"],
                "blockers": blockers,
                "external_dependencies": dependency_status,
            },
            indent=2,
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )

    checklist_lines = [
        "# Beta Release Checklist",
        "",
        f"Generated at: `{generated_at}`",
        "",
        "## Deterministic Gates",
        "",
    ]
    for item in checklist["checklist"]:
        checklist_lines.append(
            f"- {item['name']}: `{item['status']}` -> `{item['artifact']}`"
        )
    checklist_lines.extend(["", "## Current Non-Green Requirements", ""])
    write_markdown_list(
        checklist_lines,
        [row["requirement_id"] for row in non_green_rows],
    )
    checklist_lines.extend(["", "## External Dependencies", ""])
    write_markdown_list(
        checklist_lines,
        [
            f"{item['id']}: {item['status']} ({', '.join(item['required_env']) or 'manual verification'})"
            for item in dependency_status
        ],
    )
    checklist_md.write_text("\n".join(checklist_lines).rstrip() + "\n", encoding="utf-8")

    blocker_lines = [
        "# Beta Blocker Register",
        "",
        f"Generated at: `{generated_at}`",
        "",
    ]
    write_markdown_list(blocker_lines, blockers)
    blocker_md.write_text("\n".join(blocker_lines).rstrip() + "\n", encoding="utf-8")

    write_remaining_risks(OUTPUT_DIR / "remaining_risks.md", blockers, dependency_status)
    print(json.dumps({"status": "pass", "mode": "beta_smoke", "report": str(checklist_json)}, ensure_ascii=False))
    return 0


def run_final_mode(config: dict[str, object]) -> int:
    generated_at = datetime.now().isoformat(timespec="seconds")
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    rows = parse_traceability_matrix(Path(config["matrix_path"]))
    story_statuses = load_story_statuses()
    required_story_ids = [str(item) for item in config["story_ids"]]
    required_sprints = [int(item) for item in config["required_sprints"]]
    non_green_rows = [row for row in rows if row["status"].lower() != "green"]
    missing_story_acceptance = {
        story_id: status
        for story_id, status in story_statuses.items()
        if story_id in required_story_ids and status != "accepted"
    }
    missing_story_acceptance.update(
        {
            story_id: "missing_status"
            for story_id in required_story_ids
            if story_id not in story_statuses
        }
    )
    missing_artifacts = collect_missing_artifacts(required_sprints)
    dependency_status = collect_external_dependency_status(str(config["phase"]))

    blockers: list[str] = []
    blockers.extend(
        f"{row['requirement_id']}: status={row['status']}"
        for row in non_green_rows
    )
    blockers.extend(
        f"{story_id}: status={status}"
        for story_id, status in sorted(missing_story_acceptance.items())
    )
    for sprint_id, artifacts in missing_artifacts.items():
        blockers.extend([f"{sprint_id}: missing_artifact={artifact}" for artifact in artifacts])
    blockers.extend(
        f"{item['id']}: {item['follow_up']}"
        for item in dependency_status
        if item["status"] != "configured"
    )

    evidence_pack_index = build_evidence_pack_index(config)
    requirement_coverage = {
        "total_requirements": len(rows),
        "green_requirements": len(rows) - len(non_green_rows),
        "non_green_requirements": len(non_green_rows),
        "non_green_ids": [row["requirement_id"] for row in non_green_rows],
    }

    verdict = str(config["verdict_pass"] if not blockers else config["verdict_fail"])
    payload = {
        "generated_at": generated_at,
        "phase": config["phase"],
        "verdict": verdict,
        "requirement_coverage": requirement_coverage,
        "evidence_gaps": {
            "non_green_requirements": non_green_rows,
            "missing_story_acceptance": missing_story_acceptance,
            "missing_artifacts": missing_artifacts,
            "external_dependencies": dependency_status,
        },
        "blockers": blockers,
        "evidence_pack_index": evidence_pack_index,
    }

    json_path = OUTPUT_DIR / "final_program_acceptance.json"
    md_path = OUTPUT_DIR / "final_program_acceptance.md"
    json_path.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")

    lines = [
        "# Final Program Acceptance",
        "",
        f"Generated at: `{generated_at}`",
        "",
        f"Phase: `{config['phase']}`",
        "",
        f"Verdict: `{verdict}`",
        "",
        "## Requirement Coverage",
        "",
        f"- Total requirements: `{requirement_coverage['total_requirements']}`",
        f"- Green requirements: `{requirement_coverage['green_requirements']}`",
        f"- Non-green requirements: `{requirement_coverage['non_green_requirements']}`",
        "",
        "## Blockers",
        "",
    ]
    write_markdown_list(lines, blockers)
    lines.extend(["", "## Evidence Pack Index", ""])
    for key, value in evidence_pack_index.items():
        if isinstance(value, list):
            lines.append(f"- {key}: {', '.join(value) if value else 'None'}")
        else:
            lines.append(f"- {key}: `{value}`")
    md_path.write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")

    write_evidence_pack_index(OUTPUT_DIR / "final_evidence_pack_index.md", evidence_pack_index)
    write_remaining_risks(OUTPUT_DIR / "remaining_risks.md", blockers, dependency_status)
    print(json.dumps({"verdict": verdict, "report": str(json_path)}, ensure_ascii=False))
    return 0 if not blockers else 1


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--phase", choices=["classic", "next_phase"], default="classic")
    parser.add_argument("--mode", choices=["final", "beta_smoke"], default="final")
    args = parser.parse_args()

    config = phase_config(args.phase)
    if args.mode == "beta_smoke":
        return run_beta_smoke_mode(config)
    return run_final_mode(config)


if __name__ == "__main__":
    sys.exit(main())
