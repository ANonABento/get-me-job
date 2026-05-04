import type { BankEntry } from "@/types";
import { cn } from "@/lib/utils";
import { SKILL_CATEGORY_COLORS } from "./chunk-card-config";
import {
  getDateRange,
  getHackathonTeamSize,
  getHighlights,
  getStringList,
  getTechnologies,
} from "./chunk-card-utils";

export function ChunkContentPreview({ entry }: { entry: BankEntry }) {
  const c = entry.content;

  switch (entry.category) {
    case "experience": {
      const dateRange = getDateRange(c);
      const highlights = getHighlights(c, 2);
      return (
        <div className="mt-1 space-y-1">
          {(c.location || dateRange) && (
            <p className="text-xs text-muted-foreground">
              {[c.location, dateRange].filter(Boolean).join(" · ")}
            </p>
          )}
          {c.description ? (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {String(c.description)}
            </p>
          ) : null}
          {highlights.length > 0 && (
            <ul className="text-xs text-muted-foreground list-disc list-inside">
              {highlights.map((h, i) => (
                <li key={i} className="truncate">
                  {h}
                </li>
              ))}
            </ul>
          )}
        </div>
      );
    }
    case "education": {
      const dateRange = getDateRange(c);
      return (
        <div className="mt-1 space-y-0.5">
          {c.field ? (
            <p className="text-sm text-muted-foreground">{String(c.field)}</p>
          ) : null}
          <p className="text-xs text-muted-foreground">
            {[dateRange, c.gpa ? `GPA: ${c.gpa}` : ""]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
      );
    }
    case "skill": {
      const cat = c.category ? String(c.category) : "";
      const prof = c.proficiency ? String(c.proficiency) : "";
      return (
        <div className="mt-1 flex items-center gap-1.5 flex-wrap">
          {cat && (
            <span
              className={cn(
                "text-2xs px-1.5 py-0.5 rounded-[var(--radius)] font-medium",
                SKILL_CATEGORY_COLORS[cat] || SKILL_CATEGORY_COLORS.other,
              )}
            >
              {cat}
            </span>
          )}
          {prof && (
            <span className="text-xs text-muted-foreground">{prof}</span>
          )}
        </div>
      );
    }
    case "project": {
      const techs = getTechnologies(c);
      return (
        <div className="mt-1 space-y-1">
          {c.description ? (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {String(c.description)}
            </p>
          ) : null}
          {techs.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {techs.slice(0, 5).map((t, i) => (
                <span
                  key={i}
                  className="text-2xs px-1.5 py-0.5 rounded-[var(--radius)] bg-accent/10 text-accent font-medium"
                >
                  {t}
                </span>
              ))}
              {techs.length > 5 && (
                <span className="text-2xs text-muted-foreground">
                  +{techs.length - 5} more
                </span>
              )}
            </div>
          )}
        </div>
      );
    }
    case "hackathon": {
      const prizes = getStringList(c, "prizes");
      const tracks = getStringList(c, "tracks");
      const themes = getStringList(c, "themes");
      const teamSize = getHackathonTeamSize(c);
      const dateRange = getDateRange(c);
      const tags = [...tracks, ...themes];

      return (
        <div className="mt-2 space-y-2">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-[var(--radius)] border-[length:var(--border-width)] border-warning/25 bg-background/70 px-2 py-1">
              <span className="block text-muted-foreground">Prizes</span>
              <span className="font-medium">
                {prizes.length > 0
                  ? prizes.slice(0, 2).join(" · ")
                  : "Not listed"}
              </span>
            </div>
            <div className="rounded-[var(--radius)] border-[length:var(--border-width)] border-warning/25 bg-background/70 px-2 py-1">
              <span className="block text-muted-foreground">Team</span>
              <span className="font-medium">{teamSize || "Flexible"}</span>
            </div>
          </div>
          {(c.location || dateRange) && (
            <p className="text-xs text-muted-foreground">
              {[c.location, dateRange].filter(Boolean).map(String).join(" · ")}
            </p>
          )}
          {tags.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {tags.slice(0, 5).map((tag, i) => (
                <span
                  key={`${tag}-${i}`}
                  className="text-2xs px-1.5 py-0.5 rounded-[var(--radius)] bg-warning/15 text-warning font-medium"
                >
                  {tag}
                </span>
              ))}
              {tags.length > 5 && (
                <span className="text-2xs text-muted-foreground">
                  +{tags.length - 5} more
                </span>
              )}
            </div>
          )}
        </div>
      );
    }
    case "certification":
      return (
        <div className="mt-1">
          <p className="text-xs text-muted-foreground">
            {[c.issuer, c.date].filter(Boolean).map(String).join(" · ")}
          </p>
        </div>
      );
    case "achievement":
      return c.description ? (
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
          {String(c.description)}
        </p>
      ) : null;
    default:
      return null;
  }
}
