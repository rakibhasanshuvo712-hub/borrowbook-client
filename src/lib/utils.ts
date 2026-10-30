export { cn } from "cn"

/** First letters of up to two name parts, e.g. "Jane Doe" -> "JD". */
export function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("")
}
