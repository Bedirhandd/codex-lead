import {
  ProjectStateParseError,
  applyCodexLeadInitializationPlan,
  createCodexLeadInitializationPlan,
  inspectCodexLeadProject,
} from "@codex-lead/core";
import { json } from "@sveltejs/kit";

import type {
  InitApplyRequest,
  InitFeatureChoices,
  InitInspectionErrorResponse,
  InitInspectionResponse,
} from "../../../../lib/init-inspection.js";
import { resolveServerProjectRoot } from "../../../../lib/server/project-root.js";

const invalidConfigRecommendation =
  "Back up or fix the invalid config.json file, then run /init again.";

export async function GET() {
  const projectRoot = resolveServerProjectRoot();

  try {
    return json(await createInspectionResponse(projectRoot));
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function POST({ request }: { request: Request }) {
  const projectRoot = resolveServerProjectRoot();

  try {
    const applyRequest = parseApplyRequest(await request.json());
    const inspection = await inspectCodexLeadProject(projectRoot.path);
    const plan = createCodexLeadInitializationPlan(inspection);

    await applyCodexLeadInitializationPlan(plan, {
      features: applyRequest.features,
    });

    return json(await createInspectionResponse(projectRoot));
  } catch (error) {
    return createErrorResponse(error);
  }
}

async function createInspectionResponse(
  projectRoot: ReturnType<typeof resolveServerProjectRoot>,
): Promise<InitInspectionResponse> {
  const inspection = await inspectCodexLeadProject(projectRoot.path);
  const plan = createCodexLeadInitializationPlan(inspection);

  return {
    projectRoot,
    paths: inspection.paths,
    exists: inspection.exists,
    actions: plan.actions,
    alreadyInitialized: plan.alreadyInitialized,
    ...(inspection.config === undefined
      ? {}
      : {
          configSummary: {
            schemaVersion: inspection.config.schemaVersion,
            workerPromptingLanguage: inspection.config.workerPromptingLanguage,
            webPort: inspection.config.webPort,
            features: {
              reviewLoop: inspection.config.features.reviewLoop.enabled,
              localDocs: inspection.config.features.localDocs.enabled,
              codeStandards: inspection.config.features.codeStandards.enabled,
              codeQuality: inspection.config.features.codeQuality.enabled,
            },
          },
        }),
  };
}

function createErrorResponse(error: unknown): Response {
  if (error instanceof ProjectStateParseError) {
    return json(
      {
        error: "invalid-config",
        message: error.message,
        path: error.path,
        recommendation: invalidConfigRecommendation,
      } satisfies InitInspectionErrorResponse,
      {
        status: 422,
      },
    );
  }

  if (isNodeError(error) && error.code === "EEXIST") {
    return json(
      {
        error: "init-apply-conflict",
        message: error.message,
        ...(error.path === undefined ? {} : { path: error.path }),
        recommendation:
          "A config file appeared before apply could finish. Re-open /init and inspect again.",
      } satisfies InitInspectionErrorResponse,
      {
        status: 409,
      },
    );
  }

  if (error instanceof InvalidInitApplyRequestError) {
    return json(
      {
        error: "invalid-request",
        message: error.message,
        recommendation:
          "Refresh the page, review the init options, then try again.",
      } satisfies InitInspectionErrorResponse,
      {
        status: 400,
      },
    );
  }

  return json(
    {
      error: "init-inspection-failed",
      message:
        error instanceof Error
          ? error.message
          : "Initialization inspection failed.",
      recommendation: "Check the server logs, then run /init again.",
    } satisfies InitInspectionErrorResponse,
    {
      status: 500,
    },
  );
}

function parseApplyRequest(input: unknown): InitApplyRequest {
  if (!isRecord(input) || !isRecord(input["features"])) {
    throw new InvalidInitApplyRequestError("Expected init feature choices.");
  }

  return {
    features: {
      reviewLoop: expectBoolean(input["features"]["reviewLoop"], "reviewLoop"),
      localDocs: expectBoolean(input["features"]["localDocs"], "localDocs"),
      codeStandards: expectBoolean(
        input["features"]["codeStandards"],
        "codeStandards",
      ),
      codeQuality: expectBoolean(
        input["features"]["codeQuality"],
        "codeQuality",
      ),
    },
  };
}

function expectBoolean(input: unknown, key: keyof InitFeatureChoices): boolean {
  if (typeof input !== "boolean") {
    throw new InvalidInitApplyRequestError(`Expected boolean feature: ${key}.`);
  }

  return input;
}

function isRecord(input: unknown): input is Readonly<Record<string, unknown>> {
  return typeof input === "object" && input !== null && !Array.isArray(input);
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}

class InvalidInitApplyRequestError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "InvalidInitApplyRequestError";
  }
}
