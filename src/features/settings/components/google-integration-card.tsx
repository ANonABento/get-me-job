import { Cloud } from "lucide-react";
import { GoogleConnectButton } from "@/components/google";
import { GOOGLE_FEATURES } from "@/features/settings/constants";

export function GoogleIntegrationCard() {
  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-green-500 text-white">
          <Cloud className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-semibold">Google Integration</h2>
          <p className="text-sm text-muted-foreground">
            Connect your Google account to sync calendars, store documents, and more
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <GoogleConnectButton />

        <div className="pt-2 border-t">
          <h3 className="text-sm font-medium mb-3">Connected features:</h3>
          <div className="grid gap-2 sm:grid-cols-3">
            {GOOGLE_FEATURES.map((feature) => {
              const Icon = feature.icon;

              return (
                <div key={feature.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon className={`h-4 w-4 ${feature.iconClassName}`} />
                  <span>{feature.label}</span>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Connect your Google account to enable these features. Your data stays private and secure.
          </p>
        </div>
      </div>
    </div>
  );
}

