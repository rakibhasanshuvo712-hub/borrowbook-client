/**
 * Thin client for the Express backend's 8 routes (+ POST /jwt).
 *
 * Every call follows the same shape: fetch `${API_BASE_URL}/<path>`, JSON in
 * / JSON out, and throw an Error carrying the server's `message` on failure.
 * Both local and deployed clients call same-origin proxy routes. The Next.js
 * server forwards these to SERVER_API_URL, keeping auth cookies first-party
 * and the backend URL out of browser bundles.
 */

export const CATEGORIES = [
  "Fiction",
  "Science",
  "History",
  "Kids",
  "Others",
] as const

export type Book = {
  _id: string
  title: string
  author: string
  category: string
  image: string
  description: string
  /** User-assigned identifier (ISBN, shelf number, inventory code, etc.). */
  bookNumber: string
  /** Total stock the owner declared when adding the book. */
  totalCopies: number
  /** Copies not currently borrowed — drives the Borrow / "Not Available" UI. */
  availableCopies: number
  userName: string
  userEmail: string
  addedAt: string
}

export type Borrow = {
  _id: string
  bookId: string
  bookTitle: string
  bookImage: string
  userName: string
  userEmail: string
  borrowDate: string
  returnDate: string
}

export type NewBookInput = Omit<Book, "_id">
export type NewBorrowInput = Omit<Borrow, "_id">

/** Base URL for backend API calls. */
const API_BASE_URL = "/api/server"

/** Local stand-in for books whose `image` field is empty or missing in the DB. */
export const FALLBACK_COVER = "/covers/cover-teal.svg"

function str(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value
  if (value == null) return fallback
  return String(value)
}

/**
 * Coerces a stock-count field to a non-negative integer. Older documents
 * predate the "Total Copies" challenge and store nothing here, so absent
 * values fall back to 1 (a single lendable copy) rather than 0, which would
 * otherwise disable borrowing on every legacy book.
 */
function toCount(...values: unknown[]): number {
  for (const value of values) {
    const n = typeof value === "string" ? Number(value) : value
    if (typeof n === "number" && Number.isFinite(n) && n >= 0) {
      return Math.floor(n)
    }
  }
  return 1
}

/**
 * Coerces a raw `books` document into the shape the UI renders. Older or
 * hand-edited documents can miss fields entirely — an absent/empty `image`
 * would otherwise reach `next/image` as `src=""` and crash the page.
 */
function normalizeBook(raw: unknown): Book {
  const record = (
    typeof raw === "object" && raw !== null ? raw : {}
  ) as Record<string, unknown>
  return {
    _id: str(record._id),
    title: str(record.title, "Untitled"),
    author: str(record.author, "Unknown author"),
    category: str(record.category, "Others"),
    image: str(record.image).trim() || FALLBACK_COVER,
    description: str(record.description),
    bookNumber: str(record.bookNumber),
    totalCopies: toCount(record.totalCopies, record.copies),
    availableCopies: toCount(record.availableCopies, record.totalCopies, record.copies),
    userName: str(record.userName),
    userEmail: str(record.userEmail),
    addedAt: str(record.addedAt),
  }
}

/** Same treatment for `borrows` documents (bookImage has the same failure). */
function normalizeBorrow(raw: unknown): Borrow {
  const record = (
    typeof raw === "object" && raw !== null ? raw : {}
  ) as Record<string, unknown>
  return {
    _id: str(record._id),
    bookId: str(record.bookId),
    bookTitle: str(record.bookTitle, "Untitled"),
    bookImage: str(record.bookImage).trim() || FALLBACK_COVER,
    userName: str(record.userName),
    userEmail: str(record.userEmail),
    borrowDate: str(record.borrowDate),
    returnDate: str(record.returnDate),
  }
}

/** Server errors are `{ message: "..." }`; fall back to the status code. */
async function readError(res: Response): Promise<string> {
  try {
    const data: unknown = await res.json()
    if (
      typeof data === "object" &&
      data !== null &&
      typeof (data as { message?: unknown }).message === "string"
    ) {
      return (data as { message: string }).message
    }
  } catch {
    // Non-JSON body — use the status message below.
  }
  return `Request failed (status ${res.status}).`
}

function authHeaders(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` }
}

// ---------- auth ----------

/**
 * Exchanges the Better Auth session cookie for the JWT used on every private
 * route (POST /jwt).
 */
export async function issueToken(): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/jwt`, {
    method: "POST",
    credentials: "include",
  })
  if (!res.ok) throw new Error(await readError(res))
  const data: unknown = await res.json()
  const token = (data as { token?: unknown })?.token
  if (typeof token !== "string" || !token) {
    throw new Error("The server did not return a token.")
  }
  return token
}

// ---------- books ----------

export async function fetchBooks(): Promise<Book[]> {
  const res = await fetch(`${API_BASE_URL}/books`)
  if (!res.ok) throw new Error(await readError(res))
  const data: unknown = await res.json()
  if (!Array.isArray(data)) {
    throw new Error("The server returned an unexpected response.")
  }
  return data.map(normalizeBook)
}

export async function fetchBook(id: string): Promise<Book> {
  const res = await fetch(`${API_BASE_URL}/books/${id}`)
  if (!res.ok) throw new Error(await readError(res))
  return normalizeBook(await res.json())
}

export async function createBook(
  book: NewBookInput,
  token: string
): Promise<unknown> {
  const res = await fetch(`${API_BASE_URL}/books`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(book),
  })
  if (!res.ok) throw new Error(await readError(res))
  return res.json()
}

export async function updateBook(
  id: string,
  book: Partial<NewBookInput>,
  token: string
): Promise<unknown> {
  const res = await fetch(`${API_BASE_URL}/books/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(book),
  })
  if (!res.ok) throw new Error(await readError(res))
  return res.json()
}

export async function deleteBook(id: string, token: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/books/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  })
  if (!res.ok) throw new Error(await readError(res))
}

// ---------- borrows ----------

export async function createBorrow(
  borrow: NewBorrowInput,
  token: string
): Promise<unknown> {
  const res = await fetch(`${API_BASE_URL}/borrows`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(borrow),
  })
  if (!res.ok) throw new Error(await readError(res))
  return res.json()
}

export async function fetchBorrows(
  email: string,
  token: string
): Promise<Borrow[]> {
  const res = await fetch(
    `${API_BASE_URL}/borrows?email=${encodeURIComponent(email)}`,
    { headers: authHeaders(token) }
  )
  if (!res.ok) throw new Error(await readError(res))
  const data: unknown = await res.json()
  if (!Array.isArray(data)) {
    throw new Error("The server returned an unexpected response.")
  }
  return data.map(normalizeBorrow)
}

export async function returnBorrow(id: string, token: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/borrows/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  })
  if (!res.ok) throw new Error(await readError(res))
}
