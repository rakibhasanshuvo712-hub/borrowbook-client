export function PagePlaceholder({
  title,
  description,
  note,
}: {
  title: string
  description: string
  note: string
}) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 text-muted-foreground">{description}</p>
      <div className="mt-8 flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-border p-10 text-center">
        <p className="text-sm font-medium">{note}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          This page is coming soon.
        </p>
      </div>
    </div>
  )
}
