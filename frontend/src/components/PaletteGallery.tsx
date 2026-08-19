import { Check } from "lucide-react";
import { paletteList } from "@/lib/palettes";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

export function PaletteGallery() {
  const { palette, setPalette, resolvedMode } = useTheme();

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {paletteList.map((p) => {
        const active = palette === p.id;
        const colors = resolvedMode === "dark" ? p.dark : p.light;
        return (
          <button
            key={p.id}
            onClick={() => setPalette(p.id)}
            aria-pressed={active}
            aria-label={`Use ${p.name} palette`}
            className={cn(
              "group relative flex flex-col gap-3 rounded-2xl border bg-surface p-4 text-left transition-all hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active ? "border-primary shadow-md ring-2 ring-primary/30" : "border-border",
            )}
          >
            <div className="flex items-center gap-1.5">
              <span
                className="h-8 w-8 rounded-lg"
                style={{ background: colors.primary }}
                aria-hidden
              />
              <span
                className="h-8 w-4 rounded-lg"
                style={{ background: colors.accent }}
                aria-hidden
              />
              <span
                className="h-8 w-4 rounded-lg"
                style={{ background: colors.chart2 }}
                aria-hidden
              />
              <span
                className="h-8 w-4 rounded-lg"
                style={{ background: colors.income }}
                aria-hidden
              />
              <span
                className="h-8 w-4 rounded-lg"
                style={{ background: colors.expense }}
                aria-hidden
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{p.name}</span>
              {active && (
                <span className="inline-flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="size-3" aria-hidden />
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
