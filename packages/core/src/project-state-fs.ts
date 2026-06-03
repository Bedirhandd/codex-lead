import { randomUUID } from "node:crypto";
import {
  appendFile,
  mkdir,
  readFile,
  rename,
  writeFile,
} from "node:fs/promises";
import { dirname, join, resolve } from "node:path";

import {
  ProjectStateParseError,
  parseCodexLeadConfig,
  parseJournalNdjson,
  parseRunState,
  serializeCodexLeadConfig,
  serializeJournalEntry,
  serializeRunState,
  type CodexLeadConfig,
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
