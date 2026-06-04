<script lang="ts">
  import type {
    InitInspectionErrorResponse,
    InitInspectionResponse
  } from "$lib/init-inspection";

  type InitInspectionState =
    | {
        status: "idle" | "loading";
      }
    | {
        status: "success";
        data: InitInspectionResponse;
      }
    | {
        status: "error";
        error: InitInspectionErrorResponse;
      };

  export let isInitInspectionOpen: boolean;

  let inspectionState: InitInspectionState = {
    status: "idle"
  };
  let hasRequestedInspection = false;

  $: if (isInitInspectionOpen && !hasRequestedInspection) {
    hasRequestedInspection = true;
    void loadInspection();
  }

  $: if (!isInitInspectionOpen) {
    hasRequestedInspection = false;
    inspectionState = {
      status: "idle"
    };
  }

  $: checklistItems =
    inspectionState.status === "success"
      ? [
          {
            label: ".codex-lead/",
            path: inspectionState.data.paths.codexLeadRoot,
            exists: inspectionState.data.exists.codexLeadRoot
          },
          {
            label: "config.json",
            path: inspectionState.data.paths.configFile,
            exists: inspectionState.data.exists.configFile
          },
          {
            label: "docs/",
            path: inspectionState.data.paths.docsDir,
            exists: inspectionState.data.exists.docsDir
          },
          {
            label: "standards/",
            path: inspectionState.data.paths.standardsDir,
            exists: inspectionState.data.exists.standardsDir
          },
          {
            label: "runs/",
            path: inspectionState.data.paths.runsDir,
            exists: inspectionState.data.exists.runsDir
          }
        ]
      : [];

  async function loadInspection() {
    inspectionState = {
      status: "loading"
    };

    try {
      const response = await fetch("/api/init/inspect");
      const payload = (await response.json()) as
        | InitInspectionResponse
        | InitInspectionErrorResponse;

      if (!response.ok) {
        inspectionState = {
          status: "error",
          error: payload as InitInspectionErrorResponse
        };
        return;
      }

      inspectionState = {
        status: "success",
        data: payload as InitInspectionResponse
      };
    } catch (error) {
      inspectionState = {
        status: "error",
        error: {
          error: "init-inspection-failed",
          message: error instanceof Error ? error.message : "Request failed.",
          recommendation: "Check the server logs, then run /init again."
        }
      };
    }
  }

  function closeModal() {
    isInitInspectionOpen = false;
  }

  function actionLabel(type: string) {
    if (type === "create-directory") {
      return "mkdir";
    }

    return "write config";
  }
</script>

