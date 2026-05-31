import { describe, expect, it } from "vitest";

import { getProjectInfo } from "./index.js";

describe("getProjectInfo", () => {
  it("returns the initial project identity", () => {
    expect(getProjectInfo()).toEqual({
      name: "codex-lead",
      runtime: "node",
      status: "pre-mvp",
    });
  });
});
