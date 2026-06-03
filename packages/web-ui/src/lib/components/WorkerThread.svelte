<script lang="ts">
  import type { ActiveWorker, DiffLine, WorkerOutput } from "$lib/data/dashboard";

  export let diffLines: readonly DiffLine[];
  export let selectedWorker: ActiveWorker;
  export let workerOutputs: readonly WorkerOutput[];
</script>

<div class="flex min-h-0 flex-1 flex-col gap-4">
  <header class="rounded-lg border border-white/10 bg-paper p-4">
    <div class="flex items-start justify-between gap-6">
      <div>
        <p class="font-mono text-xs font-medium uppercase tracking-[0.16em] text-ink/45">
          Worker Thread
        </p>
        <h2 class="mt-1 text-2xl font-semibold tracking-[-0.04em]">
          {selectedWorker.name}
        </h2>
        <p class="mt-2 text-sm text-ink/45">
          Read-only thread. Workers can be observed or stopped, but not chatted with.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button
          class="rounded-md border border-white/15 bg-white/[0.04] px-3 py-2 text-sm font-semibold text-ink transition hover:bg-white/10"
        >
          Stop Worker
        </button>
        <div class="rounded-md border border-white/15 bg-white px-3 py-2 text-ash">
          <p class="text-sm font-semibold">working<span class="animate-pulse">...</span></p>
        </div>
      </div>
    </div>

    <div class="mt-4 grid grid-cols-3 gap-3">
      <article class="rounded-md border border-white/10 bg-ash px-3 py-2">
        <p class="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-ink/45">
          Model
        </p>
        <p class="mt-1 font-semibold">{selectedWorker.model}</p>
      </article>
      <article class="rounded-md border border-white/10 bg-ash px-3 py-2">
        <p class="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-ink/45">
          Thinking
        </p>
        <p class="mt-1 font-semibold">{selectedWorker.thinking}</p>
      </article>
      <article class="rounded-md border border-white/10 bg-ash px-3 py-2">
        <p class="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-ink/45">
          Runtime
        </p>
        <p class="mt-1 font-semibold">00:02:41</p>
      </article>
    </div>
  </header>

  <section
    class="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-ink/20 bg-[#101010] text-white"
  >
    <div
      class="flex items-center justify-between border-b border-white/10 bg-[#181818] px-4 py-3"
    >
      <div>
        <p class="font-mono text-xs font-medium uppercase tracking-[0.16em] text-white/45">
          Codex Worker Terminal
        </p>
        <p class="mt-1 font-mono text-sm text-white/70">
          {selectedWorker.model} / thinking {selectedWorker.thinking}
        </p>
      </div>

      <p class="font-mono text-xs text-white/45">thread://{selectedWorker.id}</p>
    </div>

    <div class="scrollbar-hidden min-h-0 flex-1 overflow-y-auto p-4 font-mono text-sm leading-6">
      <section class="space-y-1">
        {#each workerOutputs as output}
          <p class="text-white/75">
            <span class="text-white/35">&gt;</span>
            {output}
          </p>
        {/each}
      </section>

      <div class="my-4 border-t border-white/10"></div>

      <section>
        <div class="mb-2 flex items-center justify-between">
          <p class="text-xs uppercase tracking-[0.14em] text-white/45">Code Diff</p>
          <p class="text-xs text-white/35">packages/web-ui/src/routes/+page.svelte</p>
        </div>

        <div class="overflow-hidden rounded-md border border-white/10 bg-[#0b0b0b]">
          {#each diffLines as line}
            <div
              class={[
                "grid grid-cols-[3rem_2rem_minmax(0,1fr)] px-3 py-1.5",
                line.type === "added" && "bg-green-950/55 text-green-100",
                line.type === "removed" && "bg-red-950/55 text-red-100",
                line.type === "context" && "text-white/70"
              ]}
            >
              <span class="select-none text-right text-white/30">{line.line}</span>
              <span class="select-none text-center text-white/40">
                {line.type === "added" ? "+" : line.type === "removed" ? "-" : " "}
              </span>
              <code class="min-w-0 overflow-hidden text-ellipsis whitespace-pre">
                {#if line.code.includes("const")}
                  <span class="text-sky-300">const</span>{line.code.replace("const", "")}
                {:else if line.code.includes("role")}
                  <span class="text-amber-200">{line.code}</span>
                {:else}
                  {line.code}
                {/if}
              </code>
            </div>
          {/each}
        </div>
      </section>
    </div>
  </section>
</div>
