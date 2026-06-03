<script lang="ts">
  import type { StatusItem, UsageLimit } from "$lib/data/dashboard";

  export let leadModelOptions: readonly string[];
  export let statusItems: readonly StatusItem[];
  export let thinkingLevelOptions: readonly string[];
  export let usageLimits: readonly UsageLimit[];

  let selectedLeadModel = "gpt-5.4";
  let selectedLeadThinkingLevel = "high";
  let isLeadModelPickerOpen = false;
  let leadConfigStep: "model" | "thinking" = "model";
  let highlightedLeadConfigIndex = 0;

  $: currentLeadConfigOptions =
    leadConfigStep === "model" ? leadModelOptions : thinkingLevelOptions;

  function openLeadConfigPicker() {
    isLeadModelPickerOpen = true;
    leadConfigStep = "model";
    highlightedLeadConfigIndex = 0;
  }

  function selectLeadConfigOption(value: string) {
    if (leadConfigStep === "model") {
      selectedLeadModel = value;
      leadConfigStep = "thinking";
      highlightedLeadConfigIndex = Math.max(
        thinkingLevelOptions.indexOf(selectedLeadThinkingLevel),
        0
      );
      return;
    }

    selectedLeadThinkingLevel = value;
    isLeadModelPickerOpen = false;
    leadConfigStep = "model";
    highlightedLeadConfigIndex = 0;
  }

  function handleLeadConfigKeydown(event: KeyboardEvent) {
    if (!isLeadModelPickerOpen) {
      if (event.key === "Enter") {
        event.preventDefault();
        openLeadConfigPicker();
      }

      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      highlightedLeadConfigIndex =
        (highlightedLeadConfigIndex + 1) % currentLeadConfigOptions.length;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      highlightedLeadConfigIndex =
        (highlightedLeadConfigIndex - 1 + currentLeadConfigOptions.length) %
        currentLeadConfigOptions.length;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      selectLeadConfigOption(currentLeadConfigOptions[highlightedLeadConfigIndex]);
    }

    if (event.key === "Escape") {
      event.preventDefault();
      isLeadModelPickerOpen = false;
      leadConfigStep = "model";
      highlightedLeadConfigIndex = 0;
    }
  }
</script>

<aside class="min-h-0 overflow-hidden border-l border-white/10 bg-paper p-6">
  <section>
    <p class="font-mono text-xs font-medium uppercase tracking-[0.22em] text-ink/50">
      Lead Telemetry
    </p>
    <h2 class="mt-3 text-3xl font-semibold tracking-[-0.05em]">Run Status</h2>
  </section>

  <div class="my-7 h-px bg-white/10"></div>

  <section class="grid gap-2">
    <article class="rounded-md border border-white/10 bg-white/[0.03] p-3">
      <p class="font-mono text-[0.68rem] font-medium uppercase tracking-[0.14em] text-ink/45">
        Lead Agent Model
      </p>

      <div class="relative mt-3">
        <button
          class="flex w-full items-center justify-between gap-3 rounded-md border border-white/10 bg-white/[0.02] px-3 py-2.5 text-left transition hover:border-white/15 hover:bg-white/[0.04]"
          aria-haspopup="listbox"
          aria-expanded={isLeadModelPickerOpen}
          onkeydown={handleLeadConfigKeydown}
          onclick={() => {
            if (isLeadModelPickerOpen) {
              isLeadModelPickerOpen = false;
              leadConfigStep = "model";
              return;
            }

            openLeadConfigPicker();
          }}
        >
          <span>
            <span class="block text-sm font-medium text-ink/85">
              {selectedLeadModel} / {selectedLeadThinkingLevel}
            </span>
          </span>
          <svg
            aria-hidden="true"
            class={["size-4 text-ink/45 transition", isLeadModelPickerOpen && "rotate-180"]}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="m6 9 6 6 6-6" />
          </svg>
        </button>

        {#if isLeadModelPickerOpen}
          <section
            class="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 overflow-hidden rounded-md border border-white/12 bg-[#151515] shadow-2xl"
          >
            <div class="flex items-center gap-2 border-b border-white/10 px-3 py-2">
              <span
                class={[
                  "size-1.5 rounded-full transition",
                  leadConfigStep === "model" ? "bg-white" : "bg-white/25"
                ]}
              ></span>
              <span
                class={[
                  "size-1.5 rounded-full transition",
                  leadConfigStep === "thinking" ? "bg-white" : "bg-white/25"
                ]}
              ></span>
              <p class="ml-2 font-mono text-[0.66rem] uppercase tracking-[0.12em] text-ink/40">
                {leadConfigStep === "model" ? "Choose model" : "Choose thinking level"}
              </p>
            </div>

            <div class="grid gap-1 p-2">
              {#each currentLeadConfigOptions as option, index}
                <button
                  type="button"
                  class={[
                    "rounded-md px-3 py-2 text-left text-sm font-medium transition",
                    index === highlightedLeadConfigIndex
                      ? "bg-white text-ash"
                      : "text-ink hover:bg-white/10"
                  ]}
                  onclick={() => selectLeadConfigOption(option)}
                  onmouseenter={() => (highlightedLeadConfigIndex = index)}
                >
                  {option}
                </button>
              {/each}
            </div>
          </section>
        {/if}
      </div>
    </article>

    <article class="rounded-md border border-white/10 bg-white/[0.03] p-3">
      <p class="font-mono text-[0.68rem] font-medium uppercase tracking-[0.14em] text-ink/45">
        Usage Limits
      </p>

      <div class="mt-3 grid gap-3">
        {#each usageLimits as limit}
          <section>
            <div class="flex items-center justify-between gap-3">
              <p class="text-sm font-semibold">{limit.label}</p>
              <p class="font-mono text-xs text-ink/45">{limit.percent}% used</p>
            </div>
            <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div class="h-full rounded-full bg-white/60" style={`width: ${limit.percent}%`}></div>
            </div>
            <p class="mt-1 font-mono text-xs text-ink/35">{limit.resetsAt}</p>
          </section>
        {/each}
      </div>
    </article>

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
