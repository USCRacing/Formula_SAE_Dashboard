import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  className?: string;
  headingLevel?: "h2" | "h3" | "h4";
};

export function EmptyState({
  icon,
  title,
  description,
  className,
  headingLevel: Tag = "h3",
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 text-center",
        className
      )}
    >
      {icon && (
        <div className="mb-4 text-racing/30">{icon}</div>
      )}
      <Tag className="font-heading text-lg font-bold uppercase tracking-wide">{title}</Tag>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
