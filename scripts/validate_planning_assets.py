from __future__ import annotations

import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]

REQUIREMENT_INDEX = ROOT / "docs" / "requirements" / "prd_requirement_index.md"
TRACEABILITY_MATRIX = ROOT / "docs" / "requirements" / "prd_traceability_matrix.md"
PAGE_MATRIX = ROOT / "docs" / "testing" / "page_test_matrix.md"
CLICK_MATRIX = ROOT / "docs" / "testing" / "click_path_matrix.md"
API_MATRIX = ROOT / "docs" / "testing" / "api_data_ai_test_matrix.md"
GOV_MATRIX = ROOT / "docs" / "testing" / "governance_test_matrix.md"
FINAL_ACCEPTANCE = ROOT / "docs" / "testing" / "final_program_acceptance.md"
SPRINT_TEMPLATE = ROOT / "docs" / "testing" / "sprint_acceptance_template.md"
BACKLOG_ROOTS = [
    ROOT / "tasks" / "backlog_v1",
    ROOT / "tasks" / "backlog_v3_diagnosis_1_2_2",
    ROOT / "tasks" / "backlog_v4_diagnosis_player_1_3_x",
    ROOT / "tasks" / "backlog_v5_stage1_boundary_1_3_4",
    ROOT / "tasks" / "backlog_v6_freemius_primary_billing_1_4",
    ROOT / "tasks" / "backlog_v7_homepage_display_rewrite_1_5",
    ROOT / "tasks" / "backlog_v8_pathnook_dashboard_1_7",
]
STATUS_REGISTRY = ROOT / "tasks" / "story_status_registry.json"
ACCEPTANCE_REVIEWS = ROOT / "tasks" / "story_acceptance_reviews.json"
CONTINUITY_MANIFEST = (
    ROOT / ".meta" / "familyEducation" / "continuity" / "continuity_manifest.json"
)


def ensure_file(path: Path, errors: list[str]) -> None:
    if not path.exists():
      errors.append(f"Missing required file: {path}")


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def parse_markdown_table_first_column(text: str) -> list[str]:
    values: list[str] = []
    for line in text.splitlines():
        stripped = line.strip()
        if not stripped.startswith("|"):
            continue
        cells = [cell.strip() for cell in stripped.strip("|").split("|")]
        if not cells or cells[0] in {"Requirement ID", "Test ID"}:
            continue
        if set(cells[0]) == {"-"}:
            continue
        values.append(cells[0])
    return values


def parse_story_list(block_name: str, text: str) -> dict[str, list[str]]:
    items: dict[str, list[str]] = {}
    current_key: str | None = None
    for raw_line in text.splitlines():
        line = raw_line.rstrip()
        if re.match(r"^[A-Za-z0-9_]+:", line):
            current_key = line.split(":", 1)[0]
            continue
        if current_key in {block_name} and line.startswith("  - "):
            items.setdefault(block_name, []).append(line[4:].strip().strip('"'))
    return items


def parse_story_file(path: Path) -> dict[str, object]:
    text = read_text(path)
    data: dict[str, object] = {"path": path}

    simple_fields = [
        "story_id",
        "task_id",
        "task_name",
        "sprint",
        "epic",
        "workflow_enforcement_policy",
        "story_type",
    ]
    for field in simple_fields:
        match = re.search(rf"^{field}:\s*\"?(.*?)\"?\s*$", text, re.MULTILINE)
        if match:
            data[field] = match.group(1).strip()

    for list_field in ["requirement_ids", "test_case_ids", "expected_evidence", "required_modes"]:
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


def parse_click_test_ids(text: str) -> list[str]:
    return re.findall(r"##\s+(CLICK(?:-[A-Z0-9]+)?-\d+)", text)


def parse_story_ids_from_traceability(text: str) -> set[str]:
    story_ids = set()
    for line in text.splitlines():
        if not line.strip().startswith("|"):
            continue
        matches = re.findall(r"FE-\d{3}", line)
        story_ids.update(matches)
    return story_ids


def find_story_files(backlog_roots: list[Path]) -> list[Path]:
    story_files: list[Path] = []
    for backlog_root in backlog_roots:
        if backlog_root.exists():
            story_files.extend(sorted(backlog_root.glob("**/FE-*.yaml")))
    return story_files


def build_story_index(story_files: list[Path]) -> dict[str, Path]:
    index: dict[str, Path] = {}
    for story_file in story_files:
        index[story_file.stem] = story_file
    return index


