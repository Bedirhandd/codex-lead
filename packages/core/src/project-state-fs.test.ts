import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { isAbsolute, join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  ProjectStateParseError,
  applyCodexLeadInitializationPlan,
  appendJournalEntry,
  createCodexLeadInitializationPlan,
  createDefaultCodexLeadConfig,
  getCodexLeadPaths,
  inspectCodexLeadProject,
  loadCodexLeadConfig,
  loadJournalEntries,
  loadRunState,
  writeCodexLeadConfig,
  writeRunState,
  type JournalEntry,
  type RunState,
} from "./index.js";

const tempRoots: string[] = [];

describe("codex-lead project state filesystem", () => {
  afterEach(async () => {
    await Promise.all(
      tempRoots.splice(0).map((tempRoot) =>
        rm(tempRoot, {
          force: true,
          recursive: true,
        }),
      ),
    );
  });

  it("resolves codex-lead paths as absolute paths", async () => {
    const projectRoot = await createTempProjectRoot();
    const paths = getCodexLeadPaths(projectRoot);

    expect(paths).toEqual({
      projectRoot,
      codexLeadRoot: join(projectRoot, ".codex-lead"),
      configFile: join(projectRoot, ".codex-lead", "config.json"),
      docsDir: join(projectRoot, ".codex-lead", "docs"),
      standardsDir: join(projectRoot, ".codex-lead", "standards"),
      runsDir: join(projectRoot, ".codex-lead", "runs"),
    });
    expect(Object.values(paths).every((path) => isAbsolute(path))).toBe(true);
  });

  it("writes and loads codex-lead config", async () => {
    const projectRoot = await createTempProjectRoot();
    const config = createDefaultCodexLeadConfig(projectRoot);

    await writeCodexLeadConfig(projectRoot, config);

    await expect(loadCodexLeadConfig(projectRoot)).resolves.toEqual(config);
  });

  it("writes and loads run state", async () => {
    const projectRoot = await createTempProjectRoot();
    const runState = createRunState(projectRoot);

    await writeRunState(projectRoot, runState);

    await expect(loadRunState(projectRoot, runState.id)).resolves.toEqual(
      runState,
    );
  });

  it("appends and loads journal entries in order", async () => {
    const projectRoot = await createTempProjectRoot();
    const firstEntry = createJournalEntry("evt_001", "run.started");
    const secondEntry = createJournalEntry("evt_002", "worker.spawned");

    await appendJournalEntry(projectRoot, "run_20260604_012300", firstEntry);
    await appendJournalEntry(projectRoot, "run_20260604_012300", secondEntry);

    await expect(
      loadJournalEntries(projectRoot, "run_20260604_012300"),
    ).resolves.toEqual([firstEntry, secondEntry]);
  });

  it("adds file context to invalid JSON parse errors", async () => {
    const projectRoot = await createTempProjectRoot();
    const paths = getCodexLeadPaths(projectRoot);

    await mkdir(paths.codexLeadRoot, { recursive: true });
    await writeFile(paths.configFile, "{", "utf8");

    await expect(loadCodexLeadConfig(projectRoot)).rejects.toThrow(
      ProjectStateParseError,
    );
    await expect(loadCodexLeadConfig(projectRoot)).rejects.toMatchObject({
      path: paths.configFile,
    });
  });

  it("plans and applies initialization for an empty project", async () => {
    const projectRoot = await createTempProjectRoot();
    const paths = getCodexLeadPaths(projectRoot);
    const inspection = await inspectCodexLeadProject(projectRoot);
    const plan = createCodexLeadInitializationPlan(inspection);

    expect(plan).toEqual({
      paths,
      alreadyInitialized: false,
      actions: [
        {
          type: "create-directory",
          path: paths.codexLeadRoot,
        },
        {
          type: "create-directory",
          path: paths.docsDir,
        },
        {
          type: "create-directory",
          path: paths.standardsDir,
        },
        {
          type: "create-directory",
          path: paths.runsDir,
        },
        {
          type: "write-default-config",
          path: paths.configFile,
          projectRoot,
        },
      ],
    });

    await expect(applyCodexLeadInitializationPlan(plan)).resolves.toEqual({
      paths,
      alreadyInitialized: false,
      createdPaths: [
        paths.codexLeadRoot,
        paths.docsDir,
        paths.standardsDir,
        paths.runsDir,
      ],
      wroteConfig: true,
    });
    await expect(loadCodexLeadConfig(projectRoot)).resolves.toEqual(
      createDefaultCodexLeadConfig(projectRoot),
    );
  });

  it("applies initialization with selected config feature flags", async () => {
    const projectRoot = await createTempProjectRoot();
    const plan = createCodexLeadInitializationPlan(
      await inspectCodexLeadProject(projectRoot),
    );

    await applyCodexLeadInitializationPlan(plan, {
      features: {
        reviewLoop: false,
        localDocs: true,
        codeStandards: false,
        codeQuality: false,
      },
    });

    await expect(loadCodexLeadConfig(projectRoot)).resolves.toMatchObject({
      features: {
        reviewLoop: {
          enabled: false,
        },
        localDocs: {
          enabled: true,
        },
        codeStandards: {
          enabled: false,
        },
        codeQuality: {
          enabled: false,
        },
      },
    });
  });

  it("returns an empty initialization plan for an initialized project", async () => {
    const projectRoot = await createTempProjectRoot();
    const initialPlan = createCodexLeadInitializationPlan(
      await inspectCodexLeadProject(projectRoot),
    );

    await applyCodexLeadInitializationPlan(initialPlan);

    const initializedInspection = await inspectCodexLeadProject(projectRoot);
    const initializedPlan = createCodexLeadInitializationPlan(
      initializedInspection,
    );

    expect(initializedInspection.config).toEqual(
      createDefaultCodexLeadConfig(projectRoot),
    );
    expect(initializedPlan).toEqual({
      paths: getCodexLeadPaths(projectRoot),
      actions: [],
      alreadyInitialized: true,
    });
  });

  it("plans only missing directories when config already exists", async () => {
    const projectRoot = await createTempProjectRoot();
    const paths = getCodexLeadPaths(projectRoot);
    const config = createDefaultCodexLeadConfig(projectRoot);

    await mkdir(paths.codexLeadRoot, { recursive: true });
    await writeCodexLeadConfig(projectRoot, config);

    const plan = createCodexLeadInitializationPlan(
      await inspectCodexLeadProject(projectRoot),
    );

    expect(plan).toEqual({
      paths,
      alreadyInitialized: false,
      actions: [
        {
          type: "create-directory",
          path: paths.docsDir,
        },
        {
          type: "create-directory",
          path: paths.standardsDir,
        },
        {
          type: "create-directory",
          path: paths.runsDir,
        },
      ],
    });

    await applyCodexLeadInitializationPlan(plan);
    await expect(loadCodexLeadConfig(projectRoot)).resolves.toEqual(config);
  });

  it("fails loudly when initialization inspection finds invalid config", async () => {
    const projectRoot = await createTempProjectRoot();
    const paths = getCodexLeadPaths(projectRoot);

    await mkdir(paths.codexLeadRoot, { recursive: true });
    await writeFile(paths.configFile, "{", "utf8");

    await expect(inspectCodexLeadProject(projectRoot)).rejects.toThrow(
      ProjectStateParseError,
    );
  });

  it("does not overwrite config if it appears after planning", async () => {
    const projectRoot = await createTempProjectRoot();
    const plan = createCodexLeadInitializationPlan(
      await inspectCodexLeadProject(projectRoot),
    );
    const config = {
      ...createDefaultCodexLeadConfig(projectRoot),
      workerPromptingLanguage: "tr",
    };

    await writeCodexLeadConfig(projectRoot, config);

    await expect(applyCodexLeadInitializationPlan(plan)).rejects.toMatchObject({
      code: "EEXIST",
    });
    await expect(loadCodexLeadConfig(projectRoot)).resolves.toEqual(config);
  });
});

