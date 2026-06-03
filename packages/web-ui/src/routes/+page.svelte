<script lang="ts">
  type ThreadId = 'lead' | 'explore-1' | 'explore-2';

  let selectedThread: ThreadId = 'lead';
  let chatInput = '';
  let highlightedCommandIndex = 0;

  const activeWorkers = [
    {
      id: 'explore-1',
      name: 'Dummy Explore Worker',
      model: 'gpt-5.4',
      thinking: 'medium',
      status: 'working...'
    },
    {
      id: 'explore-2',
      name: 'Dummy Explore Worker 2',
      model: 'gpt-5.4-mini',
      thinking: 'low',
      status: 'idle'
    }
  ] as const;

  $: selectedWorker =
    activeWorkers.find((worker) => worker.id === selectedThread) ?? activeWorkers[0];

  const statusItems = [
    {
      label: 'Lead Agent Model',
      value: 'gpt-5.4'
    },
    {
      label: 'Thinking Level',
      value: 'high'
    },
    {
      label: 'Dummy Usage Limits',
      value: '42% used'
    },
    {
      label: 'Active Worker Count',
      value: '2'
    },
    {
      label: 'Lead Agent Context Window',
      value: '63%'
    },
    {
      label: 'Current Directory',
      value: '/home/bedirhandd/Projects/codex-lead'
    },
    {
      label: 'Git Branch',
      value: 'main'
    }
  ];

  const messages = [
    {
      role: 'Lead Agent',
      time: '09:38',
      body: 'Tell me what you want this run to accomplish. I will keep asking until the scope is sharp enough to hand to workers.'
    },
    {
      role: 'You',
      time: '09:39',
      body: 'Start with the web UI. Keep the data dummy for now and make the layout feel like a local orchestration cockpit.'
    },
    {
      role: 'Lead Agent',
      time: '09:40',
      body: 'Understood. I will keep this run focused on interface structure: left navigation, central chat, and right-side operational metadata.'
    }
  ];

  const spawnedWorkerPreviews = [
    {
      name: 'Spawned Explore Worker',
      status: 'working',
      time: '09:41',
      model: 'gpt-5.4',
      thinking: 'medium',
      threadId: 'explore-1',
      prompt:
        'See the whole project for implementation context, identify the relevant files, and summarize risks before planning.'
    },
    {
      name: 'Spawned Plan Worker',
      status: 'stopped',
      time: '09:44',
      model: 'gpt-5.5',
      thinking: 'xhigh',
      threadId: 'explore-2',
      prompt:
        'Read goal.md and scope.md, then draft a detailed implementation plan without editing code.'
    },
    {
      name: 'Spawned Review Worker',
      status: 'failed',
      time: '09:47',
      model: 'gpt-5.5',
      thinking: 'xhigh',
      threadId: 'explore-2',
      prompt:
        'Run native Codex review against uncommitted changes and return findings in a concise report.'
    },
    {
      name: 'Spawned Git Worker',
      status: 'completed',
      time: '09:52',
      model: 'gpt-5.4',
      thinking: 'low',
      threadId: 'explore-2',
      prompt:
        'Inspect uncommitted changes, follow CONTRIBUTING.md, and prepare a conventional commit summary.'
    }
  ] as const;

  const slashCommands = [
    {
      command: '/init',
      description: 'Initialize codex-lead files for this workspace.'
    },
    {
      command: '/resume',
      description: 'Open existing runs for this project and switch between them.'
    }
  ];

  const leadStates = ['Working...', 'Thinking...', 'Waiting Workers to Finish...'];
  const activeLeadState = leadStates[2];
  const activeLeadStateElapsed = '34m';

  $: slashQuery = chatInput.startsWith('/') ? chatInput.slice(1).toLowerCase() : '';
  $: filteredSlashCommands = chatInput.startsWith('/')
    ? slashCommands.filter((item) => item.command.slice(1).startsWith(slashQuery))
    : [];
  $: showSlashCommands = chatInput.startsWith('/') && filteredSlashCommands.length > 0;
  $: if (highlightedCommandIndex >= filteredSlashCommands.length) {
    highlightedCommandIndex = 0;
  }

  function completeHighlightedCommand() {
    const highlightedCommand = filteredSlashCommands[highlightedCommandIndex];

    if (!highlightedCommand) {
      return;
    }

    chatInput = `${highlightedCommand.command} `;
  }

  function handleChatKeydown(event: KeyboardEvent) {
    if (!showSlashCommands) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      highlightedCommandIndex = (highlightedCommandIndex + 1) % filteredSlashCommands.length;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      highlightedCommandIndex =
        (highlightedCommandIndex - 1 + filteredSlashCommands.length) %
        filteredSlashCommands.length;
    }

    if (event.key === 'Tab') {
      event.preventDefault();
      completeHighlightedCommand();
    }
  }

  function handleChatSubmit() {
    chatInput = '';
    highlightedCommandIndex = 0;
  }

  const workerOutputs = [
    '[09:41:12] starting repository scan',
    '[09:41:14] reading package metadata and SvelteKit routes',
    '[09:41:16] detected Tailwind v4 with app.css theme tokens',
    '[09:41:18] found candidate UI entry: packages/web-ui/src/routes/+page.svelte',
    '[09:41:21] working... preparing summary and implementation notes'
  ];

  const diffLines = [
    {
      type: 'context',
      line: 41,
      code: "  const messages = ["
    },
    {
      type: 'removed',
      line: 42,
      code: "    { role: 'Lead Agent', body: 'Old placeholder output.' }"
    },
    {
      type: 'added',
      line: 42,
      code: "    { role: 'Lead Agent', body: 'Streaming worker thread output.' }"
    },
    {
      type: 'context',
      line: 43,
      code: '  ];'
    },
    {
      type: 'added',
      line: 44,
      code: "  const workerStatus = 'working...';"
    }
  ];
