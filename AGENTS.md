# AGENTS.md

## Project Context

This repository is a new project named `picktool`.

It was copied from another local Next.js project named `familyEducation`.

The old project is only a technical and UI template. Do not treat old business copy, old routes, old product names, old mock data, or old user flows as the source of truth.

The source of truth for this project is the `/docs` directory.

## Primary Goal

Migrate this copied Next.js project into the new `picktool` product according to the documents in `/docs`.

The goal is not to preserve the old product. The goal is to reuse useful engineering structure, layout patterns, and UI components while replacing the old business logic with the new product requirements.

## Required Workflow

Before major implementation:

1. Read `/docs`.
2. Inspect the current project structure.
3. Identify reusable files.
4. Identify old project files that should be deleted or rewritten.
5. Produce a phased migration plan.
6. Wait for approval before large rewrites.

## Migration Rules

- Do not trust old business content from the copied project.
- Do not keep old brand names unless explicitly requested.
- Do not keep old mock data unless it is technically useful and renamed.
- Do not add database, auth, payment, or real AI API unless explicitly requested.
- First version should prioritize MVP user flow and UI clarity.
- Prefer deterministic mock data for v1.
- Keep the project buildable after each phase.
- Make small, reviewable changes.
- Do not rewrite unrelated files.
- Do not add new dependencies unless necessary.

## Tech Stack

Assume this is a Next.js project.

Use:

- TypeScript
- React
- Tailwind CSS
- Next.js App Router if the project already uses it

Follow existing project conventions unless the docs require otherwise.

## UI Rules

- The UI should feel like a modern SaaS website.
- Avoid cluttered dashboard-like layouts unless the page is truly a dashboard.
- Use clear hierarchy, large readable sections, and enough whitespace.
- Do not use purple as the main visual direction unless required by docs.
- Reuse good components from the template, but remove old product-specific content.
- Mobile responsiveness is required.

## Verification

After each implementation phase, check:

- TypeScript errors
- lint result
- build result
- obvious broken routes
- old project names remaining in visible UI
- whether the result matches `/docs`

Use the appropriate commands from `package.json`, usually:

```bash
npm run lint
npm run build
```

or the equivalent package manager command if this project uses pnpm/yarn.

## Communication

When responding, always summarize:

1. What you inspected
2. What you changed
3. Which files were modified
4. What remains
5. Any risks or assumptions
