from __future__ import annotations

import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]

SOURCE_PRD = ROOT / "docs" / "需求文档_1.1.md"
SYSTEM_SUMMARY = ROOT / "docs" / "handoff" / "full_system_summary.md"
REQUIREMENT_INDEX = ROOT / "docs" / "requirements" / "next_phase_requirement_index.md"
TRACEABILITY_MATRIX = ROOT / "docs" / "requirements" / "next_phase_traceability_matrix.md"
TESTING_ROOT = ROOT / "docs" / "testing" / "next_phase"
PAGE_MATRIX = TESTING_ROOT / "page_test_matrix.md"
CLICK_MATRIX = TESTING_ROOT / "click_path_matrix.md"
API_MATRIX = TESTING_ROOT / "api_data_ai_test_matrix.md"
GOV_MATRIX = TESTING_ROOT / "governance_test_matrix.md"
FINAL_ACCEPTANCE = TESTING_ROOT / "final_program_acceptance.md"
SPRINT_TEMPLATE = TESTING_ROOT / "sprint_acceptance_template.md"
MASTER_TEST_PLAN = TESTING_ROOT / "master_test_plan.md"
BACKLOG_ROOT = ROOT / "tasks" / "backlog_v2_beta_launch"

EXPECTED_STORY_COUNT = 28
EXPECTED_ACCEPTANCE_STORY_IDS = {
    "FE-053",
    "FE-057",
    "FE-062",
    "FE-067",
    "FE-072",
    "FE-077",
}


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
        if not cells:
            continue
        first = cells[0]
        if first in {"Requirement ID", "Test ID"}:
            continue
        if set(first) == {"-"}:
            continue
        values.append(first)
    return values


