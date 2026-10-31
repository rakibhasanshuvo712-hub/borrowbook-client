/**
 * Thin client for the Express backend's 8 routes (+ POST /jwt).
 * Every call follows the same shape: fetch the endpoint, JSON in / JSON out,
 * and throw an Error carrying the server's `message` on failure so pages can
 * surface it in a toast.
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

const RAW_BASE = process.env.NEXT_PUBLIC_SERVER_BASE_URL ?? ""
const BASE_URL = RAW_BASE.replace(/\/+$/, "")

function baseUrl(): string {
  if (!BASE_URL) {
    throw new Error(
      "NEXT_PUBLIC_SERVER_BASE_URL is not set. Add it to .env and restart the dev server."
    )
  }
  return BASE_URL
}

/** Local stand-in for books whose `image` field is empty or missing in the DB. */
export const FALLBACK_COVER = "/covers/cover-teal.svg"

function str(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value
  if (value == null) return fallback
  return String(value)
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
 * route (POST /jwt). The cookie rides along through the same-origin proxy,
 * so the server signs a token only for a session it recognizes — the email
 * is never taken from the request body.
 */
export async function issueToken(): Promise<string> {
  const res = await fetch(`${baseUrl()}/jwt`, {
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
  const res = await fetch(`${baseUrl()}/books`)
  if (!res.ok) throw new Error(await readError(res))
  const data: unknown = await res.json()
  if (!Array.isArray(data)) {
    throw new Error("The server returned an unexpected response.")
  }
  return data.map(normalizeBook)
}

export async function fetchBook(id: string): Promise<Book> {
  const res = await fetch(`${baseUrl()}/books/${id}`)
  if (!res.ok) throw new Error(await readError(res))
  return normalizeBook(await res.json())
}

export async function createBook(
  book: NewBookInput,
  token: string
): Promise<unknown> {
  const res = await fetch(`${baseUrl()}/books`, {
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
  const res = await fetch(`${baseUrl()}/books/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(book),
  })
  if (!res.ok) throw new Error(await readError(res))
  return res.json()
}

export async function deleteBook(id: string, token: string): Promise<void> {
  const res = await fetch(`${baseUrl()}/books/${id}`, {
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
  const res = await fetch(`${baseUrl()}/borrows`, {
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
    `${baseUrl()}/borrows?email=${encodeURIComponent(email)}`,
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
  const res = await fetch(`${baseUrl()}/borrows/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  })
  if (!res.ok) throw new Error(await readError(res))
}

// ---------- image hosting ----------

const IMGBB_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY ?? ""

/** True when cover uploads to imgbb are configured via NEXT_PUBLIC_IMGBB_API_KEY. */
export function canUploadImages(): boolean {
  return IMGBB_KEY.trim() !== ""
}

/** Uploads a file to imgbb and resolves with the hosted image URL. */
export async function uploadImage(file: File): Promise<string> {
  const key = IMGBB_KEY.trim()
  if (!key) {
    throw new Error(
      "Image upload is not configured — paste an image URL instead."
    )
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error("That file is larger than 10 MB. Please pick a smaller image.")
  }

  const body = new FormData()
  body.append("image", file)

  const res = await fetch(`https://api.imgbb.com/1/upload?key=${key}`, {
    method: "POST",
    body,
  })
  const data: unknown = await res.json().catch(() => null)
  const payload = data as {
    success?: boolean
    data?: { url?: string }
    error?: { message?: string }
  } | null

  if (!res.ok || !payload?.success || !payload.data?.url) {
    throw new Error(
      payload?.error?.message ?? `The upload failed (status ${res.status}).`
    )
  }
  return payload.data.url
}
