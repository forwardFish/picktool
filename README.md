# picktool

`picktool` is the local project for **AI Task Workflow Copilot**.

The product helps a user describe a real task, get a simple AI-powered workflow first, and upgrade that workflow only when the user asks for more polish, lower cost, or more automation.

The v2.0 MVP focuses on:

- a homepage task input
- a conversational Copilot workflow page
- a good-enough plan before any full execution plan
- upgrade paths for professional, budget, and automated workflows
- a current-plan sidebar that tracks the selected setup
- on-demand full plan generation and refinement modules
- local archive/save flow for generated workflows

## Source of truth

The product requirements live in `docs/`, especially:

- `docs/AI_Task_Workflow_Copilot_MVP_Dev_Doc_v2.0.md`
- `docs/30-local-ai-tool-catalog-design.md`
- `docs/32-tool-recommendation-engine-report.md`

This repository was bootstrapped from the local `familyEducation` Next.js template, but the old template business logic is not a source of truth.

## Tech stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Deterministic local mock data for MVP
- Local JSONL tool catalog

## Local development

```bash
pnpm install
pnpm dev
```

Useful checks:

```bash
pnpm lint
pnpm test
pnpm build
pnpm test:smoke
```

Useful data scripts:

```bash
pnpm tools:normalize
```
