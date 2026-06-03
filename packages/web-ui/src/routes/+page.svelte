<script lang="ts">
  const activeWorkers = ['Dummy Explore Worker', 'Dummy Explore Worker 2'];

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
      body: 'Tell me what you want this run to accomplish. I will keep asking until the scope is sharp enough to hand to workers.'
    },
    {
      role: 'You',
      body: 'Start with the web UI. Keep the data dummy for now and make the layout feel like a local orchestration cockpit.'
    },
    {
      role: 'Lead Agent',
      body: 'Understood. I will keep this run focused on interface structure: left navigation, central chat, and right-side operational metadata.'
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
  <div class="mx-auto grid h-full max-w-500 grid-cols-[25rem_minmax(0,1fr)_25rem] overflow-hidden rounded-lg border border-ink/20 bg-paper">
  <aside class="min-h-0 overflow-hidden border-r border-ink/20 bg-paper p-6">
    <section>
      <p class="font-mono text-xs font-medium uppercase tracking-[0.22em] text-ink/55">Codex Lead</p>
      <h1 class="mt-3 text-4xl font-semibold tracking-[-0.06em]">Lead Agent</h1>
    </section>

    <div class="my-7 h-px bg-ink/20"></div>

    <section>
      <p class="text-xs font-semibold uppercase tracking-[0.18em] text-ink/55">Active Workers</p>
      <div class="mt-4 grid gap-3">
        {#each activeWorkers as worker}
          <button class="rounded-md border border-ink/20 bg-white px-4 py-3 text-left font-mono text-sm font-medium transition hover:bg-ink hover:text-paper">
            {worker}
          </button>
        {/each}
      </div>
    </section>

    <div class="my-7 h-px bg-ink/20"></div>

    <button class="w-full rounded-md border border-ink bg-ink px-4 py-3 text-left text-sm font-semibold uppercase tracking-[0.14em] text-paper transition hover:bg-paper hover:text-ink">
      Change Run
    </button>

    <div class="my-7 h-px bg-ink/20"></div>

    <button class="w-full rounded-md border border-ink bg-paper px-4 py-3 text-left text-sm font-semibold uppercase tracking-[0.14em] text-ink transition hover:bg-ink hover:text-paper">
      Create a New Run
    </button>

    <div class="my-7 h-px bg-ink/20"></div>

    <a
      class="block rounded-md border border-ink/20 bg-white px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-ink transition hover:bg-ink hover:text-paper"
      href="https://github.com"
      rel="noreferrer"
      target="_blank"
    >
      codex-lead Github
    </a>
  </aside>

  <section class="flex min-h-0 flex-col overflow-hidden bg-ash">

    <div class="flex min-h-0 flex-1 flex-col px-8 py-6">
      <div class="grid flex-1 content-start gap-4 overflow-y-auto pb-6">
        {#each messages as message}
          <article
            class={[
              'max-w-[72%] rounded-lg border border-ink/15 p-5 shadow-sm',
              message.role === 'You'
                ? 'ml-auto bg-ink text-paper'
                : 'bg-white text-ink'
            ]}
          >
            <p class="font-mono text-xs font-medium uppercase tracking-[0.16em] opacity-55">{message.role}</p>
            <p class="mt-3 text-base leading-7 font-normal">{message.body}</p>
          </article>
        {/each}
      </div>

      <form class="grid grid-cols-[minmax(0,1fr)_9rem] overflow-hidden rounded-lg border border-ink bg-white">
        <input
          class="min-w-0 bg-transparent px-5 py-4 text-base outline-none placeholder:text-ink/35"
          placeholder="Write to Lead Agent..."
        />
        <button class="border-l border-ink bg-ink px-5 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-paper transition hover:bg-paper hover:text-ink">
          Send
        </button>
      </form>
    </div>
  </section>

  <aside class="min-h-0 overflow-hidden border-l border-ink/20 bg-paper p-6">
    <section>
      <p class="font-mono text-xs font-medium uppercase tracking-[0.22em] text-ink/55">Lead Telemetry</p>
      <h2 class="mt-3 text-3xl font-semibold tracking-[-0.05em]">Run Status</h2>
    </section>

    <div class="my-7 h-px bg-ink/20"></div>

    <section class="grid gap-2">
      {#each statusItems as item}
        <article class="rounded-md border border-ink/20 bg-white p-3">
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
