# codex-lead

`codex-lead` is an early-stage experiment for orchestrating Codex into a more
repeatable engineering workflow.

The idea is simple: a human describes the task, a Lead Agent helps organize the
work, and Codex worker sessions handle implementation, fixes, and native review
loops. The Lead Agent is intended to orchestrate rather than write code.

## Status

Pre-MVP. The repository is currently being reshaped around a local web UI and a
core project-state package. There is no stable CLI or runnable product surface
on `main` yet.

## Development

Install dependencies:

```bash
npm install
```

Run the local quality checks:

```bash
npm run build
npm run lint
npm run format:check
npm run typecheck
npm run test
npm run quality
```
