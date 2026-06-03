export const CODEX_LEAD_SCHEMA_VERSION = 1;

export const workerKinds = [
  "explore",
  "plan",
  "implement",
  "review",
  "git",
] as const;

export const thinkingLevels = ["low", "medium", "high", "xhigh"] as const;

export const runStatuses = [
  "active",
  "completed",
  "failed",
  "paused",
  "stopped",
] as const;

export const workerRunStatuses = [
  "queued",
  "working",
  "completed",
  "failed",
  "stopped",
] as const;

export const journalActors = [
  "lead",
  "user",
  "explore-worker",
  "plan-worker",
  "implement-worker",
  "review-worker",
  "git-worker",
] as const;

export type WorkerKind = (typeof workerKinds)[number];

export type ThinkingLevel = (typeof thinkingLevels)[number];

export type RunStatus = (typeof runStatuses)[number];

export type WorkerRunStatus = (typeof workerRunStatuses)[number];

export type JournalActor = (typeof journalActors)[number];

export type JsonPrimitive = string | number | boolean | null;

export type JsonValue =
  | JsonPrimitive
  | readonly JsonValue[]
  | { readonly [key: string]: JsonValue };

export type AgentDefaults = {
  readonly model: string;
  readonly thinking: ThinkingLevel;
};

export type ReviewLoopConfig = {
  readonly enabled: boolean;
  readonly maxIterations: number;
};

export type LocalDocsConfig = {
  readonly enabled: boolean;
  readonly docsPath: string;
};

export type CodeStandardsConfig = {
  readonly enabled: boolean;
  readonly standardsPath: string;
};

export type CodeQualityConfig = {
  readonly enabled: boolean;
  readonly commands: Readonly<Record<string, string>>;
};

export type CodexLeadConfig = {
  readonly schemaVersion: typeof CODEX_LEAD_SCHEMA_VERSION;
  readonly projectRoot: string;
  readonly workerPromptingLanguage: string;
  readonly webPort: number;
  readonly leadAgent: AgentDefaults;
  readonly workers: Readonly<Record<WorkerKind, AgentDefaults>>;
  readonly features: {
    readonly reviewLoop: ReviewLoopConfig;
    readonly localDocs: LocalDocsConfig;
    readonly codeStandards: CodeStandardsConfig;
    readonly codeQuality: CodeQualityConfig;
  };
  readonly paths: {
    readonly contributingMd: string;
    readonly designMd: string;
    readonly docs: string;
    readonly standards: string;
    readonly runs: string;
  };
};

export type WorkerRunState = {
  readonly id: string;
  readonly kind: WorkerKind;
  readonly status: WorkerRunStatus;
  readonly model: string;
  readonly thinking: ThinkingLevel;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly promptPath: string;
  readonly resultPath?: string;
  readonly errorMessage?: string;
};

export type RunState = {
  readonly schemaVersion: typeof CODEX_LEAD_SCHEMA_VERSION;
  readonly id: string;
  readonly title: string;
  readonly status: RunStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly goalPath: string;
  readonly progressPath: string;
  readonly acceptanceCriteriaPath: string;
  readonly scopePath?: string;
  readonly finalReportPath?: string;
  readonly workers: readonly WorkerRunState[];
};

export type JournalEntry = {
  readonly id: string;
  readonly timestamp: string;
  readonly actor: JournalActor;
  readonly type: string;
  readonly message: string;
  readonly data?: JsonValue;
};

type JsonObject = Readonly<Record<string, unknown>>;

export class ProjectStateParseError extends Error {
  public readonly path: string;

  public constructor(path: string, reason: string) {
    super(`${path}: ${reason}`);
    this.name = "ProjectStateParseError";
    this.path = path;
  }
}

