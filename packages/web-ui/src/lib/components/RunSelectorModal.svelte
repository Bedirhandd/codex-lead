<script lang="ts">
  import type { Run } from "$lib/data/dashboard";

  export let isRunSelectorOpen: boolean;
  export let runs: readonly Run[];
</script>

{#if isRunSelectorOpen}
  <div
    class="fixed inset-0 z-50 grid place-items-center bg-black/70 p-6"
    role="presentation"
    onclick={(event) => {
      if (event.currentTarget === event.target) {
        isRunSelectorOpen = false;
      }
    }}
  >
    <div
      class="flex max-h-[82vh] w-full max-w-5xl flex-col rounded-lg border border-white/15 bg-paper shadow-2xl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="run-selector-title"
    >
      <header class="flex items-start justify-between gap-6 border-b border-white/10 p-5">
        <div>
          <p class="font-mono text-xs font-medium uppercase tracking-[0.18em] text-ink/45">
            /resume
          </p>
          <h2 id="run-selector-title" class="mt-2 text-2xl font-semibold tracking-[-0.04em]">
            Change Run
          </h2>
          <p class="mt-2 text-sm text-ink/45">
            Open an existing run from this project directory.
          </p>
        </div>

        <button
          class="grid size-9 place-items-center rounded-md border border-white/10 bg-white/[0.03] text-ink transition hover:bg-white/10"
          aria-label="Close run selector"
          onclick={() => (isRunSelectorOpen = false)}
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

      <div class="scrollbar-hidden grid gap-3 overflow-y-auto p-5">
        {#each runs as run}
          <button
            class="rounded-lg border border-white/10 bg-white/[0.03] p-4 text-left transition hover:bg-white/10"
            onclick={() => (isRunSelectorOpen = false)}
          >
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="font-mono text-xs font-medium uppercase tracking-[0.12em] text-ink/35">
                  Run ID
                </p>
                <p class="mt-1 font-mono text-sm text-ink/65">{run.id}</p>
                <p class="mt-1 text-lg font-semibold">{run.title}</p>
              </div>
              <span
                class="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-xs font-medium text-ink/55"
              >
                {run.status}
              </span>
            </div>
            <p class="mt-3 text-sm leading-6 text-ink/55">{run.summary}</p>
            <p class="mt-3 font-mono text-xs text-ink/35">updated {run.updatedAt}</p>
          </button>
        {/each}
      </div>
    </div>
  </div>
{/if}