</script>

<svelte:head>
  <title>Codex Lead</title>
  <meta
    name="description"
    content="A local Codex orchestration cockpit for scope, planning, implementation, and review loops."
  />
</svelte:head>

<main class="h-screen overflow-hidden bg-ash p-6 text-ink">
  <div class="mx-auto grid h-full max-w-500 grid-cols-[25rem_minmax(0,1fr)_25rem] overflow-hidden rounded-lg border border-white/10 bg-paper">
  <aside class="min-h-0 overflow-hidden border-r border-white/10 bg-paper p-6">
    <section>
      <p class="font-mono text-xs font-medium uppercase tracking-[0.22em] text-ink/50">Codex Lead</p>
      <button
        class="mt-3 block text-left text-4xl font-semibold tracking-[-0.06em] transition hover:text-ink/70"
        onclick={() => (selectedThread = 'lead')}
      >
        Lead Agent
      </button>
    </section>

    <div class="my-7 h-px bg-white/10"></div>

    <section>
      <p class="text-xs font-semibold uppercase tracking-[0.18em] text-ink/50">Active Workers</p>
      <div class="mt-4 grid gap-3">
        {#each activeWorkers as worker}
          <button
            class={[
              'rounded-md border px-4 py-3 text-left font-mono text-sm font-medium transition hover:border-white/30 hover:bg-white/10',
              selectedThread === worker.id
                ? 'border-white/35 bg-white/15 text-ink'
                : 'border-white/10 bg-white/[0.03] text-ink'
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

    <button class="w-full rounded-md border border-white/20 bg-white px-4 py-3 text-left text-sm font-semibold uppercase tracking-[0.14em] text-ash transition hover:bg-paper hover:text-ink">
      Change Run
    </button>

    <div class="my-7 h-px bg-white/10"></div>

    <button class="w-full rounded-md border border-white/15 bg-white/[0.03] px-4 py-3 text-left text-sm font-semibold uppercase tracking-[0.14em] text-ink transition hover:bg-white/10">
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

  <section class="flex min-h-0 flex-col overflow-hidden bg-ash">

    <div class="flex min-h-0 flex-1 flex-col px-8 py-6">
      {#if selectedThread === 'lead'}
        <div class="scrollbar-hidden grid flex-1 content-start gap-4 overflow-y-auto pb-6">
          {#each messages as message}
            <article
              class={[
                'max-w-[72%] rounded-lg border border-white/10 p-5 shadow-sm',
                message.role === 'You'
                  ? 'ml-auto bg-white text-ash'
                  : 'bg-paper text-ink'
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
                      <span class="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-xs font-medium text-ink/55">
                        {workerPreview.status}{workerPreview.status === 'working' ? '...' : ''}
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
          <div class="mb-3 flex">
            <span class="subtle-shimmer rounded-md border border-white/15 px-3 py-2 text-xs font-medium text-ink">
              {activeLeadState} ({activeLeadStateElapsed})
            </span>
          </div>

          <form
            class="relative grid grid-cols-[minmax(0,1fr)_9rem] overflow-visible rounded-lg border border-white/15 bg-[#0d0d0d]"
            onsubmit={(event) => {
              event.preventDefault();
              handleChatSubmit();
            }}
          >
            {#if showSlashCommands}
              <section class="absolute bottom-[calc(100%+0.75rem)] left-0 right-0 overflow-hidden rounded-lg border border-white/15 bg-[#171717] shadow-2xl">
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
                        'grid grid-cols-[8rem_minmax(0,1fr)] rounded-md px-3 py-3 text-left transition',
                        index === highlightedCommandIndex
                          ? 'bg-white text-ash'
                          : 'text-ink hover:bg-white/10'
                      ]}
                      onclick={() => {
                        chatInput = `${item.command} `;
                        highlightedCommandIndex = index;
                      }}
                    >
                      <span class="font-mono text-sm font-semibold">{item.command}</span>
                      <span class="text-sm opacity-70">{item.description}</span>
                    </button>
                  {/each}
                </div>

                <div class="border-t border-white/10 px-4 py-2 text-xs text-white/40">
                  tab autocomplete / enter send / arrow keys move
                </div>
              </section>
            {/if}

            <input
              bind:value={chatInput}
              class="min-w-0 bg-transparent px-5 py-4 text-base outline-none placeholder:text-ink/35"
              placeholder="Write to Lead Agent..."
              onkeydown={handleChatKeydown}
            />
            <button class="border-l border-white/15 bg-white px-5 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-ash transition hover:bg-paper hover:text-ink">
              Send
            </button>
          </form>
        </section>
      {:else}
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
                <button class="rounded-md border border-white/15 bg-white/[0.04] px-3 py-2 text-sm font-semibold text-ink transition hover:bg-white/10">
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

          <section class="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-ink/20 bg-[#101010] text-white">
            <div class="flex items-center justify-between border-b border-white/10 bg-[#181818] px-4 py-3">
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
                        'grid grid-cols-[3rem_2rem_minmax(0,1fr)] px-3 py-1.5',
                        line.type === 'added' && 'bg-green-950/55 text-green-100',
                        line.type === 'removed' && 'bg-red-950/55 text-red-100',
                        line.type === 'context' && 'text-white/70'
                      ]}
                    >
                      <span class="select-none text-right text-white/30">{line.line}</span>
                      <span class="select-none text-center text-white/40">
                        {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
                      </span>
                      <code class="min-w-0 overflow-hidden text-ellipsis whitespace-pre">
                        {#if line.code.includes('const')}
                          <span class="text-sky-300">const</span>{line.code.replace('const', '')}
                        {:else if line.code.includes('role')}
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
      {/if}
    </div>
  </section>

  <aside class="min-h-0 overflow-hidden border-l border-white/10 bg-paper p-6">
    <section>
      <p class="font-mono text-xs font-medium uppercase tracking-[0.22em] text-ink/50">Lead Telemetry</p>
      <h2 class="mt-3 text-3xl font-semibold tracking-[-0.05em]">Run Status</h2>
    </section>

    <div class="my-7 h-px bg-white/10"></div>

    <section class="grid gap-2">
      {#each statusItems as item}
        <article class="rounded-md border border-white/10 bg-white/[0.03] p-3">
          <p class="font-mono text-[0.68rem] font-medium uppercase tracking-[0.14em] text-ink/45">
            {item.label}
          </p>
          <p class="mt-1 break-words text-base font-semibold leading-5 tracking-[-0.02em]">
            {item.value}
          </p>
        </article>
      {/each}
    </section>
  </aside>
  </div>
</main>
