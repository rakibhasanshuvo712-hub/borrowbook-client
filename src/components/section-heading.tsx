import { cn } from "cn"

/**
 * Single source of truth for section heading style (size, weight, spacing)
 * so every section on the page stays visually consistent.
 */
export function SectionHeading({
  title,
  subtitle,
  align = "center",
  id,
  className,
}: {
  title: string
  subtitle?: string
  align?: "center" | "start"
  id?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      <h2 id={id} className="text-2xl font-semibold tracking-tight sm:text-3xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {subtitle}
        </p>
      ) : null}
    </div>
  )
}
