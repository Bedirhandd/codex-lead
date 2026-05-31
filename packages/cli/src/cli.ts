import { getProjectInfo } from "@codex-lead/core";

const VERSION = "0.0.0";

type Writable = {
  readonly write: (message: string) => void;
};

export type CliIo = {
  readonly stdout: Writable;
  readonly stderr: Writable;
};

export type CliResult = {
  readonly exitCode: number;
};

export function runCli(args: readonly string[], io: CliIo): CliResult {
  const command = args[0];

  if (command === undefined || command === "--help" || command === "-h") {
    io.stdout.write(renderHelp());
    return { exitCode: 0 };
  }

  if (command === "--version" || command === "-v") {
    io.stdout.write(`${VERSION}\n`);
    return { exitCode: 0 };
  }

  if (command === "doctor") {
    const projectInfo = getProjectInfo();
    io.stdout.write(
      [
        `codex-lead ${VERSION}`,
        `project: ${projectInfo.name}`,
        `status: ${projectInfo.status}`,
        `runtime: ${projectInfo.runtime}`,
        "",
      ].join("\n"),
    );
    return { exitCode: 0 };
  }

  io.stderr.write(`Unknown command: ${command}\n\n${renderHelp()}`);
  return { exitCode: 1 };
}

export function renderHelp(): string {
  return [
    "codex-lead",
    "",
    "Usage:",
    "  codex-lead [command]",
    "",
    "Commands:",
    "  doctor    Check the local codex-lead skeleton",
    "",
    "Options:",
    "  -h, --help     Show help",
    "  -v, --version  Show version",
    "",
  ].join("\n");
}
