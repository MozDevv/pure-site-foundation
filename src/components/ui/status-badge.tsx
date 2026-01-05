import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        pending: "bg-warning/10 text-warning border border-warning/20",
        submitted: "bg-info/10 text-info border border-info/20",
        graded: "bg-success/10 text-success border border-success/20",
        late: "bg-destructive/10 text-destructive border border-destructive/20",
        draft: "bg-muted text-muted-foreground border border-border",
        active: "bg-primary/10 text-primary border border-primary/20",
        completed: "bg-success/10 text-success border border-success/20",
        in_progress: "bg-info/10 text-info border border-info/20",
      },
      size: {
        sm: "px-2 py-0.5 text-[10px]",
        md: "px-3 py-1 text-xs",
        lg: "px-4 py-1.5 text-sm",
      },
    },
    defaultVariants: {
      variant: "pending",
      size: "md",
    },
  }
);

interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeVariants> {
  dot?: boolean;
}

export function StatusBadge({
  className,
  variant,
  size,
  dot = true,
  children,
  ...props
}: StatusBadgeProps) {
  return (
    <span
      className={cn(statusBadgeVariants({ variant, size, className }))}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            variant === "pending" && "bg-warning",
            variant === "submitted" && "bg-info",
            variant === "graded" && "bg-success",
            variant === "late" && "bg-destructive",
            variant === "draft" && "bg-muted-foreground",
            variant === "active" && "bg-primary",
            variant === "completed" && "bg-success",
            variant === "in_progress" && "bg-info"
          )}
        />
      )}
      {children}
    </span>
  );
}