export function createDefaultCodexLeadConfig(
  projectRoot: string,
): CodexLeadConfig {
  const codexLeadRoot = `${projectRoot}/.codex-lead`;

  return {
    schemaVersion: CODEX_LEAD_SCHEMA_VERSION,
    projectRoot,
    workerPromptingLanguage: "en",
    webPort: 50_638,
    leadAgent: {
      model: "gpt-5.4",
      thinking: "high",
    },
    workers: {
      explore: {
        model: "gpt-5.4",
        thinking: "medium",
      },
      plan: {
        model: "gpt-5.5",
        thinking: "xhigh",
      },
      implement: {
        model: "gpt-5.5",
        thinking: "medium",
      },
      review: {
        model: "gpt-5.5",
        thinking: "xhigh",
      },
      git: {
        model: "gpt-5.4",
        thinking: "low",
      },
    },
    features: {
      reviewLoop: {
        enabled: true,
        maxIterations: 10,
      },
      localDocs: {
        enabled: true,
        docsPath: `${codexLeadRoot}/docs`,
      },
      codeStandards: {
        enabled: true,
        standardsPath: `${codexLeadRoot}/standards`,
      },
      codeQuality: {
        enabled: true,
        commands: {},
      },
    },
    paths: {
      contributingMd: `${projectRoot}/CONTRIBUTING.md`,
      designMd: `${projectRoot}/DESIGN.md`,
      docs: `${codexLeadRoot}/docs`,
      standards: `${codexLeadRoot}/standards`,
      runs: `${codexLeadRoot}/runs`,
    },
  };
}

export function parseCodexLeadConfig(input: unknown): CodexLeadConfig {
  const value = expectObject(input, "config");
  const features = expectObject(value["features"], "config.features");
  const paths = expectObject(value["paths"], "config.paths");

  return {
    schemaVersion: expectSchemaVersion(
      value["schemaVersion"],
      "config.schemaVersion",
    ),
    projectRoot: expectString(value["projectRoot"], "config.projectRoot"),
    workerPromptingLanguage: expectString(
      value["workerPromptingLanguage"],
      "config.workerPromptingLanguage",
    ),
    webPort: expectInteger(value["webPort"], "config.webPort"),
    leadAgent: parseAgentDefaults(value["leadAgent"], "config.leadAgent"),
    workers: parseWorkerDefaults(value["workers"], "config.workers"),
    features: {
      reviewLoop: parseReviewLoopConfig(
        features["reviewLoop"],
        "config.features.reviewLoop",
      ),
      localDocs: parseLocalDocsConfig(
        features["localDocs"],
        "config.features.localDocs",
      ),
      codeStandards: parseCodeStandardsConfig(
        features["codeStandards"],
        "config.features.codeStandards",
      ),
      codeQuality: parseCodeQualityConfig(
        features["codeQuality"],
        "config.features.codeQuality",
      ),
    },
    paths: {
      contributingMd: expectString(
        paths["contributingMd"],
        "config.paths.contributingMd",
      ),
      designMd: expectString(paths["designMd"], "config.paths.designMd"),
      docs: expectString(paths["docs"], "config.paths.docs"),
      standards: expectString(paths["standards"], "config.paths.standards"),
      runs: expectString(paths["runs"], "config.paths.runs"),
    },
  };
}

export function serializeCodexLeadConfig(config: CodexLeadConfig): string {
  return serializeJson(config);
}

export function parseRunState(input: unknown): RunState {
  const value = expectObject(input, "runState");

  return {
    schemaVersion: expectSchemaVersion(
      value["schemaVersion"],
      "runState.schemaVersion",
    ),
    id: expectString(value["id"], "runState.id"),
    title: expectString(value["title"], "runState.title"),
    status: expectOneOf(value["status"], runStatuses, "runState.status"),
    createdAt: expectString(value["createdAt"], "runState.createdAt"),
    updatedAt: expectString(value["updatedAt"], "runState.updatedAt"),
    goalPath: expectString(value["goalPath"], "runState.goalPath"),
    progressPath: expectString(value["progressPath"], "runState.progressPath"),
    acceptanceCriteriaPath: expectString(
      value["acceptanceCriteriaPath"],
      "runState.acceptanceCriteriaPath",
    ),
    ...parseOptionalStringProperty(value, "scopePath", "runState.scopePath"),
    ...parseOptionalStringProperty(
      value,
      "finalReportPath",
      "runState.finalReportPath",
    ),
    workers: expectArray(value["workers"], "runState.workers").map(
      (worker, index) =>
        parseWorkerRunState(worker, `runState.workers[${String(index)}]`),
    ),
  };
}

