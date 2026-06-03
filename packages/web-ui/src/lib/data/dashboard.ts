export type ThreadId = "lead" | "explore-1" | "explore-2";

export type WorkerStatus = "working" | "stopped" | "failed" | "completed";

export type ActiveWorker = {
  id: Exclude<ThreadId, "lead">;
  name: string;
  model: string;
  thinking: string;
  status: string;
};

export type StatusItem = {
  label: string;
  value: string;
};

export type Run = {
  id: string;
  title: string;
  status: string;
  updatedAt: string;
  summary: string;
};

export type Message = {
  role: "Lead Agent" | "You";
  time: string;
  body: string;
};

export type SpawnedWorkerPreview = {
  name: string;
  status: WorkerStatus;
  duration: string;
  time: string;
  model: string;
  thinking: string;
  threadId: Exclude<ThreadId, "lead">;
  prompt: string;
};

export type SlashCommand = {
  command: string;
  description: string;
};

export type UsageLimit = {
  label: string;
  percent: number;
  resetsAt: string;
};

export type WorkerOutput = string;

export type DiffLine = {
  type: "context" | "removed" | "added";
  line: number;
  code: string;
};

export const leadModelOptions = ["gpt-5.4", "gpt-5.5", "gpt-5.4-mini"] as const;

export const thinkingLevelOptions = ["low", "medium", "high", "xhigh"] as const;

export const activeWorkers = [
  {
    id: "explore-1",
    name: "Dummy Explore Worker",
    model: "gpt-5.4",
    thinking: "medium",
    status: "working...",
  },
  {
    id: "explore-2",
    name: "Dummy Explore Worker 2",
    model: "gpt-5.4-mini",
    thinking: "low",
    status: "idle",
  },
] as const satisfies readonly ActiveWorker[];

export const statusItems = [
  {
    label: "Active Worker Count",
    value: "2",
  },
  {
    label: "Lead Agent Context Window",
    value: "63%",
  },
  {
    label: "Current Directory",
    value: "/home/bedirhandd/Projects/codex-lead",
  },
  {
    label: "Git Branch",
    value: "main",
  },
] as const satisfies readonly StatusItem[];

export const runs = [
  {
    id: "run_20260203_094112",
    title: "Web UI orchestration cockpit",
    status: "active",
    updatedAt: "09:52",
    summary: "Lead Agent is waiting for spawned worker threads to finish.",
  },
  {
    id: "run_20260202_181504",
    title: "Initial MVP scope interview",
    status: "completed",
    updatedAt: "Yesterday",
    summary: "Created goal.md, scope.md, and initial acceptance criteria.",
  },
  {
    id: "run_20260201_233840",
    title: "Review loop prototype",
    status: "paused",
    updatedAt: "2 days ago",
    summary: "Stopped after first dummy review worker report.",
  },
  {
    id: "run_20260131_151227",
    title: "Worker output audit",
    status: "failed",
    updatedAt: "3 days ago",
    summary: "Review Worker failed while parsing raw-review.txt.",
  },
  {
    id: "run_20260130_104903",
    title: "Plan worker prompt refinement",
    status: "completed",
    updatedAt: "4 days ago",
    summary: "Improved plan.md structure and worker prompt boundaries.",
  },
  {
    id: "run_20260126_172019",
    title: "Git worker handoff rehearsal",
    status: "completed",
    updatedAt: "Last week",
    summary: "Validated CONTRIBUTING.md-aware commit flow with dummy changes.",
  },
  {
    id: "run_20260125_090744",
    title: "Local docs and standards mapping",
    status: "stopped",
    updatedAt: "Last week",
    summary:
      "Stopped after discovering missing standards directory conventions.",
  },
  {
    id: "run_20260118_215631",
    title: "Parallel explore worker experiment",
    status: "completed",
    updatedAt: "2 weeks ago",
    summary: "Compared multiple Explore Worker outputs for the same codebase.",
  },
] as const satisfies readonly Run[];

