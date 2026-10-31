/** Short, readable date ("12 Mar 2026") for lists and tables. */
export function formatDate(value: string | undefined | null): string {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

/** ISO date (yyyy-mm-dd) for `type="date"` inputs. */
export function toDateInputValue(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${date.getFullYear()}-${month}-${day}`
}

/** Today plus `days`, as yyyy-mm-dd — the default return date when borrowing. */
export function defaultReturnDate(days = 14): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return toDateInputValue(date.toISOString())
}
