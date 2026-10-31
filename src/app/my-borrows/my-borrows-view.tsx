"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { fetchBorrows, returnBorrow, type Borrow } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { formatDate } from "@/lib/format"
import { toast } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function MyBorrowsView() {
  const { user, token } = useAuth()
  const [borrows, setBorrows] = React.useState<Borrow[] | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [returningId, setReturningId] = React.useState<string | null>(null)
  const requested = React.useRef(false)

  const load = React.useCallback(async () => {
    if (!user || !token) return
    // State is only touched once the request settles, so the effect body
    // never triggers a synchronous re-render.
    try {
      const borrows = await fetchBorrows(user.email, token)
      setError(null)
      setBorrows(borrows)
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong."
      setError(message)
      toast.add({
        type: "error",
        title: "Could not load your borrows",
        description: message,
      })
    }
  }, [user, token])

  React.useEffect(() => {
    if (requested.current) return
    requested.current = true
    void load()
  }, [load])

  function retry() {
    setBorrows(null)
    setError(null)
    void load()
  }

  async function handleReturn(borrow: Borrow) {
    if (returningId || !token) return

    setReturningId(borrow._id)
    try {
      await returnBorrow(borrow._id, token)
      setBorrows((prev) =>
        prev ? prev.filter((item) => item._id !== borrow._id) : prev
      )
      toast.add({
        type: "success",
        title: "Book returned",
        description: `Thanks for returning “${borrow.bookTitle}”.`,
      })
    } catch (err: unknown) {
      toast.add({
        type: "error",
        title: "Could not return the book",
        description:
          err instanceof Error ? err.message : "Something went wrong.",
      })
    } finally {
      setReturningId(null)
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <header className="account-banner">
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.15em] text-violet-800">Out in the world</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">My Borrows</h1>
        <p className="mt-2 max-w-xl text-sm text-foreground/70 sm:text-base">
          Your current reads, with their return dates all in one place.
        </p>
      </header>

      {borrows === null ? (
        error ? (
          <div className="mt-12 flex flex-col items-center gap-4 text-center">
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" size="sm" onClick={retry}>
              Try again
            </Button>
          </div>
        ) : (
          <div
            role="status"
            aria-label="Loading your borrows"
            className="mt-16 flex justify-center"
          >
            <Spinner className="size-6 text-muted-foreground" />
          </div>
        )
      ) : borrows.length === 0 ? (
        <p className="mt-12 text-center text-sm text-muted-foreground">
          You have not borrowed anything yet.{" "}
          <Link
            href="/books"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Browse the shelves
          </Link>
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-2xl bg-card/90 p-2 shadow-xl shadow-teal-950/5 ring-1 ring-white/80 backdrop-blur-sm sm:p-3">
          <Table className="min-w-[640px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Borrow Date</TableHead>
                <TableHead>Return Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {borrows.map((borrow) => (
                <TableRow key={borrow._id}>
                  <TableCell>
                    <div className="relative size-12 overflow-hidden rounded-md bg-muted ring-1 ring-foreground/10">
                      <Image
                        src={borrow.bookImage}
                        alt={`Cover of ${borrow.bookTitle}`}
                        fill
                        sizes="48px"
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {borrow.bookTitle}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(borrow.borrowDate)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(borrow.returnDate)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={returningId !== null}
                      onClick={() => void handleReturn(borrow)}
                    >
                      {returningId === borrow._id ? (
                        <>
                          <Spinner />
                          Returning…
                        </>
                      ) : (
                        "Return Book"
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
