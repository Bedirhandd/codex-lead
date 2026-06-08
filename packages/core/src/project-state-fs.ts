import { randomUUID } from "node:crypto";
import {
  appendFile,
  mkdir,
  open,
  readFile,
  rename,
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

function getCodexLeadRunPaths(
  projectRoot: string,
  runId: string,
): CodexLeadRunPaths {
  const paths = getCodexLeadPaths(projectRoot);
  const runDir = join(paths.runsDir, runId);

  return {
    runDir,
    stateFile: join(runDir, "state.json"),
    journalFile: join(runDir, "journal.ndjson"),
  };
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
