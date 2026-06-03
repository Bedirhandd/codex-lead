export type ProjectInfo = {
  readonly name: "codex-lead";
  readonly runtime: "node";
  readonly status: "pre-mvp";
};

export function getProjectInfo(): ProjectInfo {
  return {
    name: "codex-lead",
    runtime: "node",
    status: "pre-mvp",
  };
}

export {
  CODEX_LEAD_SCHEMA_VERSION,
  ProjectStateParseError,
  createDefaultCodexLeadConfig,
  journalActors,
  parseCodexLeadConfig,
  parseJournalEntry,
  parseJournalNdjson,
  parseRunState,
  runStatuses,
  serializeCodexLeadConfig,
  serializeJournalEntry,
  serializeJournalNdjson,
  serializeRunState,
  thinkingLevels,
  workerKinds,
  workerRunStatuses,
} from "./project-state.js";

export type {
  AgentDefaults,
  CodexLeadConfig,
  CodeQualityConfig,
  CodeStandardsConfig,
  JournalActor,
  JournalEntry,
  JsonPrimitive,
  JsonValue,
  LocalDocsConfig,
  ReviewLoopConfig,
  RunState,
  RunStatus,
  ThinkingLevel,
  WorkerKind,
  WorkerRunState,
  WorkerRunStatus,
} from "./project-state.js";