async function createTempProjectRoot(): Promise<string> {
  const projectRoot = await mkdtemp(join(tmpdir(), "codex-lead-core-"));

  tempRoots.push(projectRoot);

  return projectRoot;
}

function createRunState(projectRoot: string): RunState {
  const runRoot = join(
    projectRoot,
    ".codex-lead",
    "runs",
    "run_20260604_012300",
  );

  return {
    schemaVersion: 1,
    id: "run_20260604_012300",
    title: "Initialize filesystem state access",
    status: "active",
    createdAt: "2026-06-04T01:23:00.000+03:00",
    updatedAt: "2026-06-04T01:24:00.000+03:00",
    goalPath: join(runRoot, "goal.md"),
    progressPath: join(runRoot, "progress.md"),
    acceptanceCriteriaPath: join(runRoot, "acceptance-criteria.md"),
    workers: [
      {
        id: "explore_001",
        kind: "explore",
        status: "queued",
        model: "gpt-5.4",
        thinking: "medium",
        createdAt: "2026-06-04T01:23:05.000+03:00",
        updatedAt: "2026-06-04T01:23:05.000+03:00",
        promptPath: join(
          runRoot,
          "workers",
          "explore",
          "explore_001",
          "prompt.md",
        ),
      },
    ],
  };
}

function createJournalEntry(id: string, type: string): JournalEntry {
  return {
    id,
    timestamp: "2026-06-04T01:23:00.000+03:00",
    actor: "lead",
    type,
    message: `${type} event`,
  };
}
