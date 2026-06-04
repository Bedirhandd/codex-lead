import { describe, expect, it } from "vitest";

import { resolveServerProjectRoot } from "./project-root.js";

describe("resolveServerProjectRoot", () => {
  it("prefers explicit codex lead project root", () => {
    expect(
      resolveServerProjectRoot(
        {
          CODEX_LEAD_PROJECT_ROOT: "/workspace/app",
          INIT_CWD: "/workspace/from-init-cwd",
        },
        "/workspace/process-cwd",
      ),
    ).toEqual({
      path: "/workspace/app",
      source: "CODEX_LEAD_PROJECT_ROOT",
    });
  });

  it("falls back to npm initial working directory", () => {
    expect(
      resolveServerProjectRoot(
        {
          INIT_CWD: "/workspace/from-init-cwd",
        },
        "/workspace/process-cwd",
      ),
    ).toEqual({
      path: "/workspace/from-init-cwd",
      source: "INIT_CWD",
    });
  });

  it("falls back to process cwd", () => {
    expect(resolveServerProjectRoot({}, "/workspace/process-cwd")).toEqual({
      path: "/workspace/process-cwd",
      source: "process.cwd",
    });
  });
});
