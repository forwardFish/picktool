# picktool

`picktool` is the local project for AI Tool Decision Assistant.

The product helps a user describe a task and receive:

- the best AI tool setup for that task
- how to use the tools in order
- which tools can be skipped
- better options for edge cases
- lightweight cost advice

## Source of truth

The product requirements live in `docs/`.

This repository was bootstrapped from the local `familyEducation` Next.js template, but the old template business logic is not a source of truth.

## Tech stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Deterministic local mock data for MVP

## Local development

```bash
pnpm install
pnpm dev
```

Useful checks:

```bash
pnpm lint
pnpm build
```
