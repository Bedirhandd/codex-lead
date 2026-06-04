import { resolve } from "node:path";

export type ProjectRootSource =
  | "CODEX_LEAD_PROJECT_ROOT"
  | "INIT_CWD"
  | "process.cwd";

export type ProjectRootResolution = {
  readonly path: string;
  readonly source: ProjectRootSource;
};

export type ProjectRootEnvironment = Partial<
  Readonly<Record<"CODEX_LEAD_PROJECT_ROOT" | "INIT_CWD", string>>
>;

export function resolveServerProjectRoot(
  environment: ProjectRootEnvironment = process.env,
  currentWorkingDirectory = process.cwd(),
): ProjectRootResolution {
  const explicitProjectRoot = environment.CODEX_LEAD_PROJECT_ROOT;

  if (isNonEmptyString(explicitProjectRoot)) {
    return {
      path: resolve(explicitProjectRoot),
      source: "CODEX_LEAD_PROJECT_ROOT",
    };
  }

  const initialWorkingDirectory = environment.INIT_CWD;

  if (isNonEmptyString(initialWorkingDirectory)) {
    return {
      path: resolve(initialWorkingDirectory),
      source: "INIT_CWD",
    };
  }

  return {
    path: resolve(currentWorkingDirectory),
    source: "process.cwd",
  };
}

function isNonEmptyString(value: string | undefined): value is string {
  return value !== undefined && value.trim().length > 0;
}