{#if isInitInspectionOpen}
  <div
    class="fixed inset-0 z-50 grid place-items-center bg-black/70 p-6"
    role="presentation"
    onclick={(event) => {
      if (event.currentTarget === event.target) {
        closeModal();
      }
    }}
  >
    <div
      class="flex max-h-[86vh] w-full max-w-6xl flex-col overflow-hidden rounded-lg border border-white/15 bg-[#101010] shadow-2xl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="init-inspection-title"
    >
      <header class="flex items-start justify-between gap-8 border-b border-white/10 px-7 py-6">
        <div>
          <p class="font-mono text-xs font-medium uppercase text-ink/45">
            /init manifest
          </p>
          <h2 id="init-inspection-title" class="mt-2 text-3xl font-semibold">
            Codex Lead Project Setup
          </h2>
          <p class="mt-3 max-w-2xl text-sm leading-6 text-ink/55">
            Read-only inspection of the local scaffold contract. No directories or config files
            will be written from this view.
          </p>
        </div>

        <button
          class="grid size-9 place-items-center rounded-md border border-white/10 bg-white/[0.03] text-ink transition hover:bg-white/10"
          aria-label="Close init inspection"
          onclick={closeModal}
        >
          <svg
            aria-hidden="true"
            class="size-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 6l12 12" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M18 6 6 18" />
          </svg>
        </button>
      </header>

      <div class="scrollbar-hidden overflow-y-auto">
        {#if inspectionState.status === "idle" || inspectionState.status === "loading"}
          <section class="px-7 py-8">
            <p class="subtle-shimmer inline-flex rounded-md border border-white/10 px-3 py-2 text-xs font-medium uppercase text-ink">
              Inspecting
            </p>
            <p class="mt-4 text-sm leading-6 text-ink/55">
              Reading local project initialization state.
            </p>
          </section>
        {:else if inspectionState.status === "error"}
          <section class="px-7 py-8">
            <p class="font-mono text-xs font-medium uppercase text-ink/45">
              Blocking Error
            </p>
            <p class="mt-3 max-w-3xl text-xl font-semibold">
              Init cannot continue with the current config.
            </p>
            <p class="mt-3 max-w-3xl text-sm leading-6 text-ink/60">
              {inspectionState.error.message}
            </p>
            {#if inspectionState.error.path}
              <p
                class="mt-5 border-y border-white/10 bg-black/25 px-4 py-3 break-all font-mono text-xs leading-5 text-ink/60"
              >
                {inspectionState.error.path}
              </p>
            {/if}
            <p class="mt-4 text-sm leading-6 text-ink/60">
              {inspectionState.error.recommendation}
            </p>
          </section>
        {:else}
          <section class="grid border-b border-white/10 lg:grid-cols-[18rem_minmax(0,1fr)]">
            <aside class="border-b border-white/10 px-7 py-6 lg:border-r lg:border-b-0">
              <p class="font-mono text-xs font-medium uppercase text-ink/45">State</p>
              <p class="mt-3 text-4xl font-semibold">
                {inspectionState.data.alreadyInitialized ? "Ready" : "Needs Init"}
              </p>
              <p class="mt-4 text-sm leading-6 text-ink/55">
                {inspectionState.data.alreadyInitialized
                  ? "The project scaffold already matches the current contract."
                  : "The scaffold is missing required local project files."}
              </p>

              <dl class="mt-8 grid gap-5">
                <div>
                  <dt class="font-mono text-xs uppercase text-ink/35">Actions</dt>
                  <dd class="mt-1 text-2xl font-semibold">
                    {inspectionState.data.actions.length}
                  </dd>
                </div>
                <div>
                  <dt class="font-mono text-xs uppercase text-ink/35">Mode</dt>
                  <dd class="mt-1 font-mono text-sm text-ink/70">read-only</dd>
                </div>
                <div>
                  <dt class="font-mono text-xs uppercase text-ink/35">Root Source</dt>
                  <dd class="mt-1 break-all font-mono text-sm text-ink/70">
                    {inspectionState.data.projectRoot.source}
                  </dd>
                </div>
              </dl>
            </aside>

            <div class="min-w-0 px-7 py-6">
              <div class="border-b border-white/10 pb-5">
                <p class="font-mono text-xs font-medium uppercase text-ink/45">
                  Project Root
                </p>
                <p class="mt-2 break-all font-mono text-sm text-ink/70">
                  {inspectionState.data.projectRoot.path}
                </p>
              </div>

              <div class="mt-6">
                <div
                  class="grid grid-cols-[9rem_minmax(0,1fr)_6rem] border-b border-white/10 pb-2 font-mono text-xs uppercase text-ink/35"
                >
                  <span>Entry</span>
                  <span>Absolute Path</span>
                  <span class="text-right">Status</span>
                </div>

                <div>
                  {#each checklistItems as item}
                    <div
                      class="grid grid-cols-[9rem_minmax(0,1fr)_6rem] items-start gap-4 border-b border-white/10 py-4"
                    >
                      <p class="font-semibold">{item.label}</p>
                      <p class="min-w-0 break-all font-mono text-xs leading-5 text-ink/45">
                        {item.path}
                      </p>
                      <p class="text-right font-mono text-xs text-ink/60">
                        {item.exists ? "exists" : "missing"}
                      </p>
                    </div>
                  {/each}
                </div>
              </div>
            </div>
          </section>

          <section class="px-7 py-6">
            <div class="flex items-end justify-between gap-6 border-b border-white/10 pb-4">
              <div>
                <p class="font-mono text-xs font-medium uppercase text-ink/45">
                  Proposed Init Plan
                </p>
                <p class="mt-2 text-sm text-ink/55">
                  {inspectionState.data.alreadyInitialized
                    ? "No filesystem changes are required."
                    : "Preview only. These operations are not executable in this modal."}
                </p>
              </div>
              <p class="font-mono text-xs text-ink/45">
                {inspectionState.data.actions.length} action(s)
              </p>
            </div>
            {#if inspectionState.data.actions.length > 0}
              <div>
                {#each inspectionState.data.actions as action, index}
                  <div
                    class="grid grid-cols-[3rem_8rem_minmax(0,1fr)] items-start gap-4 border-b border-white/10 py-4"
                  >
                    <p class="font-mono text-xs text-ink/35">
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <p class="font-mono text-xs text-ink/70">{actionLabel(action.type)}</p>
                    <p class="break-all font-mono text-xs leading-5 text-ink/45">
                      {action.path}
                    </p>
                  </div>
                {/each}
              </div>
            {/if}
          </section>

          {#if inspectionState.data.configSummary}
            <section class="border-t border-white/10 px-7 py-6">
              <p class="font-mono text-xs font-medium uppercase text-ink/45">
                Config Summary
              </p>
              <div
                class="mt-4 grid grid-cols-[10rem_minmax(0,1fr)] border-y border-white/10 font-mono text-sm"
              >
                <p class="border-b border-white/10 py-3 text-ink/45">schemaVersion</p>
                <p class="border-b border-white/10 py-3 text-ink/75">
                  {inspectionState.data.configSummary.schemaVersion}
                </p>
                <p class="border-b border-white/10 py-3 text-ink/45">
                  workerPromptingLanguage
                </p>
                <p class="border-b border-white/10 py-3 text-ink/75">
                  {inspectionState.data.configSummary.workerPromptingLanguage}
                </p>
                <p class="py-3 text-ink/45">webPort</p>
                <p class="py-3 text-ink/75">
                  {inspectionState.data.configSummary.webPort}
                </p>
              </div>
            </section>
          {/if}
        {/if}
      </div>

      <footer class="flex items-center justify-between gap-4 border-t border-white/10 bg-[#0d0d0d] px-7 py-5">
        <p class="text-sm text-ink/45">Read-only inspection. Apply flow is not enabled yet.</p>
        <button
          class="rounded-md border border-white/10 bg-white px-4 py-2 text-sm font-semibold uppercase tracking-[0.12em] text-ash transition hover:bg-paper hover:text-ink"
          onclick={closeModal}
        >
          Close
        </button>
      </footer>
    </div>
  </div>
{/if}
