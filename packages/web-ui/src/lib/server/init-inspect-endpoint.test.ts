import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { getCodexLeadPaths, loadCodexLeadConfig } from "@codex-lead/core";
import { afterEach, describe, expect, it } from "vitest";

import { GET, POST } from "../../routes/api/init/inspect/+server.js";

const tempRoots: string[] = [];
const originalProjectRoot = process.env["CODEX_LEAD_PROJECT_ROOT"];

describe("/api/init/inspect", () => {
  afterEach(async () => {
    if (originalProjectRoot === undefined) {
      delete process.env["CODEX_LEAD_PROJECT_ROOT"];
    } else {
      process.env["CODEX_LEAD_PROJECT_ROOT"] = originalProjectRoot;
    }

    await Promise.all(
      tempRoots.splice(0).map((tempRoot) =>
        rm(tempRoot, {
          force: true,
          recursive: true,
        }),
      ),
    );
  });

  it("inspects initialization state", async () => {
    const projectRoot = await createTempProjectRoot();
    const response = await GET();
    const body = (await response.json()) as {
      readonly alreadyInitialized: boolean;
      readonly actions: readonly unknown[];
      readonly projectRoot: {
        readonly path: string;
        readonly source: string;
      };
    };

    expect(response.status).toBe(200);
    expect(body.projectRoot).toEqual({
      path: projectRoot,
      source: "CODEX_LEAD_PROJECT_ROOT",
    });
    expect(body.alreadyInitialized).toBe(false);
    expect(body.actions).toHaveLength(5);
  });

  it("applies initialization with selected feature flags", async () => {
    const projectRoot = await createTempProjectRoot();
    const response = await POST({
      request: new Request("http://localhost/api/init/inspect", {
        method: "POST",
        body: JSON.stringify({
          features: {
            reviewLoop: false,
            localDocs: true,
            codeStandards: false,
            codeQuality: false,
          },
        }),
      }),
    });
    const body = (await response.json()) as {
      readonly alreadyInitialized: boolean;
      readonly actions: readonly unknown[];
    };

    expect(response.status).toBe(200);
    expect(body.alreadyInitialized).toBe(true);
    expect(body.actions).toHaveLength(0);
    await expect(loadCodexLeadConfig(projectRoot)).resolves.toMatchObject({
      features: {
        reviewLoop: {
          enabled: false,
        },
        localDocs: {
          enabled: true,
        },
        codeStandards: {
          enabled: false,
        },
        codeQuality: {
          enabled: false,
        },
      },
    });
  });

  it("fails loudly for invalid config", async () => {
    const projectRoot = await createTempProjectRoot();
    const paths = getCodexLeadPaths(projectRoot);

    await mkdir(paths.codexLeadRoot, { recursive: true });
    await writeFile(paths.configFile, "{", "utf8");

    const response = await GET();
    const body = (await response.json()) as {
      readonly error: string;
      readonly recommendation: string;
    };

    expect(response.status).toBe(422);
    expect(body.error).toBe("invalid-config");
    expect(body.recommendation).toContain("Back up");
  });
});

async function createTempProjectRoot(): Promise<string> {
  const projectRoot = await mkdtemp(join(tmpdir(), "codex-lead-web-init-"));

  tempRoots.push(projectRoot);
  process.env["CODEX_LEAD_PROJECT_ROOT"] = projectRoot;

  return projectRoot;
}
