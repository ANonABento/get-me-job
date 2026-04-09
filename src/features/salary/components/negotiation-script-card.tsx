import { Check, Copy, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { NegotiationScript } from "@/features/salary/types";

interface NegotiationScriptCardProps {
  copied: boolean;
  onCopy: () => void;
  script: NegotiationScript | null;
}

export function NegotiationScriptCard({
  copied,
  onCopy,
  script,
}: NegotiationScriptCardProps) {
  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-semibold">Your Negotiation Script</h2>
        {script ? (
          <Button variant="outline" size="sm" onClick={onCopy}>
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </>
            )}
          </Button>
        ) : null}
      </div>

      {script ? (
        <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
          <ScriptSection title="Opening">
            <p className="text-sm bg-muted/50 p-3 rounded-lg">{script.opening}</p>
          </ScriptSection>

          <ScriptSection title="Value Points">
            <ul className="space-y-2">
              {script.valuePoints.map((point, index) => (
                <li
                  key={index}
                  className="text-sm bg-muted/50 p-3 rounded-lg flex items-start gap-2"
                >
                  <span className="shrink-0 w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center">
                    {index + 1}
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </ScriptSection>

          <ScriptSection title="The Ask">
            <p className="text-sm bg-success/10 border border-success/20 p-3 rounded-lg">
              {script.theAsk}
            </p>
          </ScriptSection>

          <ScriptSection title="Handling Pushback">
            <div className="space-y-3">
              {script.pushbackResponses.map((entry, index) => (
                <div key={index} className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">If they say:</p>
                  <p className="text-sm font-medium mb-2">&ldquo;{entry.objection}&rdquo;</p>
                  <p className="text-xs text-muted-foreground mb-1">You respond:</p>
                  <p className="text-sm">{entry.response}</p>
                </div>
              ))}
            </div>
          </ScriptSection>

          <ScriptSection title="Close">
            <p className="text-sm bg-muted/50 p-3 rounded-lg">{script.close}</p>
          </ScriptSection>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="p-4 rounded-full bg-muted text-muted-foreground mb-4">
            <TrendingUp className="h-8 w-8" />
          </div>
          <p className="text-muted-foreground">
            Enter offer details to generate your personalized negotiation script
          </p>
        </div>
      )}
    </div>
  );
}

interface ScriptSectionProps {
  children: React.ReactNode;
  title: string;
}

function ScriptSection({ children, title }: ScriptSectionProps) {
  return (
    <div>
      <h3 className="text-sm font-medium text-primary mb-2">{title}</h3>
      {children}
    </div>
  );
}

