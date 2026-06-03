<script lang="ts">
  import type {
    Message,
    SlashCommand,
    SpawnedWorkerPreview,
    ThreadId,
    WorkerStatus
  } from "$lib/data/dashboard";

  const maxChatTextareaHeight = 192;

  export let activeLeadState: string;
  export let activeLeadStateElapsed: string;
  export let messages: readonly Message[];
  export let selectedThread: ThreadId;
  export let slashCommands: readonly SlashCommand[];
  export let spawnedWorkerPreviews: readonly SpawnedWorkerPreview[];
  export let workerStatusClasses: Readonly<Record<WorkerStatus, string>>;
  export let isRunSelectorOpen: boolean;

  let chatInput = "";
  let chatTextarea: HTMLTextAreaElement;
  let chatTextareaResizeFrame: number | undefined;
  let highlightedCommandIndex = 0;

  $: slashQuery = chatInput.startsWith("/") ? chatInput.slice(1).toLowerCase() : "";
  $: filteredSlashCommands = chatInput.startsWith("/")
    ? slashCommands.filter((item) => item.command.slice(1).startsWith(slashQuery))
    : [];
  $: showSlashCommands = chatInput.startsWith("/") && filteredSlashCommands.length > 0;
  $: if (highlightedCommandIndex >= filteredSlashCommands.length) {
    highlightedCommandIndex = 0;
  }

  function queueChatTextareaResize() {
    if (typeof requestAnimationFrame === "undefined") {
      return;
    }

    if (chatTextareaResizeFrame !== undefined) {
      cancelAnimationFrame(chatTextareaResizeFrame);
    }

    chatTextareaResizeFrame = requestAnimationFrame(() => {
      chatTextareaResizeFrame = undefined;
      resizeChatTextarea();
    });
  }

  function resizeChatTextarea() {
    if (!chatTextarea) {
      return;
    }

    chatTextarea.style.height = "auto";
    chatTextarea.style.height = `${Math.min(chatTextarea.scrollHeight, maxChatTextareaHeight)}px`;
    chatTextarea.style.overflowY =
      chatTextarea.scrollHeight > maxChatTextareaHeight ? "auto" : "hidden";
  }

  function completeHighlightedCommand() {
    const highlightedCommand = filteredSlashCommands[highlightedCommandIndex];

    if (!highlightedCommand) {
      return;
    }

    chatInput = `${highlightedCommand.command} `;
    queueChatTextareaResize();
  }

  function resetChatComposer() {
    chatInput = "";
    highlightedCommandIndex = 0;
    queueChatTextareaResize();
  }

  function runHighlightedCommand() {
    const highlightedCommand = filteredSlashCommands[highlightedCommandIndex];

    if (!highlightedCommand) {
      return false;
    }

    if (highlightedCommand.command === "/resume") {
      isRunSelectorOpen = true;
      resetChatComposer();
      return true;
    }

    resetChatComposer();
    return true;
  }

  function handleChatKeydown(event: KeyboardEvent) {
    if (event.isComposing) {
      return;
    }

    if (showSlashCommands) {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        highlightedCommandIndex = (highlightedCommandIndex + 1) % filteredSlashCommands.length;
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        highlightedCommandIndex =
          (highlightedCommandIndex - 1 + filteredSlashCommands.length) %
          filteredSlashCommands.length;
        return;
      }

      if (event.key === "Tab") {
        event.preventDefault();
        completeHighlightedCommand();
        return;
      }

      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        runHighlightedCommand();
        return;
      }
    }

    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleChatSubmit();
    }
  }

  function handleChatSubmit() {
    if (chatInput.trim().startsWith("/resume")) {
      isRunSelectorOpen = true;
    }

    resetChatComposer();
  }
</script>

