import { api } from "./api";
import type { TodayData } from "../types";

type Tool = {
  name: string;
  title: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations: { readOnlyHint: boolean; untrustedContentHint: boolean };
  execute: (input: unknown) => Promise<unknown>;
};

declare global {
  interface Document {
    modelContext?: {
      registerTool: (tool: Tool, options?: { signal?: AbortSignal }) => void | Promise<void>;
    };
  }
}

export const registerTodayTools = () => {
  const context = document.modelContext;
  if (!context?.registerTool) return () => undefined;
  const lifecycle = new AbortController();
  const register = (tool: Tool) => Promise.resolve(context.registerTool(tool, { signal: lifecycle.signal })).catch(() => undefined);

  void register({
    name: "read_today_reset_plan",
    title: "Read today's RESET plan",
    description: "Read the signed-in user's current RESET focus, routine, completion, and self-reported targets without changing them.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true, untrustedContentHint: false },
    async execute() {
      const data = await api<TodayData>("/today");
      return { day: data.day, duration: data.duration, focus: data.program.focus, completion: data.completion, routine: data.entry.routine };
    }
  });

  void register({
    name: "update_today_routine_item",
    title: "Update a routine item",
    description: "Mark one existing item in today's visible RESET routine as done, skipped, or pending, with an optional private note.",
    inputSchema: {
      type: "object",
      properties: {
        key: { type: "string" },
        status: { type: "string", enum: ["pending", "done", "skipped"] },
        note: { type: "string", maxLength: 400 }
      },
      required: ["key", "status"],
      additionalProperties: false
    },
    annotations: { readOnlyHint: false, untrustedContentHint: false },
    async execute(input) {
      const value = input as { key?: string; status?: string; note?: string };
      if (!value.key || !["pending", "done", "skipped"].includes(value.status || "")) throw new Error("A valid routine key and status are required.");
      const result = await api<{ completion: number }>(`/today/items/${encodeURIComponent(value.key)}`, { method: "PATCH", body: { status: value.status, note: value.note || "" } });
      return { key: value.key, status: value.status, completion: result.completion };
    }
  });

  void register({
    name: "get_no_scroll_activity_options",
    title: "Get no-scroll activity options",
    description: "Get short alternative activities for a chosen available time window without changing user data.",
    inputSchema: {
      type: "object",
      properties: { minutes: { type: "integer", enum: [5, 15, 30, 60, 120] } },
      required: ["minutes"],
      additionalProperties: false
    },
    annotations: { readOnlyHint: true, untrustedContentHint: false },
    async execute(input) {
      const minutes = Number((input as { minutes?: number }).minutes);
      if (![5, 15, 30, 60, 120].includes(minutes)) throw new Error("Choose 5, 15, 30, 60, or 120 minutes.");
      return api(`/today/bored/${minutes}`);
    }
  });

  return () => lifecycle.abort();
};
