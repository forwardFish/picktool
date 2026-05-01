from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
RUNTIME_ROOT = ROOT / "tasks" / "runtime"
LOCAL_RUNTIME = RUNTIME_ROOT / "family_local_runtime"
OBSERVABILITY_ROOT = RUNTIME_ROOT / "observability"
RETENTION_ROOT = RUNTIME_ROOT / "retention"

STATE_PATH = LOCAL_RUNTIME / "family_mock_state.json"
REMINDER_PATH = LOCAL_RUNTIME / "reminder_events.json"
LIFECYCLE_PATH = OBSERVABILITY_ROOT / "run_lifecycle_events.json"
ERROR_PATH = OBSERVABILITY_ROOT / "error_events.json"
COST_PATH = OBSERVABILITY_ROOT / "cost_artifacts.json"
RUN_ARTIFACT_DIR = OBSERVABILITY_ROOT / "run_artifacts"

CHILD_RETENTION_DAYS = 30
EVENT_RETENTION_DAYS = 30
REMINDER_RETENTION_DAYS = 90


@dataclass
class CleanupStats:
    archived_children_purged: int = 0
    linked_uploads_removed: int = 0
    linked_runs_removed: int = 0
    linked_reports_removed: int = 0
    linked_share_links_removed: int = 0
    reminder_events_removed: int = 0
    lifecycle_events_removed: int = 0
    error_events_removed: int = 0
    cost_artifacts_removed: int = 0
    run_artifact_files_removed: int = 0


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def parse_iso(value: str | None) -> datetime | None:
    if not value:
        return None
    normalized = value.replace("Z", "+00:00")
    try:
        return datetime.fromisoformat(normalized)
    except ValueError:
        return None


def read_json(path: Path, default: dict) -> dict:
    if not path.exists():
        return default
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return default


def write_json(path: Path, payload: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def should_purge(timestamp: str | None, retention_days: int) -> bool:
    created_at = parse_iso(timestamp)
    if created_at is None:
        return False
    return created_at <= now_utc() - timedelta(days=retention_days)


def cleanup_state(stats: CleanupStats) -> dict:
    state = read_json(
        STATE_PATH,
        {
            "children": [],
            "uploads": [],
            "uploadFiles": [],
            "pages": [],
            "runs": [],
            "reports": [],
            "problemItems": [],
            "itemErrors": [],
            "shareLinks": [],
        },
    )

    children = state.get("children", [])
    purge_child_ids = {
        child["id"]
        for child in children
        if should_purge(child.get("deletedAt"), CHILD_RETENTION_DAYS)
    }
    if not purge_child_ids:
        return state

    uploads = state.get("uploads", [])
    purge_upload_ids = {
        upload["id"] for upload in uploads if upload.get("childId") in purge_child_ids
    }
    runs = state.get("runs", [])
    purge_run_ids = {
        run["id"] for run in runs if run.get("uploadId") in purge_upload_ids
    }
    reports = state.get("reports", [])
    purge_report_ids = {
        report["id"] for report in reports if report.get("runId") in purge_run_ids
    }
    problem_items = state.get("problemItems", [])
    purge_item_ids = {
        item["id"] for item in problem_items if item.get("runId") in purge_run_ids
    }

    stats.archived_children_purged += len(purge_child_ids)
    stats.linked_uploads_removed += len(purge_upload_ids)
    stats.linked_runs_removed += len(purge_run_ids)
    stats.linked_reports_removed += len(purge_report_ids)

    share_links = state.get("shareLinks", [])
    linked_share_links_removed = sum(
        1 for share_link in share_links if share_link.get("reportId") in purge_report_ids
    )
    stats.linked_share_links_removed += linked_share_links_removed

    state["children"] = [
        child for child in children if child.get("id") not in purge_child_ids
    ]
    state["uploads"] = [
        upload for upload in uploads if upload.get("id") not in purge_upload_ids
    ]
    state["uploadFiles"] = [
        file for file in state.get("uploadFiles", []) if file.get("uploadId") not in purge_upload_ids
    ]
    state["pages"] = [
        page for page in state.get("pages", []) if page.get("uploadId") not in purge_upload_ids
    ]
    state["runs"] = [run for run in runs if run.get("id") not in purge_run_ids]
    state["reports"] = [
        report for report in reports if report.get("id") not in purge_report_ids
    ]
    state["problemItems"] = [
        item for item in problem_items if item.get("id") not in purge_item_ids
    ]
    state["itemErrors"] = [
        item_error
        for item_error in state.get("itemErrors", [])
        if item_error.get("itemId") not in purge_item_ids
    ]
    state["shareLinks"] = [
        share_link
        for share_link in share_links
        if share_link.get("reportId") not in purge_report_ids
    ]

    return state


def cleanup_events(path: Path, key: str, retention_days: int, stats: CleanupStats, stat_name: str) -> None:
    payload = read_json(path, {key: []})
    events = payload.get(key, [])
    kept = [event for event in events if not should_purge(event.get("createdAt"), retention_days)]
    removed = len(events) - len(kept)
    setattr(stats, stat_name, getattr(stats, stat_name) + removed)
    payload[key] = kept
    write_json(path, payload)


def cleanup_cost_artifacts(stats: CleanupStats) -> None:
    payload = read_json(COST_PATH, {"artifacts": []})
    artifacts = payload.get("artifacts", [])
    kept = []

    for artifact in artifacts:
        if should_purge(artifact.get("createdAt"), EVENT_RETENTION_DAYS):
            stats.cost_artifacts_removed += 1
            run_id = artifact.get("runId")
            if isinstance(run_id, int):
                artifact_path = RUN_ARTIFACT_DIR / f"run_{run_id}.json"
                if artifact_path.exists():
                    artifact_path.unlink()
                    stats.run_artifact_files_removed += 1
            continue
        kept.append(artifact)

    payload["artifacts"] = kept
    write_json(COST_PATH, payload)


def cleanup_reminders(stats: CleanupStats) -> None:
    payload = read_json(REMINDER_PATH, {"events": []})
    events = payload.get("events", [])
    kept = [event for event in events if not should_purge(event.get("createdAt"), REMINDER_RETENTION_DAYS)]
    stats.reminder_events_removed += len(events) - len(kept)
    payload["events"] = kept
    write_json(REMINDER_PATH, payload)


def main() -> int:
    stats = CleanupStats()

    if STATE_PATH.exists():
        next_state = cleanup_state(stats)
        write_json(STATE_PATH, next_state)

    cleanup_reminders(stats)
    cleanup_events(LIFECYCLE_PATH, "events", EVENT_RETENTION_DAYS, stats, "lifecycle_events_removed")
    cleanup_events(ERROR_PATH, "events", EVENT_RETENTION_DAYS, stats, "error_events_removed")
    cleanup_cost_artifacts(stats)

    audit_payload = {
        "generated_at": now_utc().isoformat(),
        "retention_windows": {
            "archived_children_days": CHILD_RETENTION_DAYS,
            "runtime_event_days": EVENT_RETENTION_DAYS,
            "reminder_event_days": REMINDER_RETENTION_DAYS,
        },
        "cleanup_counts": stats.__dict__,
    }
    RETENTION_ROOT.mkdir(parents=True, exist_ok=True)
    write_json(RETENTION_ROOT / "latest_cleanup_audit.json", audit_payload)
    print(json.dumps(audit_payload, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
