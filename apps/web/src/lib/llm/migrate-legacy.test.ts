import { mkdtemp, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, describe, expect, it } from "vitest";
import { EmbeddedSlothingBentoRouterClient } from "./bentorouter-client";
import { getSlothingBentoTaskIds } from "./bentorouter-tasks";
import { migrateLegacySlothingLLMConfig } from "./migrate-legacy";

let tempRoots: string[] = [];

afterEach(async () => {
  await Promise.all(
    tempRoots.map((root) => rm(root, { recursive: true, force: true })),
  );
  tempRoots = [];
});

describe("migrateLegacySlothingLLMConfig", () => {
  it("registers the legacy provider and applies policies idempotently", async () => {
    const storageRoot = await mkdtemp(join(tmpdir(), "slothing-bento-"));
    tempRoots.push(storageRoot);
    const client = new EmbeddedSlothingBentoRouterClient({
      storageRoot,
      nextAuthSecret: "test-nextauth-secret",
    });

    const first = await migrateLegacySlothingLLMConfig({
      userId: "user-1",
      legacy: {
        provider: "openai",
        apiKey: "sk-legacy",
        model: "gpt-4o-mini",
      },
      api: client.api(),
    });

    expect(first).toEqual({
      migrated: true,
      providerRegistered: true,
      policiesUpdated: getSlothingBentoTaskIds().length,
    });
    await expect(
      client.api().listConfiguredProviders("user-1"),
    ).resolves.toHaveLength(1);

    for (const taskId of getSlothingBentoTaskIds()) {
      await expect(client.api().getTask(taskId)).resolves.toMatchObject({
        effectivePolicy: { primaryModel: "openai/gpt-4o-mini" },
      });
    }

    const providersJson = await readFile(
      join(storageRoot, "providers.json"),
      "utf8",
    );
    expect(providersJson).not.toContain("sk-legacy");
    expect(providersJson).toContain("aes-256-gcm-v1");

    const second = await migrateLegacySlothingLLMConfig({
      userId: "user-1",
      legacy: {
        provider: "openai",
        apiKey: "sk-legacy",
        model: "gpt-4o-mini",
      },
      api: client.api(),
    });

    expect(second).toEqual({
      migrated: true,
      providerRegistered: false,
      policiesUpdated: 0,
    });
    await expect(
      client.api().listConfiguredProviders("user-1"),
    ).resolves.toHaveLength(1);
  });
});
