import { Spinner } from "@/components/ui/spinner"

/** Route-level loading state shown while a page's data resolves. */
export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Loading page"
      className="flex flex-1 items-center justify-center py-24"
    >
      <Spinner className="size-6 text-muted-foreground" />
    </div>
  )
}
