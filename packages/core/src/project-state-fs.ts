import { randomUUID } from "node:crypto";
import {
  appendFile,
  mkdir,
  open,
  readdir,
  readFile,
  rename,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { dirname, join, resolve } from "node:path";

import {
  ProjectStateParseError,
  createDefaultCodexLeadConfig,
  parseCodexLeadConfig,
  parseJournalNdjson,
  parseRunState,
  serializeCodexLeadConfig,
  serializeJournalEntry,
  serializeRunState,
  type CodexLeadConfig,
  type CreateCodexLeadConfigOptions,
  type JournalEntry,
  type RunState,
} from "./project-state.js";

export type CodexLeadPaths = {
  readonly projectRoot: string;
  readonly codexLeadRoot: string;
  readonly configFile: string;
  readonly docsDir: string;
  readonly standardsDir: string;
  readonly runsDir: string;
};

export type CodexLeadRunPaths = {
  readonly runDir: string;
  readonly stateFile: string;
  readonly journalFile: string;
  readonly goalFile: string;
  readonly progressFile: string;
  readonly acceptanceCriteriaFile: string;
  readonly notesFile: string;
};

export type CodexLeadProjectInspection = {
  readonly paths: CodexLeadPaths;
  readonly exists: {
    readonly codexLeadRoot: boolean;
    readonly configFile: boolean;
    readonly docsDir: boolean;
    readonly standardsDir: boolean;
    readonly runsDir: boolean;
  };
  readonly config?: CodexLeadConfig;
};

export type CodexLeadInitializationAction =
  | {
      readonly type: "create-directory";
      readonly path: string;
    }
  | {
      readonly type: "write-default-config";
      readonly path: string;
      readonly projectRoot: string;
    };

export type CodexLeadInitializationPlan = {
  readonly paths: CodexLeadPaths;
  readonly actions: readonly CodexLeadInitializationAction[];
  readonly alreadyInitialized: boolean;
};

export type CodexLeadInitializationResult = {
  readonly paths: CodexLeadPaths;
  readonly createdPaths: readonly string[];
  readonly wroteConfig: boolean;
  readonly alreadyInitialized: boolean;
};

export type CreateCodexLeadRunOptions = {
  readonly title: string;
  readonly goal: string;
};

export class CodexLeadRunLifecycleError extends Error {
  public readonly code:
    | "ACTIVE_RUN_EXISTS"
    | "INVALID_RUN_INPUT"
    | "RUN_CREATE_LOCK_EXISTS"
    | "RUN_ID_COLLISION_LIMIT";

  public constructor(
    code: CodexLeadRunLifecycleError["code"],
    message: string,
  ) {
    super(message);
    this.name = "CodexLeadRunLifecycleError";
    this.code = code;
  }
}

export function getCodexLeadPaths(projectRoot: string): CodexLeadPaths {
  const absoluteProjectRoot = resolve(projectRoot);
  const codexLeadRoot = join(absoluteProjectRoot, ".codex-lead");

  return {
    projectRoot: absoluteProjectRoot,
    codexLeadRoot,
    configFile: join(codexLeadRoot, "config.json"),
    docsDir: join(codexLeadRoot, "docs"),
    standardsDir: join(codexLeadRoot, "standards"),
    runsDir: join(codexLeadRoot, "runs"),
  };
}

export async function inspectCodexLeadProject(
  projectRoot: string,
): Promise<CodexLeadProjectInspection> {
  const paths = getCodexLeadPaths(projectRoot);
  const configFileExists = await pathExists(paths.configFile);
  const config = configFileExists
    ? await loadCodexLeadConfig(paths.projectRoot)
    : undefined;

  return {
    paths,
    exists: {
      codexLeadRoot: await pathExists(paths.codexLeadRoot),
      configFile: configFileExists,
      docsDir: await pathExists(paths.docsDir),
      standardsDir: await pathExists(paths.standardsDir),
      runsDir: await pathExists(paths.runsDir),
    },
    ...(config === undefined ? {} : { config }),
  };
}

export function createCodexLeadInitializationPlan(
  inspection: CodexLeadProjectInspection,
): CodexLeadInitializationPlan {
  const actions: CodexLeadInitializationAction[] = [];

  if (!inspection.exists.codexLeadRoot) {
    actions.push({
      type: "create-directory",
      path: inspection.paths.codexLeadRoot,
    });
  }

  if (!inspection.exists.docsDir) {
    actions.push({
      type: "create-directory",
      path: inspection.paths.docsDir,
    });
  }

  if (!inspection.exists.standardsDir) {
    actions.push({
      type: "create-directory",
      path: inspection.paths.standardsDir,
    });
  }

  if (!inspection.exists.runsDir) {
    actions.push({
      type: "create-directory",
      path: inspection.paths.runsDir,
    });
  }

  if (!inspection.exists.configFile) {
    actions.push({
      type: "write-default-config",
      path: inspection.paths.configFile,
      projectRoot: inspection.paths.projectRoot,
    });
  }

  return {
    paths: inspection.paths,
    actions,
    alreadyInitialized: actions.length === 0,
  };
}

export async function applyCodexLeadInitializationPlan(
  plan: CodexLeadInitializationPlan,
  options: CreateCodexLeadConfigOptions = {},
): Promise<CodexLeadInitializationResult> {
  const createdPaths: string[] = [];
  let wroteConfig = false;

  for (const action of plan.actions) {
    if (action.type === "create-directory") {
      const existedBefore = await pathExists(action.path);

      await mkdir(action.path, { recursive: true });

      if (!existedBefore) {
        createdPaths.push(action.path);
      }
    } else {
      await writeDefaultConfigIfMissing(
        action.projectRoot,
        action.path,
        options,
      );
      wroteConfig = true;
    }
  }

  return {
    paths: plan.paths,
    createdPaths,
    wroteConfig,
    alreadyInitialized: plan.alreadyInitialized,
  };
}

export async function loadCodexLeadConfig(
  projectRoot: string,
): Promise<CodexLeadConfig> {
  const paths = getCodexLeadPaths(projectRoot);
  const parsed = await readJsonFile(paths.configFile);

  try {
    return parseCodexLeadConfig(parsed);
  } catch (error) {
    throw withFilePath(paths.configFile, error);
  }
}

export async function writeCodexLeadConfig(
  projectRoot: string,
  config: CodexLeadConfig,
): Promise<void> {
  const paths = getCodexLeadPaths(projectRoot);

  await writeFileAtomically(paths.configFile, serializeCodexLeadConfig(config));
}

export async function loadRunState(
  projectRoot: string,
  runId: string,
): Promise<RunState> {
  const paths = getCodexLeadRunPaths(projectRoot, runId);
  const parsed = await readJsonFile(paths.stateFile);

  try {
    return parseRunState(parsed);
  } catch (error) {
    throw withFilePath(paths.stateFile, error);
  }
}

export async function writeRunState(
  projectRoot: string,
  state: RunState,
): Promise<void> {
  const paths = getCodexLeadRunPaths(projectRoot, state.id);

  await writeFileAtomically(paths.stateFile, serializeRunState(state));
}

export async function loadJournalEntries(
  projectRoot: string,
  runId: string,
): Promise<readonly JournalEntry[]> {
  const paths = getCodexLeadRunPaths(projectRoot, runId);
  const contents = await readFile(paths.journalFile, "utf8");

  try {
    return parseJournalNdjson(contents);
  } catch (error) {
    throw withFilePath(paths.journalFile, error);
  }
}

export async function appendJournalEntry(
  projectRoot: string,
  runId: string,
  entry: JournalEntry,
): Promise<void> {
  const paths = getCodexLeadRunPaths(projectRoot, runId);

  await mkdir(dirname(paths.journalFile), { recursive: true });
  await appendFile(
    paths.journalFile,
    `${serializeJournalEntry(entry)}\n`,
    "utf8",
  );
}

export async function createCodexLeadRun(
  projectRoot: string,
  options: CreateCodexLeadRunOptions,
): Promise<RunState> {
  const paths = getCodexLeadPaths(projectRoot);
  const lockDir = join(paths.runsDir, ".create.lock");

  await mkdir(paths.runsDir, { recursive: true });

  try {
    await mkdir(lockDir);
  } catch (error) {
    if (isNodeError(error) && error.code === "EEXIST") {
      throw new CodexLeadRunLifecycleError(
        "RUN_CREATE_LOCK_EXISTS",
        "A codex-lead run is already being created.",
      );
    }

    throw error;
  }

  try {
    const title = normalizeRunInput(options.title, "title");
    const goal = normalizeRunInput(options.goal, "goal");
    const activeRun = await getActiveRunState(paths.projectRoot);

    if (activeRun !== undefined) {
      throw new CodexLeadRunLifecycleError(
        "ACTIVE_RUN_EXISTS",
        `Active run already exists: ${activeRun.id}.`,
      );
    }

    const createdAt = new Date().toISOString();
    const runId = await createUniqueRunId(paths.projectRoot, createdAt);
    const runPaths = getCodexLeadRunPaths(paths.projectRoot, runId);
    const runState: RunState = {
      schemaVersion: 1,
      id: runId,
      title,
      status: "active",
      createdAt,
      updatedAt: createdAt,
      goalPath: runPaths.goalFile,
      progressPath: runPaths.progressFile,
      acceptanceCriteriaPath: runPaths.acceptanceCriteriaFile,
      workers: [],
    };
    const createdEntry: JournalEntry = {
      id: `evt_${runId}_created`,
      timestamp: createdAt,
      actor: "lead",
      type: "run.created",
      message: `Run created: ${title}.`,
      data: {
        runId,
        title,
      },
    };

    await mkdir(runPaths.runDir);
    await Promise.all([
      writeFileAtomically(runPaths.goalFile, createGoalMarkdown(goal)),
      writeFileAtomically(runPaths.progressFile, createProgressMarkdown()),
      writeFileAtomically(
        runPaths.acceptanceCriteriaFile,
        createAcceptanceCriteriaMarkdown(),
      ),
      writeFileAtomically(runPaths.notesFile, createNotesMarkdown()),
      writeRunState(paths.projectRoot, runState),
    ]);
    await appendJournalEntry(paths.projectRoot, runId, createdEntry);

    return runState;
  } finally {
    await rm(lockDir, { force: true, recursive: true });
  }
}

export async function listRunStates(
  projectRoot: string,
): Promise<readonly RunState[]> {
  const paths = getCodexLeadPaths(projectRoot);

  let entries;

  try {
    entries = await readdir(paths.runsDir, { withFileTypes: true });
  } catch (error) {
    if (isNodeError(error) && error.code === "ENOENT") {
      return [];
    }

    throw error;
  }

  const runStates = await Promise.all(
    entries
      .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
      .map((entry) => loadRunState(paths.projectRoot, entry.name)),
  );

  return [...runStates].sort((left, right) =>
    right.updatedAt.localeCompare(left.updatedAt),
  );
}

export async function getActiveRunState(
  projectRoot: string,
): Promise<RunState | undefined> {
  const activeRuns = (await listRunStates(projectRoot)).filter(
    (runState) => runState.status === "active",
  );

  if (activeRuns.length > 1) {
    throw new CodexLeadRunLifecycleError(
      "ACTIVE_RUN_EXISTS",
      `Multiple active runs exist: ${activeRuns.map((run) => run.id).join(", ")}.`,
    );
  }

  return activeRuns[0];
}

export function getCodexLeadRunPaths(
  projectRoot: string,
  runId: string,
): CodexLeadRunPaths {
  const paths = getCodexLeadPaths(projectRoot);
  const runDir = join(paths.runsDir, runId);

  return {
    runDir,
    stateFile: join(runDir, "state.json"),
    journalFile: join(runDir, "journal.ndjson"),
    goalFile: join(runDir, "goal.md"),
    progressFile: join(runDir, "progress.md"),
    acceptanceCriteriaFile: join(runDir, "acceptance-criteria.md"),
    notesFile: join(runDir, "notes.md"),
  };
}

async function createUniqueRunId(
  projectRoot: string,
  timestamp: string,
): Promise<string> {
  const baseRunId = createRunId(timestamp);

  for (let index = 1; index <= 999; index += 1) {
    const runId =
      index === 1
        ? baseRunId
        : `${baseRunId}_${String(index).padStart(3, "0")}`;
    const paths = getCodexLeadRunPaths(projectRoot, runId);

    if (!(await pathExists(paths.runDir))) {
      return runId;
    }
  }

  throw new CodexLeadRunLifecycleError(
    "RUN_ID_COLLISION_LIMIT",
    `Could not create a unique run id for ${baseRunId}.`,
  );
}

function createRunId(timestamp: string): string {
  const [date = "", time = ""] = timestamp.split("T");

  return `run_${date.replaceAll("-", "")}_${time.replaceAll(/\D/gu, "").slice(0, 6)}`;
}

function normalizeRunInput(input: string, field: "goal" | "title"): string {
  const normalized = input.trim();

  if (normalized.length === 0) {
    throw new CodexLeadRunLifecycleError(
      "INVALID_RUN_INPUT",
      `Run ${field} must be a non-empty string.`,
    );
  }

  return normalized;
}

function createGoalMarkdown(goal: string): string {
  return `# Goal\n\n${goal}\n`;
}

function createProgressMarkdown(): string {
  return "# Progress\n\nNo progress recorded yet.\n";
}

function createAcceptanceCriteriaMarkdown(): string {
  return "# Acceptance Criteria\n\nNo acceptance criteria recorded yet.\n";
}

function createNotesMarkdown(): string {
  return "# Notes\n\nNo notes recorded yet.\n";
}

async function readJsonFile(filePath: string): Promise<unknown> {
  const contents = await readFile(filePath, "utf8");

  try {
    return JSON.parse(contents) as unknown;
  } catch (error) {
    throw new ProjectStateParseError(
      filePath,
      error instanceof Error ? error.message : "invalid JSON",
    );
  }
}

async function writeFileAtomically(
  filePath: string,
  contents: string,
): Promise<void> {
  await mkdir(dirname(filePath), { recursive: true });

  const tempFilePath = join(
    dirname(filePath),
    `.${String(process.pid)}-${String(Date.now())}-${randomUUID()}.tmp`,
  );

  await writeFile(tempFilePath, contents, "utf8");
  await rename(tempFilePath, filePath);
}

function withFilePath(filePath: string, error: unknown): unknown {
  if (error instanceof ProjectStateParseError) {
    return new ProjectStateParseError(
      `${filePath}:${error.path}`,
      error.reason,
    );
  }

  return error;
}

async function writeDefaultConfigIfMissing(
  projectRoot: string,
  configFile: string,
  options: CreateCodexLeadConfigOptions,
): Promise<void> {
  await mkdir(dirname(configFile), { recursive: true });

  const handle = await open(configFile, "wx");

  try {
    await handle.writeFile(
      serializeCodexLeadConfig(
        createDefaultCodexLeadConfig(projectRoot, options),
      ),
      "utf8",
    );
  } finally {
    await handle.close();
  }
}

async function pathExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch (error) {
    if (isNodeError(error) && error.code === "ENOENT") {
      return false;
    }

    throw error;
  }
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}
