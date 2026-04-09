import { ExternalLink } from "lucide-react";
import { SETTINGS_HELP_CARDS } from "@/features/settings/constants";

export function SettingsHelpCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {SETTINGS_HELP_CARDS.map((card) => {
        const Icon = card.icon;

        return (
          <div key={card.title} className="rounded-2xl border bg-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-xl ${card.iconClassName}`}>
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold">{card.title}</h3>
            </div>

            {"description" in card ? (
              <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                {card.description.map((step) => (
                  <li key={step.label}>
                    {step.kind === "link" ? (
                      <>
                        {step.prefix}{" "}
                        <a
                          href={step.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline inline-flex items-center gap-1"
                        >
                          {step.label} <ExternalLink className="h-3 w-3" />
                        </a>
                      </>
                    ) : step.kind === "code" ? (
                      <>
                        {step.prefix}{" "}
                        <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{step.label}</code>
                      </>
                    ) : (
                      step.label
                    )}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-muted-foreground">{card.body}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

