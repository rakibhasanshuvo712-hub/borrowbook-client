export type Book = {
  id: string
  title: string
  author: string
  category: string
  image: string
}

/** Sample shelf shown until NEXT_PUBLIC_API_URL points at the backend. */
export const SAMPLE_BOOKS: Book[] = [
  {
    id: "the-silent-patient",
    title: "The Silent Patient",
    author: "Alex Michaelides",
    category: "Thriller",
    image: "/covers/cover-rose.svg",
  },
  {
    id: "atomic-habits",
    title: "Atomic Habits",
    author: "James Clear",
    category: "Self-Help",
    image: "/covers/cover-amber.svg",
  },
  {
    id: "the-midnight-library",
    title: "The Midnight Library",
    author: "Matt Haig",
    category: "Fiction",
    image: "/covers/cover-emerald.svg",
  },
  {
    id: "sapiens",
    title: "Sapiens",
    author: "Yuval Noah Harari",
    category: "History",
    image: "/covers/cover-indigo.svg",
  },
  {
    id: "project-hail-mary",
    title: "Project Hail Mary",
    author: "Andy Weir",
    category: "Science Fiction",
    image: "/covers/cover-violet.svg",
  },
  {
    id: "the-alchemist",
    title: "The Alchemist",
    author: "Paulo Coelho",
    category: "Classic",
    image: "/covers/cover-teal.svg",
  },
]

type ApiBook = Partial<Book> & { _id?: string; cover?: string }

function normalize(raw: ApiBook, index: number): Book {
  return {
    id: String(raw._id ?? raw.id ?? `book-${index}`),
    title: String(raw.title ?? "Untitled"),
    author: String(raw.author ?? "Unknown author"),
    category: String(raw.category ?? "General"),
    image: String(raw.image ?? raw.cover ?? "/covers/cover-teal.svg"),
  }
}

/**
 * Loads the newest books for the New Arrivals section. The backend is expected
 * to do the MongoDB side of this — `sort({ createdAt: -1 }).limit(n)` — we only
 * pass the query along. Falls back to the sample shelf when no API is
 * configured (NEXT_PUBLIC_API_URL) or the request fails; a valid empty result
 * is respected as-is.
 */
export async function fetchLatestBooks(limit = 6): Promise<Book[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL
  if (!baseUrl) return SAMPLE_BOOKS.slice(0, limit)

  try {
    const res = await fetch(
      `${baseUrl.replace(/\/+$/, "")}/books?sort=createdAt&limit=${limit}`
    )
    if (!res.ok) throw new Error(`Books API responded with ${res.status}`)
    const payload: unknown = await res.json()
    const list: unknown = Array.isArray(payload)
      ? payload
      : (payload as { books?: unknown }).books
    if (!Array.isArray(list)) throw new Error("Unexpected Books API shape")
    return list
      .map((item, index) => normalize(item as ApiBook, index))
      .slice(0, limit)
  } catch {
    return SAMPLE_BOOKS.slice(0, limit)
  }
}

export type NewBookInput = {
  title: string
  author: string
  image: string
  type: string
  category: string
  quantity: number
  description: string
}

export type AddBookResult = { ok: true } | { ok: false; error: string }

/**
 * Submits a new book to the backend. With no NEXT_PUBLIC_API_URL configured
 * there is no backend yet, so the submission is accepted in demo mode to keep
 * the flow testable; set the env var to persist for real.
 */
export async function addBook(input: NewBookInput): Promise<AddBookResult> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL
  if (!baseUrl) return { ok: true }

  try {
    const res = await fetch(`${baseUrl.replace(/\/+$/, "")}/books`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })
    if (!res.ok) {
      return {
        ok: false,
        error: `The server rejected the book (status ${res.status}).`,
      }
    }
    return { ok: true }
  } catch {
    return { ok: false, error: "Could not reach the server. Please try again." }
  }
}
