import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SettingsPage from "./page";
import messages from "@/messages/en.json";

const mocks = vi.hoisted(() => ({
  pathname: "/settings",
  replace: vi.fn(),
  searchParams: new URLSearchParams(),
  useDataIO: vi.fn(),
  useLLMSettings: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => mocks.pathname,
  useRouter: () => ({
    replace: mocks.replace,
  }),
  useSearchParams: () => mocks.searchParams,
}));

vi.mock("./use-data-io", () => ({
  useDataIO: mocks.useDataIO,
}));

vi.mock("./use-llm-settings", () => ({
  useLLMSettings: mocks.useLLMSettings,
}));

vi.mock("@/components/settings/llm-provider-selector", () => ({
  PROVIDERS: [
    { value: "ollama", label: "Ollama", requiresKey: false },
    { value: "openai", label: "OpenAI", requiresKey: true },
    { value: "anthropic", label: "Anthropic", requiresKey: true },
    { value: "openrouter", label: "OpenRouter", requiresKey: true },
  ],
  LLMProviderSelector: ({ provider }: { provider: string }) => (
    <section data-testid="llm-provider-selector">Provider: {provider}</section>
  ),
}));

vi.mock("@/components/settings/llm-provider-config", () => ({
  LLMProviderConfig: ({
    selectedProvider,
  }: {
    selectedProvider?: { label: string };
  }) => (
    <section data-testid="llm-provider-config">
      {selectedProvider?.label} Configuration
    </section>
  ),
}));

vi.mock("@/components/settings/what-ai-powers", () => ({
  WhatAiPowers: () => <section data-testid="what-ai-powers" />,
}));

vi.mock("@/components/settings/ai-task-routing-section", () => ({
  AiTaskRoutingSection: ({ hasProvider }: { hasProvider: boolean }) => (
    <section data-testid="ai-task-routing-section">
      AI task routing {String(hasProvider)}
    </section>
  ),
}));

vi.mock("@/components/settings/bento-router-admin-section", () => ({
  SlothingBentoRouterAdminSection: () => (
    <section data-testid="bento-router-admin-section" />
  ),
}));

vi.mock("@/components/settings/prompt-variants-section", () => ({
  PromptVariantsSection: () => (
    <section data-testid="prompt-variants-section" />
  ),
}));

vi.mock("@/components/settings/help-cards", () => ({
  HelpCards: () => <section data-testid="help-cards" />,
}));

vi.mock("@/components/settings/eval-health-section", () => ({
  EvalHealthSection: () => <section data-testid="eval-health-section" />,
}));

vi.mock("@/components/settings/theme-section", () => ({
  ThemeSection: () => <section data-testid="theme-section" />,
}));

vi.mock("@/components/settings/billing-section", () => ({
  BillingSection: () => <section data-testid="billing-section" />,
}));

vi.mock("@/components/settings/locale-section", () => ({
  LocaleSection: () => <section data-testid="locale-section" />,
}));

vi.mock("@/components/settings/language-section", () => ({
  LanguageSection: () => <section data-testid="language-section" />,
}));

vi.mock("@/components/settings/opportunity-review-section", () => ({
  OpportunityReviewSection: () => (
    <section data-testid="opportunity-review-section" />
  ),
}));

vi.mock("@/components/settings/data-management", () => ({
  DataManagement: () => <section data-testid="data-management" />,
}));

vi.mock("@/components/settings/google-integration", () => ({
  GoogleIntegration: () => <section data-testid="google-integration" />,
}));

vi.mock("@/components/settings/gmail-auto-status-section", () => ({
  GmailAutoStatusSection: () => (
    <section data-testid="gmail-auto-status-section" />
  ),
}));

vi.mock("@/components/settings/danger-zone-section", () => ({
  DangerZoneSection: () => <section data-testid="danger-zone-section" />,
}));

function mockSettingsPage(provider = "openai") {
  mocks.useLLMSettings.mockReturnValue({
    config: { provider, model: "gpt-4o-mini", apiKey: "test-key" },
    loading: false,
    saving: false,
    testing: false,
    testResult: null,
    hasChanges: false,
    availableModels: ["gpt-4o-mini"],
    updateConfig: vi.fn(),
    saveSettings: vi.fn(),
    testConnection: vi.fn(),
  });

  mocks.useDataIO.mockReturnValue({
    exporting: null,
    importing: false,
    importResult: null,
    showImportPreview: null,
    exportData: vi.fn(),
    handleFileImport: vi.fn(),
    handleFullImportPreview: vi.fn(),
    confirmFullImport: vi.fn(),
    clearImportPreview: vi.fn(),
  });
}

function renderSettingsPage(search = "") {
  mocks.searchParams = new URLSearchParams(search);

  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <SettingsPage />
    </NextIntlClientProvider>,
  );
}

