import type {
  CodexLeadInitializationAction,
  CodexLeadPaths,
} from "@codex-lead/core";

export type ProjectRootResolution = {
  readonly path: string;
  readonly source: "CODEX_LEAD_PROJECT_ROOT" | "INIT_CWD" | "process.cwd";
};

export type InitInspectionConfigSummary = {
  readonly schemaVersion: number;
  readonly workerPromptingLanguage: string;
  readonly webPort: number;
  readonly features: InitFeatureChoices;
};

export type InitFeatureChoices = {
  readonly reviewLoop: boolean;
  readonly localDocs: boolean;
  readonly codeStandards: boolean;
  readonly codeQuality: boolean;
};

export type InitInspectionResponse = {
  readonly projectRoot: ProjectRootResolution;
  readonly paths: CodexLeadPaths;
  readonly exists: {
    readonly codexLeadRoot: boolean;
    readonly configFile: boolean;
    readonly docsDir: boolean;
    readonly standardsDir: boolean;
    readonly runsDir: boolean;
  };
  readonly actions: readonly CodexLeadInitializationAction[];
  readonly alreadyInitialized: boolean;
  readonly configSummary?: InitInspectionConfigSummary;
};

export type InitInspectionErrorResponse = {
  readonly error:
    | "invalid-config"
    | "init-apply-conflict"
    | "init-inspection-failed"
    | "invalid-request";
  readonly message: string;
  readonly path?: string;
  readonly recommendation: string;
};

export type InitApplyRequest = {
  readonly features: InitFeatureChoices;
};