<div class="scrollbar-hidden grid flex-1 content-start gap-4 overflow-y-auto pb-6">
  <div class="flex items-center gap-3 py-1 text-xs text-ink/30">
    <div class="h-px flex-1 bg-white/10"></div>
    <span class="font-mono uppercase tracking-[0.14em]">chat compacted at 09:32</span>
    <div class="h-px flex-1 bg-white/10"></div>
  </div>

  {#each messages as message}
    <article
      class={[
        "max-w-[72%] rounded-lg border border-white/10 p-5 shadow-sm",
        message.role === "You" ? "ml-auto bg-white text-ash" : "bg-paper text-ink"
      ]}
    >
      <div class="flex items-center justify-between gap-4">
        <p class="font-mono text-xs font-medium uppercase tracking-[0.16em] opacity-55">
          {message.role}
        </p>
        <time class="font-mono text-xs opacity-35">{message.time}</time>
      </div>
      <p class="mt-3 text-base font-normal leading-7">{message.body}</p>
    </article>
  {/each}

  {#each spawnedWorkerPreviews as workerPreview}
    <article class="max-w-[72%] rounded-lg border border-white/10 bg-paper p-5 shadow-sm">
      <div class="flex items-center justify-between gap-4">
        <p class="font-mono text-xs font-medium uppercase tracking-[0.16em] text-ink/45">
          Worker Event
        </p>
        <time class="font-mono text-xs text-ink/35">{workerPreview.time}</time>
      </div>
      <div class="mt-4 grid grid-cols-[1.25rem_minmax(0,1fr)] gap-x-3">
        <div class="pt-2">
          <div class="size-2 rounded-full bg-ink"></div>
        </div>
        <div>
          <div class="flex items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <p class="font-semibold">{workerPreview.name}</p>
              <span
                class={[
                  "inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-xs font-medium text-ink/55",
                  workerPreview.status === "working" && "subtle-shimmer"
                ]}
              >
                <span
                  class={["size-1.5 rounded-full", workerStatusClasses[workerPreview.status]]}
                ></span>
                <span>
                  {#if workerPreview.status === "working"}
                    working... ({workerPreview.duration})
                  {:else}
                    {workerPreview.status} in {workerPreview.duration}
                  {/if}
                </span>
              </span>
              <span class="font-mono text-xs text-ink/40">
                {workerPreview.model} / {workerPreview.thinking}
              </span>
            </div>
            <button
              class="grid size-8 place-items-center rounded-md border border-white/10 bg-white/[0.03] text-ink transition hover:bg-white/10"
              aria-label={`Open ${workerPreview.name} thread`}
              onclick={() => (selectedThread = workerPreview.threadId)}
            >
              <svg
                aria-hidden="true"
                class="size-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14" />
                <path stroke-linecap="round" stroke-linejoin="round" d="m13 6 6 6-6 6" />
              </svg>
            </button>
          </div>
          <div class="mt-3 flex gap-2 text-sm leading-6 text-ink/65">
            <svg
              aria-hidden="true"
              class="mt-1 size-4 shrink-0 text-ink/45"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="m9 6 6 6-6 6" />
            </svg>
            <p>{workerPreview.prompt}</p>
          </div>
        </div>
      </div>
    </article>
  {/each}
</div>

<section class="rounded-lg border border-white/10 bg-[#171717] p-3">
  <div class="mb-3 flex items-center justify-between gap-3">
    <span
      class="subtle-shimmer rounded-md border border-white/15 px-3 py-2 text-xs font-medium text-ink"
    >
      {activeLeadState} ({activeLeadStateElapsed})
    </span>
    <button
      class="flex items-center gap-2 rounded-md border border-red-500/35 bg-red-950/45 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-red-100 transition hover:bg-red-900/60"
    >
      <svg aria-hidden="true" class="size-3" fill="currentColor" viewBox="0 0 20 20">
        <rect x="5" y="5" width="10" height="10" rx="1" />
      </svg>
      <span>Stop</span>
    </button>
  </div>

  <form
    class="relative grid grid-cols-[minmax(0,1fr)_9rem] items-stretch overflow-visible rounded-lg border border-white/15 bg-[#0d0d0d]"
    onsubmit={(event) => {
      event.preventDefault();
      handleChatSubmit();
    }}
  >
    {#if showSlashCommands}
      <section
        class="absolute bottom-[calc(100%+0.75rem)] left-0 right-0 overflow-hidden rounded-lg border border-white/15 bg-[#171717] shadow-2xl"
      >
        <div class="border-b border-white/10 px-4 py-3">
          <p class="text-xs font-medium uppercase tracking-[0.16em] text-white/45">
            Commands
          </p>
        </div>

        <div class="grid gap-1 p-2">
          {#each filteredSlashCommands as item, index}
            <button
              type="button"
              class={[
                "grid grid-cols-[8rem_minmax(0,1fr)] rounded-md px-3 py-3 text-left transition",
                index === highlightedCommandIndex
                  ? "bg-white text-ash"
                  : "text-ink hover:bg-white/10"
              ]}
              onclick={() => {
                chatInput = `${item.command} `;
                highlightedCommandIndex = index;
                queueChatTextareaResize();
              }}
            >
              <span class="font-mono text-sm font-semibold">{item.command}</span>
              <span class="text-sm opacity-70">{item.description}</span>
            </button>
          {/each}
        </div>

        <div class="border-t border-white/10 px-4 py-2 text-xs text-white/40">
          tab autocomplete / enter send / shift+enter newline / arrow keys move
        </div>
      </section>
    {/if}

    <textarea
      bind:this={chatTextarea}
      bind:value={chatInput}
      class="max-h-48 min-h-[3.75rem] min-w-0 resize-none bg-transparent px-5 py-4 text-base leading-7 outline-none placeholder:text-ink/35"
      placeholder="Write to Lead Agent..."
      rows="1"
      oninput={queueChatTextareaResize}
      onkeydown={handleChatKeydown}
    ></textarea>
    <button
      class="border-l border-white/15 bg-white px-5 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-ash transition hover:bg-paper hover:text-ink"
    >
      Send
    </button>
  </form>
</section>