def main() -> int:
    errors: list[str] = []

    required_files = [
        REQUIREMENT_INDEX,
        TRACEABILITY_MATRIX,
        PAGE_MATRIX,
        CLICK_MATRIX,
        API_MATRIX,
        GOV_MATRIX,
        FINAL_ACCEPTANCE,
        SPRINT_TEMPLATE,
        STATUS_REGISTRY,
        ACCEPTANCE_REVIEWS,
        CONTINUITY_MANIFEST,
    ]
    required_files.extend(backlog_root / "sprint_overview.md" for backlog_root in BACKLOG_ROOTS)
    for path in required_files:
        ensure_file(path, errors)

    if errors:
        for error in errors:
            print(f"ERROR: {error}")
        return 1

    requirement_ids = set(parse_markdown_table_first_column(read_text(REQUIREMENT_INDEX)))
    traceability_rows = parse_markdown_table_first_column(read_text(TRACEABILITY_MATRIX))
    traceability_ids = set(traceability_rows)

    missing_traceability = sorted(requirement_ids - traceability_ids)
    if missing_traceability:
        errors.append(
            "Requirement IDs missing from traceability matrix: "
            + ", ".join(missing_traceability)
        )

    page_test_ids = set(parse_markdown_table_first_column(read_text(PAGE_MATRIX)))
    click_test_ids = set(parse_click_test_ids(read_text(CLICK_MATRIX)))
    api_test_ids = set(parse_markdown_table_first_column(read_text(API_MATRIX)))
    gov_test_ids = set(parse_markdown_table_first_column(read_text(GOV_MATRIX)))
    final_test_ids = set(
        re.findall(r"\b(?:FP-\d{3}|FP-[A-Z0-9]+-\d{3})\b", read_text(FINAL_ACCEPTANCE))
    )
    known_test_ids = page_test_ids | click_test_ids | api_test_ids | gov_test_ids | final_test_ids

    story_files = find_story_files(BACKLOG_ROOTS)
    if not story_files:
        errors.append("No story YAML files found in authoritative PRD backlogs.")

    known_story_ids = {path.stem for path in story_files}
    story_index = build_story_index(story_files)
    traceability_story_ids = parse_story_ids_from_traceability(read_text(TRACEABILITY_MATRIX))
    missing_story_ids = sorted(traceability_story_ids - known_story_ids)
    if missing_story_ids:
        errors.append(
            "Traceability references unknown story IDs: " + ", ".join(missing_story_ids)
        )

    sprint_dirs: list[Path] = []
    for backlog_root in BACKLOG_ROOTS:
        if backlog_root.exists():
            sprint_dirs.extend(sorted(path for path in backlog_root.iterdir() if path.is_dir()))
    acceptance_story_ids: set[str] = set()
    for sprint_dir in sprint_dirs:
        execution_order = sprint_dir / "execution_order.txt"
        ensure_file(execution_order, errors)
        if execution_order.exists():
            order_text = read_text(execution_order)
            matches = re.findall(r"FE-\d{3}", order_text)
            acceptance_matches = [
                story_id
                for story_id in matches
                if (
                    story_id in story_index
                    and str(parse_story_file(story_index[story_id]).get("story_type") or "").strip()
                    == "sprint_acceptance_story"
                )
            ]
            if not acceptance_matches:
                errors.append(f"No Sprint Acceptance Story found in {execution_order}")
            acceptance_story_ids.update(acceptance_matches)

    for story_path in story_files:
        story = parse_story_file(story_path)
        story_id = str(story.get("story_id") or story_path.stem)
        required_fields = ["requirement_ids", "test_case_ids", "expected_evidence", "required_modes"]
        for field in required_fields:
            value = story.get(field)
            if not isinstance(value, list) or not value:
                errors.append(f"{story_id}: missing or empty {field}")

        for requirement_id in story.get("requirement_ids", []):
            if requirement_id not in requirement_ids:
                errors.append(f"{story_id}: unknown requirement_id {requirement_id}")

        for test_case_id in story.get("test_case_ids", []):
            if test_case_id not in known_test_ids:
                errors.append(f"{story_id}: unknown test_case_id {test_case_id}")

        workflow_policy = story.get("workflow_enforcement_policy")
        if workflow_policy != "strict_agentsystem":
            errors.append(f"{story_id}: workflow_enforcement_policy must be strict_agentsystem")

    if errors:
        for error in errors:
            print(f"ERROR: {error}")
        return 1

    print("PASS: planning assets are structurally complete and internally linked.")
    print(f"PASS: validated {len(requirement_ids)} requirement IDs.")
    print(f"PASS: validated {len(story_files)} story YAML files.")
    print(f"PASS: validated {len(known_test_ids)} test case IDs across matrices.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
