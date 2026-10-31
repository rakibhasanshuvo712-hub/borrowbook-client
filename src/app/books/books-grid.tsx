"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
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
      <h1 className="text-2xl font-semibold tracking-tight">All Books</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Every title on our shelves — pick one and view the details to borrow it.
      </p>

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
              <article className="group flex h-full flex-col overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 transition-shadow duration-200 hover:shadow-md">
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted">
                  <Image
                    src={book.image}
                    alt={`Cover of ${book.title}`}
                    width={300}
                    height={400}
                    unoptimized
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <span className="absolute top-3 left-3 rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium text-foreground ring-1 ring-foreground/10">
                    {book.category}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h2 className="font-medium leading-snug">{book.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {book.author}
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