def parse_story_file(path: Path) -> dict[str, object]:
    text = read_text(path)
    data: dict[str, object] = {"path": path}

    simple_fields = [
        "story_id",
        "task_id",
        "task_name",
        "sprint",
        "epic",
        "story_type",
        "workflow_enforcement_policy",
        "execution_policy",
        "interaction_policy",
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
    return re.findall(r"##\s+(CLICK2-\d+)", text)


def parse_final_test_ids(text: str) -> set[str]:
    return set(re.findall(r"\bFP2-\d{3}\b", text))


def parse_story_ids_from_traceability(text: str) -> set[str]:
    story_ids = set()
    for line in text.splitlines():
        if not line.strip().startswith("|"):
            continue
        story_ids.update(re.findall(r"FE-\d{3}", line))
    return story_ids


def validate_sprint_structure(sprint_dir: Path, errors: list[str]) -> set[str]:
    ensure_file(sprint_dir / "sprint_plan.md", errors)
    ensure_file(sprint_dir / "execution_order.txt", errors)
    epic_docs = sorted(sprint_dir.glob("epic_*.md"))
    if not epic_docs:
        errors.append(f"{sprint_dir}: missing epic markdown files")

    acceptance_ids: set[str] = set()
    execution_order = sprint_dir / "execution_order.txt"
    if execution_order.exists():
        order_text = read_text(execution_order)
        ordered_ids = re.findall(r"FE-\d{3}", order_text)
        if not ordered_ids:
            errors.append(f"{execution_order}: contains no story IDs")
        acceptance_ids.update(story_id for story_id in ordered_ids if story_id in EXPECTED_ACCEPTANCE_STORY_IDS)

    return acceptance_ids


def main() -> int:
    errors: list[str] = []

    required_files = [
        SOURCE_PRD,
        SYSTEM_SUMMARY,
        REQUIREMENT_INDEX,
        TRACEABILITY_MATRIX,
        PAGE_MATRIX,
        CLICK_MATRIX,
        API_MATRIX,
        GOV_MATRIX,
        FINAL_ACCEPTANCE,
        SPRINT_TEMPLATE,
        MASTER_TEST_PLAN,
        BACKLOG_ROOT / "sprint_overview.md",
    ]
    for path in required_files:
        ensure_file(path, errors)

    if errors:
        for error in errors:
            print(f"ERROR: {error}")
        return 1

    requirement_ids = set(parse_markdown_table_first_column(read_text(REQUIREMENT_INDEX)))
    traceability_ids = set(parse_markdown_table_first_column(read_text(TRACEABILITY_MATRIX)))

    missing_traceability = sorted(requirement_ids - traceability_ids)
    if missing_traceability:
        errors.append(
            "Requirement IDs missing from next-phase traceability matrix: "
            + ", ".join(missing_traceability)
        )

    page_test_ids = set(parse_markdown_table_first_column(read_text(PAGE_MATRIX)))
    click_test_ids = set(parse_click_test_ids(read_text(CLICK_MATRIX)))
    api_test_ids = set(parse_markdown_table_first_column(read_text(API_MATRIX)))
    gov_test_ids = set(parse_markdown_table_first_column(read_text(GOV_MATRIX)))
    final_test_ids = parse_final_test_ids(read_text(FINAL_ACCEPTANCE))
    known_test_ids = page_test_ids | click_test_ids | api_test_ids | gov_test_ids | final_test_ids

    story_files = sorted(BACKLOG_ROOT.glob("**/FE-*.yaml"))
    if len(story_files) != EXPECTED_STORY_COUNT:
        errors.append(
            f"Expected {EXPECTED_STORY_COUNT} story YAML files, found {len(story_files)}"
        )

    known_story_ids = {path.stem for path in story_files}
    traceability_story_ids = parse_story_ids_from_traceability(read_text(TRACEABILITY_MATRIX))
    missing_story_ids = sorted(traceability_story_ids - known_story_ids)
    if missing_story_ids:
        errors.append(
            "Traceability references unknown story IDs: " + ", ".join(missing_story_ids)
        )

    acceptance_story_ids: set[str] = set()
    sprint_dirs = sorted(path for path in BACKLOG_ROOT.iterdir() if path.is_dir())
    if len(sprint_dirs) != 6:
        errors.append(f"Expected 6 sprint directories, found {len(sprint_dirs)}")
    for sprint_dir in sprint_dirs:
        acceptance_story_ids.update(validate_sprint_structure(sprint_dir, errors))

    if acceptance_story_ids != EXPECTED_ACCEPTANCE_STORY_IDS:
        missing = sorted(EXPECTED_ACCEPTANCE_STORY_IDS - acceptance_story_ids)
        extra = sorted(acceptance_story_ids - EXPECTED_ACCEPTANCE_STORY_IDS)
        if missing:
            errors.append("Missing expected Sprint Acceptance Story IDs: " + ", ".join(missing))
        if extra:
            errors.append("Unexpected Sprint Acceptance Story IDs: " + ", ".join(extra))

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

        if story.get("workflow_enforcement_policy") != "strict_agentsystem":
            errors.append(f"{story_id}: workflow_enforcement_policy must be strict_agentsystem")

        if story.get("execution_policy") != "continuous_full_sprint":
            errors.append(f"{story_id}: execution_policy must be continuous_full_sprint")

        if story.get("interaction_policy") != "non_interactive_auto_run":
            errors.append(f"{story_id}: interaction_policy must be non_interactive_auto_run")

        required_modes = set(story.get("required_modes", []))
        for mode in ["plan-eng-review", "qa", "review", "code_acceptance", "acceptance_gate", "doc_writer"]:
            if mode not in required_modes:
                errors.append(f"{story_id}: missing required mode {mode}")

        if story.get("story_type") == "sprint_acceptance_story":
            for mode in ["ship", "document-release", "retro"]:
                if mode not in required_modes:
                    errors.append(f"{story_id}: sprint acceptance story missing mode {mode}")

    if errors:
        for error in errors:
            print(f"ERROR: {error}")
        return 1

    print("PASS: next-phase planning assets are structurally complete and internally linked.")
    print(f"PASS: validated {len(requirement_ids)} next-phase requirement IDs.")
    print(f"PASS: validated {len(story_files)} story YAML files.")
    print(f"PASS: validated {len(known_test_ids)} test case IDs across next-phase matrices.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
