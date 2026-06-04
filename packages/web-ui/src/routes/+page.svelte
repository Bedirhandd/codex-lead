<script lang="ts">
  import { onMount } from "svelte";

  import InitInspectionModal from "$lib/components/InitInspectionModal.svelte";
  import LeadChat from "$lib/components/LeadChat.svelte";
  import RunSelectorModal from "$lib/components/RunSelectorModal.svelte";
  import RunTelemetry from "$lib/components/RunTelemetry.svelte";
  import WorkerThread from "$lib/components/WorkerThread.svelte";
  import WorkspaceSidebar from "$lib/components/WorkspaceSidebar.svelte";
  import {
    activeLeadState,
    activeLeadStateElapsed,
    activeWorkers,
    diffLines,
    leadModelOptions,
    messages,
    runs,
    slashCommands,
    spawnedWorkerPreviews,
    statusItems,
    thinkingLevelOptions,
    usageLimits,
    workerOutputs,
    workerStatusClasses,
    type ThreadId
  } from "$lib/data/dashboard";

  let selectedThread: ThreadId = "lead";
  let isRunSelectorOpen = false;
  let isInitInspectionOpen = false;

  $: selectedWorker =
    activeWorkers.find((worker) => worker.id === selectedThread) ?? activeWorkers[0];

  onMount(() => {
    function handleWindowKeydown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        isRunSelectorOpen = false;
        isInitInspectionOpen = false;
      }
    }

    window.addEventListener("keydown", handleWindowKeydown);

    return () => {
      window.removeEventListener("keydown", handleWindowKeydown);
    };
  });
</script>

<svelte:head>
  <title>Codex Lead</title>
  <meta
    name="description"
    content="A local Codex orchestration cockpit for scope, planning, implementation, and review loops."
  />
</svelte:head>

<main class="h-screen overflow-hidden bg-ash p-6 text-ink">
  <div
    class="mx-auto grid h-full max-w-500 grid-cols-[25rem_minmax(0,1fr)_25rem] overflow-hidden rounded-lg border border-white/10 bg-paper"
  >
    <WorkspaceSidebar
      {activeWorkers}
      bind:isRunSelectorOpen
      bind:selectedThread
    />

    <section class="flex min-h-0 flex-col overflow-hidden bg-ash">
      <div class="flex min-h-0 flex-1 flex-col px-8 py-6">
        {#if selectedThread === "lead"}
          <LeadChat
            {activeLeadState}
            {activeLeadStateElapsed}
            {messages}
            {slashCommands}
            {spawnedWorkerPreviews}
            {workerStatusClasses}
            bind:isInitInspectionOpen
            bind:isRunSelectorOpen
            bind:selectedThread
          />
        {:else}
          <WorkerThread {diffLines} {selectedWorker} {workerOutputs} />
        {/if}
      </div>
    </section>

    <RunTelemetry
      {leadModelOptions}
      {statusItems}
      {thinkingLevelOptions}
      {usageLimits}
    />
  </div>

  <RunSelectorModal {runs} bind:isRunSelectorOpen />
  <InitInspectionModal bind:isInitInspectionOpen />
</main>
