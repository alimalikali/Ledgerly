import { useCategories } from "@/context/CategoriesContext";
import { cn } from "@/lib/utils";

export function CategoryPill({ id, className }: { id: string; className?: string }) {
  const { byId } = useCategories();
  const cat = byId(id);
  if (!cat) return <span className={cn("text-xs text-muted-foreground", className)}>Uncategorized</span>;
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium", className)}
      style={{
        backgroundColor: `color-mix(in oklab, ${cat.color} 16%, transparent)`,
        color: cat.color,
      }}
    >
      <span className="size-2 rounded-full" style={{ backgroundColor: cat.color }} aria-hidden />
      {cat.name}
    </span>
  );
}
