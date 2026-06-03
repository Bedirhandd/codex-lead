import { json } from "@sveltejs/kit";

export function GET() {
  return json({
    ok: true,
    service: "codex-lead-web-ui",
  });
}
