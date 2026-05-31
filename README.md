# codex-lead

`codex-lead` is an early-stage experiment for orchestrating Codex CLI into a
more repeatable engineering workflow.

The idea is simple: a human describes the task, a Lead Agent helps organize the
work, and Codex worker sessions handle implementation, fixes, and native review
loops. The Lead Agent is intended to orchestrate rather than write code.

## Status

Pre-MVP.

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

The `codex-lead` CLI skeleton currently exposes:

```bash
npm exec codex-lead -- --help
npm exec codex-lead -- doctor
```
