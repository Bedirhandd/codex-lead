<script lang="ts">
  import type { ActiveWorker, ThreadId } from "$lib/data/dashboard";

  export let activeWorkers: readonly ActiveWorker[];
  export let selectedThread: ThreadId;
  export let isRunSelectorOpen: boolean;
</script>

<aside class="min-h-0 overflow-hidden border-r border-white/10 bg-paper p-6">
  <section>
    <p class="font-mono text-xs font-medium uppercase tracking-[0.22em] text-ink/50">
      Codex Lead
    </p>
    <button
      class="mt-3 block text-left text-4xl font-semibold tracking-[-0.06em] transition hover:text-ink/70"
      onclick={() => (selectedThread = "lead")}
    >
      Lead Agent
    </button>
  </section>

  <div class="my-7 h-px bg-white/10"></div>

  <section>
    <p class="text-xs font-semibold uppercase tracking-[0.18em] text-ink/50">
      Active Workers
    </p>
    <div class="mt-4 grid gap-3">
      {#each activeWorkers as worker}
        <button
          class={[
            "rounded-md border px-4 py-3 text-left font-mono text-sm font-medium transition hover:border-white/30 hover:bg-white/10",
            selectedThread === worker.id
              ? "border-white/35 bg-white/15 text-ink"
              : "border-white/10 bg-white/[0.03] text-ink"
          ]}
          onclick={() => (selectedThread = worker.id)}
        >
          <span class="block">{worker.name}</span>
          <span class="mt-1 block text-xs opacity-60">{worker.status}</span>
        </button>
      {/each}
    </div>
  </section>

  <div class="my-7 h-px bg-white/10"></div>

  <button
    class="w-full rounded-md border border-white/20 bg-white px-4 py-3 text-left text-sm font-semibold uppercase tracking-[0.14em] text-ash transition hover:bg-paper hover:text-ink"
    onclick={() => (isRunSelectorOpen = true)}
  >
    Change Run
  </button>

  <div class="my-7 h-px bg-white/10"></div>

  <button
    class="w-full rounded-md border border-white/15 bg-white/[0.03] px-4 py-3 text-left text-sm font-semibold uppercase tracking-[0.14em] text-ink transition hover:bg-white/10"
  >
    Create a New Run
  </button>

  <div class="my-7 h-px bg-white/10"></div>

  <a
    class="block rounded-md border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-ink transition hover:bg-white/10"
    href="https://github.com"
    rel="noreferrer"
    target="_blank"
  >
    codex-lead Github
  </a>
</aside>
