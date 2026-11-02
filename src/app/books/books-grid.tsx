"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { BookOpenCheckIcon, SparklesIcon } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/components/ui/toast"
import { fetchBooks, type Book } from "@/lib/api"
import { formatDate } from "@/lib/format"

export function BooksGrid() {
  const [books, setBooks] = React.useState<Book[] | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const requested = React.useRef(false)

  // Only sets state once the request settles, so the effect body stays free
  // of synchronous renders.
  const load = React.useCallback(async () => {
    try {
      const result = await fetchBooks()
      setError(null)
      setBooks(result)
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong."
      setError(message)
      toast.add({
        type: "error",
        title: "Could not load the books",
        description: message,
      })
    }
  }, [])

  React.useEffect(() => {
    // Strict Mode mounts effects twice in dev; one request, one toast.
    if (requested.current) return
    requested.current = true
    void load()
  }, [load])

  function retry() {
    setBooks(null)
    setError(null)
    void load()
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <header className="relative mb-7 flex items-center justify-between gap-4 overflow-hidden rounded-3xl bg-gradient-to-r from-[#f0e4cd] via-[#edf4ef] to-[#ead8c6] px-5 py-6 ring-1 ring-white/80 sm:mb-9 sm:gap-6 sm:px-9 sm:py-10">
        <div aria-hidden="true" className="absolute -right-8 -bottom-28 size-64 rounded-full border-[2rem] border-white/40" />
        <div className="relative">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/85 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#1f5960] ring-1 ring-[#1f5960]/10">
            <SparklesIcon className="size-3.5" /> The community shelf
          </span>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:mt-4 sm:text-4xl">All Books</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-foreground/70 sm:text-base">
            Every title on our shelves. Find a story that feels like it was waiting for you.
          </p>
        </div>
        <div className="relative hidden size-20 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-[#1f5960] to-[#bd8960] text-white shadow-xl shadow-[#193a42]/15 sm:flex">
          <BookOpenCheckIcon className="size-9" />
        </div>
      </header>

      {books === null ? (
        error ? (
          <div className="mt-12 flex flex-col items-center gap-4 text-center">
            <p className="text-sm text-muted-foreground">{error}</p>
            <button
              type="button"
              onClick={retry}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Try again
            </button>
          </div>
        ) : (
          <div
            role="status"
            aria-label="Loading books"
            className="mt-16 flex justify-center"
          >
            <Spinner className="size-6 text-muted-foreground" />
          </div>
        )
      ) : books.length === 0 ? (
        <p className="mt-12 text-center text-sm text-muted-foreground">
          No books yet — be the first to add one.
        </p>
      ) : (
        <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <li key={book._id} className="h-full">
              <article className="book-card group flex h-full flex-col overflow-hidden">
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted">
                  <Image
                    src={book.image}
                    alt={`Cover of ${book.title}`}
                    width={300}
                    height={400}
                    unoptimized
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <span className="absolute top-3 left-3 rounded-full bg-amber-100/95 px-3 py-1 text-xs font-semibold text-amber-950 shadow-sm ring-1 ring-amber-200/80">
                    {book.category}
                  </span>
                  <span className="absolute right-3 bottom-3 rounded-full bg-teal-950/85 px-3 py-1.5 text-xs font-semibold text-white shadow-lg backdrop-blur">
                    {book.availableCopies} of {book.totalCopies} available
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h2 className="font-medium leading-snug">{book.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {book.author}
                  </p>
                  <p className="mt-2 text-sm font-medium text-teal-800">
                    {book.availableCopies > 0
                      ? `${book.availableCopies} available to borrow`
                      : "Not Available"}
                  </p>
                  {book.addedAt ? (
                    <p className="mt-1 text-xs text-muted-foreground/80">
                      Added {formatDate(book.addedAt)}
                    </p>
                  ) : null}
                  <div className="mt-auto pt-4">
                    <Link
                      href={`/books/${book._id}`}
                      className={buttonVariants({
                        variant: "outline",
                        size: "sm",
                        className: "w-full",
                      })}
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
