import { homedir } from "node:os";
import { join } from "node:path";
import {
  BentoRouter,
  createBentoRouterApi,
  JsonFilePolicyStore,
  JsonFileProviderConfigStore,
  JsonFileUsageStore,
  ProviderRegistry,
  TaskRegistry,
  type AddProviderInput,
  type BentoRouterApi,
  type BentoRouterInput,
  type BentoRouterResult,
  type ProviderConfig,
  type ProviderConfigPatch,
  type ProviderStreamChunk,
  type TaskPolicy,
  type ValidateProviderInput,
  type ValidateProviderResult,
} from "@anonabento/bento-router";
import {
  createSlothingBentoModelRegistry,
  registerSlothingBentoTasks,
  SLOTHING_BENTO_APP_ID,
} from "@/lib/llm/bentorouter-tasks";
import { createSlothingBentoEncryptionAdapter } from "@/lib/llm/encryption";

export interface SlothingBentoRouterClient {
  run(input: BentoRouterInput): Promise<BentoRouterResult>;
  stream(input: BentoRouterInput): AsyncIterable<ProviderStreamChunk>;
  api(): BentoRouterApi;
  adminState(userId: string): Promise<SlothingBentoRouterAdminState>;
}

export interface SlothingBentoRouterAdminState {
  tasks: Array<Record<string, unknown>>;
  models: Array<Record<string, unknown>>;
  providers: ProviderConfig[];
  usageSummary: Record<string, unknown>;
}

export interface SlothingBentoRouterClientOptions {
  mode?: "embedded" | "remote";
  storageRoot?: string;
  nextAuthSecret?: string;
  fetchImpl?: typeof fetch;
}

let singleton: SlothingBentoRouterClient | null = null;

export function getSlothingBentoRouterClient(
  options: SlothingBentoRouterClientOptions = {},
): SlothingBentoRouterClient {
  if (options.mode === "remote" || process.env.BENTO_ROUTER_MODE === "remote") {
    return new RemoteSlothingBentoRouterClient();
  }

  if (options.storageRoot || options.nextAuthSecret || options.fetchImpl) {
    return new EmbeddedSlothingBentoRouterClient(options);
  }

  singleton ??= new EmbeddedSlothingBentoRouterClient(options);
  return singleton;
}

export function resetSlothingBentoRouterClientForTests(): void {
  singleton = null;
}

export class EmbeddedSlothingBentoRouterClient implements SlothingBentoRouterClient {
  private readonly router: BentoRouter;
  private readonly bentoApi: BentoRouterApi;

  constructor(options: SlothingBentoRouterClientOptions = {}) {
    const storageRoot =
      options.storageRoot ??
      process.env.BENTO_ROUTER_STORAGE_ROOT ??
      join(homedir(), ".slothing", "bento-router");
    const taskRegistry = new TaskRegistry();
    registerSlothingBentoTasks(taskRegistry);
    const modelRegistry = createSlothingBentoModelRegistry();
    const providerRegistry = new ProviderRegistry();
    const providerConfigStore = new JsonFileProviderConfigStore(
      join(storageRoot, "providers.json"),
    );
    const policyStore = new JsonFilePolicyStore(
      join(storageRoot, "policies.json"),
    );
    const usageStore = new JsonFileUsageStore(join(storageRoot, "usage.json"));
    const encryption = createSlothingBentoEncryptionAdapter(
      options.nextAuthSecret,
    );

    this.router = new BentoRouter({
      taskRegistry,
      modelRegistry,
      providerRegistry,
      providerConfigStore,
      policyStore,
      usageStore,
      encryption,
    });
    this.bentoApi = createBentoRouterApi({
      router: this.router,
      taskRegistry,
      modelRegistry,
      providerRegistry,
      providerConfigStore,
      policyStore,
      usageStore,
      encryption,
      fetchImpl: options.fetchImpl,
    });
  }

  run(input: BentoRouterInput): Promise<BentoRouterResult> {
    return this.bentoApi.run(input) as Promise<BentoRouterResult>;
  }

  stream(input: BentoRouterInput): AsyncIterable<ProviderStreamChunk> {
    return this.router.stream(input);
  }

  api(): BentoRouterApi {
    return this.bentoApi;
  }

  async adminState(userId: string): Promise<SlothingBentoRouterAdminState> {
    const [tasks, models, providers, usageSummary] = await Promise.all([
      this.bentoApi.listTasks(SLOTHING_BENTO_APP_ID),
      this.bentoApi.listModels(),
      this.bentoApi.listConfiguredProviders(userId),
      this.bentoApi.usageSummaryByUser(userId),
    ]);
    return { tasks, models, providers, usageSummary };
  }
}

class RemoteSlothingBentoRouterClient implements SlothingBentoRouterClient {
  run(): Promise<BentoRouterResult> {
    throw new Error("Remote BentoRouter mode is not wired in Slothing yet.");
  }

  async *stream(): AsyncIterable<ProviderStreamChunk> {
    throw new Error("Remote BentoRouter mode is not wired in Slothing yet.");
  }

  api(): BentoRouterApi {
    throw new Error("Remote BentoRouter mode is not wired in Slothing yet.");
  }

  adminState(): Promise<SlothingBentoRouterAdminState> {
    throw new Error("Remote BentoRouter mode is not wired in Slothing yet.");
  }
}

export async function listSlothingBentoRouterAdminState(
  userId: string,
): Promise<SlothingBentoRouterAdminState> {
  return getSlothingBentoRouterClient().adminState(userId);
}

export async function addSlothingBentoProvider(
  input: AddProviderInput,
): Promise<ProviderConfig> {
  return getSlothingBentoRouterClient().api().addConfiguredProvider(input);
}

export async function updateSlothingBentoProvider(
  userId: string,
  id: string,
  patch: ProviderConfigPatch,
): Promise<ProviderConfig> {
  return getSlothingBentoRouterClient()
    .api()
    .updateConfiguredProvider(userId, id, patch);
}

export async function removeSlothingBentoProvider(
  userId: string,
  id: string,
): Promise<void> {
  await getSlothingBentoRouterClient()
    .api()
    .removeConfiguredProvider(userId, id);
}

export async function validateSlothingBentoProvider(
  input: ValidateProviderInput,
): Promise<ValidateProviderResult> {
  return getSlothingBentoRouterClient().api().validateProvider(input);
}

export async function updateSlothingBentoTaskPolicy(
  taskId: string,
  policy: Partial<TaskPolicy>,
): Promise<Record<string, unknown>> {
  return getSlothingBentoRouterClient().api().updateTaskPolicy(taskId, policy);
}
