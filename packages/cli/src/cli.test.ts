import { describe, expect, it } from "vitest";

import { runCli } from "./cli.js";

type RecordedIo = {
  readonly stdout: string;
  readonly stderr: string;
  readonly io: Parameters<typeof runCli>[1];
};

function createRecordedIo(): RecordedIo {
  let stdout = "";
  let stderr = "";

  return {
    get stdout() {
      return stdout;
    },
    get stderr() {
      return stderr;
    },
    io: {
      stdout: {
        write: (message: string) => {
          stdout += message;
        },
      },
      stderr: {
        write: (message: string) => {
          stderr += message;
        },
      },
    },
  };
}

describe("runCli", () => {
  it("prints help when no command is provided", () => {
    const recorder = createRecordedIo();

    const result = runCli([], recorder.io);

    expect(result.exitCode).toBe(0);
    expect(recorder.stdout).toContain("Usage:");
    expect(recorder.stderr).toBe("");
  });

  it("prints the skeleton doctor output", () => {
    const recorder = createRecordedIo();

    const result = runCli(["doctor"], recorder.io);

    expect(result.exitCode).toBe(0);
    expect(recorder.stdout).toContain("project: codex-lead");
    expect(recorder.stdout).toContain("status: pre-mvp");
    expect(recorder.stderr).toBe("");
  });

  it("returns an error for unknown commands", () => {
    const recorder = createRecordedIo();

    const result = runCli(["unknown"], recorder.io);

    expect(result.exitCode).toBe(1);
    expect(recorder.stdout).toBe("");
    expect(recorder.stderr).toContain("Unknown command: unknown");
  });
});