describe("SettingsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.location.hash = "";
    mockSettingsPage();
  });

  it("renders the settings shell at the wide page width", () => {
    const { container } = renderSettingsPage();

    // `wide` is full-bleed now (dropped the `max-w-screen-2xl` cap when
    // the coach rail came out). Settings uses the compact header variant;
    // header and content share the responsive app-page inset.
    const header = screen.getByRole("banner");
    expect(header).toHaveAttribute("data-variant", "compact");
    expect(header.firstElementChild).toHaveClass("px-4", "py-3", "sm:px-6");

    const content = container.querySelector(".px-4.py-5.sm\\:px-6.sm\\:py-6");
    expect(content).not.toBeNull();
  });

  it("renders the category tabs and opens General by default", () => {
    renderSettingsPage();

    const tablist = screen.getByRole("tablist", {
      name: /settings categories/i,
    });
    for (const label of ["General", "Integrations", "AI", "Data", "Billing"]) {
      expect(within(tablist).getByRole("tab", { name: label })).toBeVisible();
    }

    expect(screen.getByRole("tab", { name: "General" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByTestId("locale-section")).toBeInTheDocument();
    expect(screen.getByTestId("language-section")).toBeInTheDocument();
    expect(screen.getByTestId("theme-section")).toBeInTheDocument();
    expect(screen.queryByTestId("google-integration")).not.toBeInTheDocument();
  });

  it("keeps every settings section in the reorganized tab panels", () => {
    const { unmount: unmountGeneral } = renderSettingsPage();
    expect(screen.getByTestId("theme-section")).toBeInTheDocument();
    expect(screen.getByTestId("locale-section")).toBeInTheDocument();
    expect(screen.getByTestId("language-section")).toBeInTheDocument();
    unmountGeneral();

    const { unmount: unmountIntegrations } =
      renderSettingsPage("tab=integrations");
    expect(screen.getByTestId("google-integration")).toBeInTheDocument();
    expect(screen.getByTestId("gmail-auto-status-section")).toBeInTheDocument();
    expect(
      screen.getByTestId("opportunity-review-section"),
    ).toBeInTheDocument();
    unmountIntegrations();

    const { unmount: unmountAi } = renderSettingsPage("tab=ai");
    expect(screen.getByTestId("llm-provider-selector")).toBeInTheDocument();
    expect(screen.getByTestId("llm-provider-config")).toHaveTextContent(
      "OpenAI Configuration",
    );
    expect(screen.getByTestId("what-ai-powers")).toBeInTheDocument();
    expect(
      screen.getByTestId("bento-router-admin-section"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("ai-task-routing-section")).toHaveTextContent(
      "AI task routing true",
    );
    expect(screen.getByTestId("prompt-variants-section")).toBeInTheDocument();
    expect(screen.getByTestId("help-cards")).toBeInTheDocument();
    expect(screen.getByTestId("eval-health-section")).toBeInTheDocument();
    unmountAi();

    const { unmount: unmountData } = renderSettingsPage("tab=data");
    expect(screen.getByTestId("data-management")).toBeInTheDocument();
    expect(screen.getByTestId("danger-zone-section")).toBeInTheDocument();
    unmountData();

    renderSettingsPage("tab=billing");
    expect(screen.getByTestId("billing-section")).toBeInTheDocument();
  });

  it("updates the URL query when a tab is selected", () => {
    renderSettingsPage();

    fireEvent.click(screen.getByRole("tab", { name: "AI" }));

    expect(mocks.replace).toHaveBeenCalledWith("/settings?tab=ai", {
      scroll: false,
    });
  });

  it("falls back to General for an invalid tab query", () => {
    renderSettingsPage("tab=unknown");

    expect(screen.getByRole("tab", { name: "General" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByTestId("locale-section")).toBeInTheDocument();
  });

  it("maps old section hashes to their new tabs", async () => {
    window.location.hash = "#ai-keys";

    renderSettingsPage();

    await waitFor(() => {
      expect(mocks.replace).toHaveBeenCalledWith("/settings?tab=ai", {
        scroll: false,
      });
    });
  });

  it("shows the Ollama warning only for Ollama and keeps it inside the AI tab panel", () => {
    mockSettingsPage("ollama");

    const { unmount } = renderSettingsPage("tab=ai");

    expect(screen.getByText("Make sure Ollama is running")).toBeInTheDocument();

    const aiPanel = screen.getByRole("tabpanel");
    expect(
      within(aiPanel).getByText("Make sure Ollama is running"),
    ).toBeInTheDocument();

    unmount();
    vi.clearAllMocks();
    mockSettingsPage("anthropic");
    renderSettingsPage("tab=ai");

    expect(
      screen.queryByText("Make sure Ollama is running"),
    ).not.toBeInTheDocument();
  });
});
