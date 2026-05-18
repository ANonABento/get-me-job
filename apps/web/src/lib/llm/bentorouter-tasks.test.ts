import { describe, expect, it } from "vitest";
import { TaskRegistry } from "@anonabento/bento-router";
import { SLOTHING_AI_TASKS } from "@/lib/llm/tasks";
import {
  createSlothingBentoModelRegistry,
  getSlothingBentoTaskIds,
  registerSlothingBentoTasks,
  SLOTHING_BENTO_TASK_IDS,
  SLOTHING_TASK_TO_BENTO_TASK_ID,
} from "./bentorouter-tasks";

describe("Slothing BentoRouter task definitions", () => {
  it("maps every local Bento-backed task to a registered BentoRouter task", () => {
    const bentoTaskIds = new Set<string>(SLOTHING_BENTO_TASK_IDS);

    for (const task of SLOTHING_AI_TASKS) {
      if (!task.bentoTaskId) continue;
      expect(SLOTHING_TASK_TO_BENTO_TASK_ID[task.id]).toBe(task.bentoTaskId);
      expect(bentoTaskIds.has(task.bentoTaskId)).toBe(true);
    }
  });

  it("registers the 10 source-of-truth task IDs with resolvable default models", () => {
    const registry = new TaskRegistry();
    const modelRegistry = createSlothingBentoModelRegistry();

    registerSlothingBentoTasks(registry);

    expect(
      registry
        .list("slothing")
        .map((task) => task.id)
        .sort(),
    ).toEqual([...getSlothingBentoTaskIds()].sort());

    for (const task of registry.list("slothing")) {
      expect(modelRegistry.get(task.defaultPolicy.primaryModel)).toBeDefined();
      for (const fallback of task.defaultPolicy.fallbacks ?? []) {
        expect(modelRegistry.get(fallback)).toBeDefined();
      }
    }
  });
});
