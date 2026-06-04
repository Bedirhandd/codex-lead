import {
  ProjectStateParseError,
  createCodexLeadInitializationPlan,
  inspectCodexLeadProject,
} from "@codex-lead/core";
import { json } from "@sveltejs/kit";

import type {
  InitInspectionErrorResponse,
  InitInspectionResponse,
} from "../../../../lib/init-inspection.js";
import { resolveServerProjectRoot } from "../../../../lib/server/project-root.js";

const invalidConfigRecommendation =
  "Back up or fix the invalid config.json file, then run /init again.";

export async function GET() {
  const projectRoot = resolveServerProjectRoot();

  try {
    const inspection = await inspectCodexLeadProject(projectRoot.path);
    const plan = createCodexLeadInitializationPlan(inspection);
    const response = {
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
              workerPromptingLanguage:
                inspection.config.workerPromptingLanguage,
              webPort: inspection.config.webPort,
            },
          }),
    } satisfies InitInspectionResponse;

    return json(response);
  } catch (error) {
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
}