export function serializeRunState(runState: RunState): string {
  return serializeJson(runState);
}

export function parseJournalEntry(
  input: unknown,
  path = "journalEntry",
): JournalEntry {
  const value = expectObject(input, path);

  return {
    id: expectString(value["id"], `${path}.id`),
    timestamp: expectString(value["timestamp"], `${path}.timestamp`),
    actor: expectOneOf(value["actor"], journalActors, `${path}.actor`),
    type: expectString(value["type"], `${path}.type`),
    message: expectString(value["message"], `${path}.message`),
    ...parseOptionalJsonValueProperty(value, "data", `${path}.data`),
  };
}

export function serializeJournalEntry(entry: JournalEntry): string {
  return JSON.stringify(entry);
}

export function parseJournalNdjson(input: string): readonly JournalEntry[] {
  return input
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line, index) => {
      let parsed: unknown;

      try {
        parsed = JSON.parse(line) as unknown;
      } catch (error) {
        throw new ProjectStateParseError(
          `journal.ndjson:${String(index + 1)}`,
          error instanceof Error ? error.message : "invalid JSON",
        );
      }

      return parseJournalEntry(parsed, `journal.ndjson:${String(index + 1)}`);
    });
}

export function serializeJournalNdjson(
  entries: readonly JournalEntry[],
): string {
  return `${entries.map((entry) => serializeJournalEntry(entry)).join("\n")}\n`;
}

function parseWorkerRunState(input: unknown, path: string): WorkerRunState {
  const value = expectObject(input, path);

  return {
    id: expectString(value["id"], `${path}.id`),
    kind: expectOneOf(value["kind"], workerKinds, `${path}.kind`),
    status: expectOneOf(value["status"], workerRunStatuses, `${path}.status`),
    model: expectString(value["model"], `${path}.model`),
    thinking: expectOneOf(
      value["thinking"],
      thinkingLevels,
      `${path}.thinking`,
    ),
    createdAt: expectString(value["createdAt"], `${path}.createdAt`),
    updatedAt: expectString(value["updatedAt"], `${path}.updatedAt`),
    promptPath: expectString(value["promptPath"], `${path}.promptPath`),
    ...parseOptionalStringProperty(value, "resultPath", `${path}.resultPath`),
    ...parseOptionalStringProperty(
      value,
      "errorMessage",
      `${path}.errorMessage`,
    ),
  };
}

function parseAgentDefaults(input: unknown, path: string): AgentDefaults {
  const value = expectObject(input, path);

  return {
    model: expectString(value["model"], `${path}.model`),
    thinking: expectOneOf(
      value["thinking"],
      thinkingLevels,
      `${path}.thinking`,
    ),
  };
}

function parseWorkerDefaults(
  input: unknown,
  path: string,
): Readonly<Record<WorkerKind, AgentDefaults>> {
  const value = expectObject(input, path);

  return {
    explore: parseAgentDefaults(value["explore"], `${path}.explore`),
    plan: parseAgentDefaults(value["plan"], `${path}.plan`),
    implement: parseAgentDefaults(value["implement"], `${path}.implement`),
    review: parseAgentDefaults(value["review"], `${path}.review`),
    git: parseAgentDefaults(value["git"], `${path}.git`),
  };
}

function parseReviewLoopConfig(input: unknown, path: string): ReviewLoopConfig {
  const value = expectObject(input, path);

  return {
    enabled: expectBoolean(value["enabled"], `${path}.enabled`),
    maxIterations: expectInteger(
      value["maxIterations"],
      `${path}.maxIterations`,
    ),
  };
}

function parseLocalDocsConfig(input: unknown, path: string): LocalDocsConfig {
  const value = expectObject(input, path);

  return {
    enabled: expectBoolean(value["enabled"], `${path}.enabled`),
    docsPath: expectString(value["docsPath"], `${path}.docsPath`),
  };
}