export const messages = [
  {
    role: "Lead Agent",
    time: "09:38",
    body: "Tell me what you want this run to accomplish. I will keep asking until the scope is sharp enough to hand to workers.",
  },
  {
    role: "You",
    time: "09:39",
    body: "Start with the web UI. Keep the data dummy for now and make the layout feel like a local orchestration cockpit.",
  },
  {
    role: "Lead Agent",
    time: "09:40",
    body: "Understood. I will keep this run focused on interface structure: left navigation, central chat, and right-side operational metadata.",
  },
] as const satisfies readonly Message[];

export const spawnedWorkerPreviews = [
  {
    name: "Spawned Explore Worker",
    status: "working",
    duration: "12m",
    time: "09:41",
    model: "gpt-5.4",
    thinking: "medium",
    threadId: "explore-1",
    prompt:
      "See the whole project for implementation context, identify the relevant files, and summarize risks before planning.",
  },
  {
    name: "Spawned Plan Worker",
    status: "stopped",
    duration: "1m",
    time: "09:44",
    model: "gpt-5.5",
    thinking: "xhigh",
    threadId: "explore-2",
    prompt:
      "Read goal.md and scope.md, then draft a detailed implementation plan without editing code.",
  },
  {
    name: "Spawned Review Worker",
    status: "failed",
    duration: "4m",
    time: "09:47",
    model: "gpt-5.5",
    thinking: "xhigh",
    threadId: "explore-2",
    prompt:
      "Run native Codex review against uncommitted changes and return findings in a concise report.",
  },
  {
    name: "Spawned Git Worker",
    status: "completed",
    duration: "36m",
    time: "09:52",
    model: "gpt-5.4",
    thinking: "low",
    threadId: "explore-2",
    prompt:
      "Inspect uncommitted changes, follow CONTRIBUTING.md, and prepare a conventional commit summary.",
  },
] as const satisfies readonly SpawnedWorkerPreview[];

export const slashCommands = [
  {
    command: "/init",
    description: "Initialize codex-lead files for this workspace.",
  },
  {
    command: "/resume",
    description: "Open existing runs for this project and switch between them.",
  },
] as const satisfies readonly SlashCommand[];

export const leadStates = [
  "Working...",
  "Thinking...",
  "Waiting Workers to Finish...",
  "Compacting Conversation...",
] as const;

export const activeLeadState = leadStates[0];

export const activeLeadStateElapsed = "34m";

export const workerStatusClasses = {
  working: "bg-blue-400",
  stopped: "bg-yellow-400",
  failed: "bg-red-400",
  completed: "bg-green-400",
} as const satisfies Record<WorkerStatus, string>;

export const usageLimits = [
  {
    label: "Weekly",
    percent: 42,
    resetsAt: "resets at June 4",
  },
  {
    label: "5h Period",
    percent: 68,
    resetsAt: "resets at 5:44pm",
  },
] as const satisfies readonly UsageLimit[];

export const workerOutputs = [
  "[09:41:12] starting repository scan",
  "[09:41:14] reading package metadata and SvelteKit routes",
  "[09:41:16] detected Tailwind v4 with app.css theme tokens",
  "[09:41:18] found candidate UI entry: packages/web-ui/src/routes/+page.svelte",
  "[09:41:21] working... preparing summary and implementation notes",
] as const satisfies readonly WorkerOutput[];

export const diffLines = [
  {
    type: "context",
    line: 41,
    code: "  const messages = [",
  },
  {
    type: "removed",
    line: 42,
    code: "    { role: 'Lead Agent', body: 'Old placeholder output.' }",
  },
  {
    type: "added",
    line: 42,
    code: "    { role: 'Lead Agent', body: 'Streaming worker thread output.' }",
  },
  {
    type: "context",
    line: 43,
    code: "  ];",
  },
  {
    type: "added",
    line: 44,
    code: "  const workerStatus = 'working...';",
  },
] as const satisfies readonly DiffLine[];
