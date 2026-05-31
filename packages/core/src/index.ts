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