function parseCodeStandardsConfig(
  input: unknown,
  path: string,
): CodeStandardsConfig {
  const value = expectObject(input, path);

  return {
    enabled: expectBoolean(value["enabled"], `${path}.enabled`),
    standardsPath: expectString(
      value["standardsPath"],
      `${path}.standardsPath`,
    ),
  };
}

function parseCodeQualityConfig(
  input: unknown,
  path: string,
): CodeQualityConfig {
  const value = expectObject(input, path);

  return {
    enabled: expectBoolean(value["enabled"], `${path}.enabled`),
    commands: expectStringRecord(value["commands"], `${path}.commands`),
  };
}

function expectSchemaVersion(
  input: unknown,
  path: string,
): typeof CODEX_LEAD_SCHEMA_VERSION {
  if (input !== CODEX_LEAD_SCHEMA_VERSION) {
    throw new ProjectStateParseError(
      path,
      `expected schema version ${String(CODEX_LEAD_SCHEMA_VERSION)}`,
    );
  }

  return CODEX_LEAD_SCHEMA_VERSION;
}

function expectObject(input: unknown, path: string): JsonObject {
  if (!isRecord(input)) {
    throw new ProjectStateParseError(path, "expected object");
  }

  return input;
}

function expectString(input: unknown, path: string): string {
  if (typeof input !== "string" || input.length === 0) {
    throw new ProjectStateParseError(path, "expected non-empty string");
  }

  return input;
}

function expectBoolean(input: unknown, path: string): boolean {
  if (typeof input !== "boolean") {
    throw new ProjectStateParseError(path, "expected boolean");
  }

  return input;
}

function expectInteger(input: unknown, path: string): number {
  if (typeof input !== "number" || !Number.isSafeInteger(input)) {
    throw new ProjectStateParseError(path, "expected safe integer");
  }

  return input;
}

function expectArray(input: unknown, path: string): readonly unknown[] {
  if (!Array.isArray(input)) {
    throw new ProjectStateParseError(path, "expected array");
  }

  return input;
}

function expectStringRecord(
  input: unknown,
  path: string,
): Readonly<Record<string, string>> {
  const value = expectObject(input, path);
  const entries = Object.entries(value).map(([key, entryValue]) => {
    if (typeof entryValue !== "string") {
      throw new ProjectStateParseError(`${path}.${key}`, "expected string");
    }

    return [key, entryValue] as const;
  });

  return Object.fromEntries(entries);
}

function expectOneOf<const Values extends readonly string[]>(
  input: unknown,
  values: Values,
  path: string,
): Values[number] {
  if (typeof input !== "string" || !values.includes(input)) {
    throw new ProjectStateParseError(
      path,
      `expected one of: ${values.join(", ")}`,
    );
  }

  return input;
}

function parseOptionalStringProperty<Key extends string>(
  input: JsonObject,
  key: Key,
  path: string,
): Partial<Record<Key, string>> {
  if (!(key in input)) {
    return {};
  }

  return {
    [key]: expectString(input[key], path),
  } as Partial<Record<Key, string>>;
}

function parseOptionalJsonValueProperty<Key extends string>(
  input: JsonObject,
  key: Key,
  path: string,
): Partial<Record<Key, JsonValue>> {
  if (!(key in input)) {
    return {};
  }

  if (!isJsonValue(input[key])) {
    throw new ProjectStateParseError(path, "expected JSON value");
  }

  return {
    [key]: input[key],
  } as Partial<Record<Key, JsonValue>>;
}

function isJsonValue(input: unknown): input is JsonValue {
  if (
    input === null ||
    typeof input === "string" ||
    typeof input === "number" ||
    typeof input === "boolean"
  ) {
    return true;
  }

  if (Array.isArray(input)) {
    return input.every(isJsonValue);
  }

  if (!isRecord(input)) {
    return false;
  }

  return Object.values(input).every(isJsonValue);
}

function isRecord(input: unknown): input is JsonObject {
  return typeof input === "object" && input !== null && !Array.isArray(input);
}

function serializeJson(input: JsonValue): string {
  return `${JSON.stringify(input, null, 2)}\n`;
}
