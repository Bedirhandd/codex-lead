import { describe, expect, it } from "vitest";

import {
  ProjectStateParseError,
  createDefaultCodexLeadConfig,
  parseCodexLeadConfig,
  parseJournalNdjson,
  parseRunState,
  serializeCodexLeadConfig,
  serializeJournalNdjson,
  serializeRunState,
  type JournalEntry,
  type RunState,
} from "./index.js";

describe("codex-lead project state", () => {
  it("creates and round-trips the default project config", () => {
    const config = createDefaultCodexLeadConfig(
      "/home/example/projects/demo-app",
    );

    expect(config).toMatchObject({
      schemaVersion: 1,
      projectRoot: "/home/example/projects/demo-app",
      workerPromptingLanguage: "en",
      webPort: 50_638,
      workers: {
        explore: {
          thinking: "medium",
        },
        plan: {
          thinking: "xhigh",
        },
        git: {
          thinking: "low",
        },
      },
      features: {
        reviewLoop: {
          enabled: true,
          maxIterations: 10,
        },
      },
      paths: {
        runs: "/home/example/projects/demo-app/.codex-lead/runs",
      },
    });

    expect(
      parseCodexLeadConfig(JSON.parse(serializeCodexLeadConfig(config))),
    ).toEqual(config);
  });

  it("creates default project config with feature overrides", () => {
    const config = createDefaultCodexLeadConfig("/repo", {
      features: {
        reviewLoop: false,
        localDocs: false,
        codeStandards: true,
        codeQuality: false,
      },
    });

    expect(config.features).toMatchObject({
      reviewLoop: {
        enabled: false,
      },
      localDocs: {
        enabled: false,
      },
      codeStandards: {
        enabled: true,
      },
      codeQuality: {
        enabled: false,
      },
    });
  });

  it("parses and serializes run state", () => {
    const runState: RunState = {
      schemaVersion: 1,
      id: "run_20260604_012300",
      title: "Initialize project state contracts",
      status: "active",
      createdAt: "2026-06-04T01:23:00.000+03:00",
      updatedAt: "2026-06-04T01:24:00.000+03:00",
      goalPath: ".codex-lead/runs/run_20260604_012300/goal.md",
      progressPath: ".codex-lead/runs/run_20260604_012300/progress.md",
      acceptanceCriteriaPath:
        ".codex-lead/runs/run_20260604_012300/acceptance-criteria.md",
      workers: [
        {
          id: "explore_001",
          kind: "explore",
          status: "working",
          model: "gpt-5.4",
          thinking: "medium",
          createdAt: "2026-06-04T01:23:05.000+03:00",
          updatedAt: "2026-06-04T01:23:30.000+03:00",
          promptPath:
            ".codex-lead/runs/run_20260604_012300/workers/explore/explore_001/prompt.md",
        },
      ],
    };

    expect(parseRunState(JSON.parse(serializeRunState(runState)))).toEqual(
      runState,
    );
  });

  it("parses and serializes journal entries as newline-delimited JSON", () => {
    const entries: readonly JournalEntry[] = [
      {
        id: "evt_001",
        timestamp: "2026-06-04T01:23:00.000+03:00",
        actor: "lead",
        type: "run.started",
        message: "Run started.",
      },
      {
        id: "evt_002",
        timestamp: "2026-06-04T01:23:10.000+03:00",
        actor: "explore-worker",
        type: "worker.spawned",
        message: "Explore worker spawned.",
        data: {
          workerId: "explore_001",
          attempt: 1,
        },
      },
    ];

    const serialized = serializeJournalNdjson(entries);

    expect(serialized).toMatch(/\n$/u);
    expect(parseJournalNdjson(serialized)).toEqual(entries);
  });

  it("throws path-aware parse errors", () => {
    const config = createDefaultCodexLeadConfig("/repo");

    expect(() =>
      parseCodexLeadConfig({
        ...config,
        workerPromptingLanguage: "",
      }),
    ).toThrow(
      new ProjectStateParseError(
        "config.workerPromptingLanguage",
        "expected non-empty string",
      ),
    );
  });
});
