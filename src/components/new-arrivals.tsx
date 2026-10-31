"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRightIcon } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/toast"
import { fetchBooks, type Book } from "@/lib/api"
import { formatDate } from "@/lib/format"
import { SectionHeading } from "@/components/section-heading"

/** Newest six books, ordered by the date they were added. */
function newestFirst(books: Book[]): Book[] {
  return [...books].sort((a, b) => {
    const byDate = (b.addedAt ?? "").localeCompare(a.addedAt ?? "")
    return byDate !== 0 ? byDate : b._id.localeCompare(a._id)
  })
}

export function NewArrivals() {
  const [books, setBooks] = React.useState<Book[] | null>(null)
  const [failed, setFailed] = React.useState(false)
  const requested = React.useRef(false)

  React.useEffect(() => {
    // Strict Mode mounts effects twice in dev; one request, one toast.
    if (requested.current) return
    requested.current = true

    fetchBooks()
      .then((result) => setBooks(newestFirst(result).slice(0, 6)))
      .catch((error: unknown) => {
        const message =
          error instanceof Error ? error.message : "Something went wrong."
        setFailed(true)
        toast.add({
          type: "error",
          title: "Could not load new arrivals",
          description: message,
        })
      })
  }, [])

  return (
    <section
      aria-labelledby="new-arrivals-heading"
      className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6"
    >
      <SectionHeading
        id="new-arrivals-heading"
        title="New Arrivals"
        subtitle="The latest six books to join our shelves, newest first."
      />

      {books === null ? (
        failed ? (
          <p className="mt-10 text-center text-sm text-muted-foreground">
            We could not reach the library right now — please refresh to try
            again.
          </p>
        ) : (
          <SkeletonGrid />
        )
      ) : books.length === 0 ? (
        <p className="mt-10 text-center text-sm text-muted-foreground">
          No books here yet — check back soon.
        </p>
      ) : (
        <ul className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
                  <h3 className="font-medium leading-snug">{book.title}</h3>
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

      <div className="mt-10 flex justify-center">
        <Link href="/books" className={buttonVariants({ size: "lg" })}>
          See All Books
          <ArrowRightIcon />
        </Link>
      </div>
    </section>
  )
}

function SkeletonGrid() {
  return (
    <ul
      aria-hidden="true"
      className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {Array.from({ length: 6 }).map((_, index) => (
        <li
          key={index}
          className="overflow-hidden rounded-xl ring-1 ring-foreground/10"
        >
          <Skeleton className="aspect-[3/4] w-full rounded-none" />
          <div className="space-y-2 p-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="mt-4 h-8 w-full" />
          </div>
        </li>
      ))}
    </ul>
  )
}
