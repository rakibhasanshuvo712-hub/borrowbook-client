"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"
import { createBorrow, fetchBook, type Book } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { defaultReturnDate, formatDate, toDateInputValue } from "@/lib/format"
import { toast } from "@/components/ui/toast"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function BookDetailsView({ id }: { id: string }) {
  const { user, token } = useAuth()
  const [book, setBook] = React.useState<Book | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const requested = React.useRef(false)

  const [borrowOpen, setBorrowOpen] = React.useState(false)
  const [returnDate, setReturnDate] = React.useState(defaultReturnDate())
  const [borrowing, setBorrowing] = React.useState(false)

  React.useEffect(() => {
    // Strict Mode mounts effects twice in dev; one request, one toast.
    if (requested.current) return
    requested.current = true

    fetchBook(id)
      .then(setBook)
      .catch((err: unknown) => {
        const message =
          err instanceof Error ? err.message : "Something went wrong."
        setError(message)
        toast.add({
          type: "error",
          title: "Could not load this book",
          description: message,
        })
      })
  }, [id])

  async function handleBorrow(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (borrowing || !user || !token || !book) return

    const form = new FormData(event.currentTarget)
    const data = Object.fromEntries(form.entries())
    const chosenReturnDate = String(data.returnDate ?? "")

    if (!chosenReturnDate) {
      toast.add({
        type: "error",
        title: "Return date required",
        description: "Pick the date you plan to bring the book back.",
      })
      return
    }

    setBorrowing(true)
    try {
      await createBorrow(
        {
          bookId: book._id,
          bookTitle: book.title,
          bookImage: book.image,
          userName: user.name,
          userEmail: user.email,
          borrowDate: toDateInputValue(new Date().toISOString()),
          returnDate: chosenReturnDate,
        },
        token
      )
      toast.add({
        type: "success",
        title: "Book borrowed",
        description: `“${book.title}” is yours until ${formatDate(chosenReturnDate)}. Find it under My Borrows.`,
      })
      setBorrowOpen(false)
    } catch (err: unknown) {
      toast.add({
        type: "error",
        title: "Could not borrow this book",
        description:
          err instanceof Error ? err.message : "Something went wrong.",
      })
    } finally {
      setBorrowing(false)
    }
  }

  if (error) {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-4 px-4 py-20 text-center">
        <p className="text-sm text-muted-foreground">{error}</p>
        <Link href="/books" className={buttonVariants({ variant: "outline" })}>
          Back to All Books
        </Link>
      </div>
    )
  }

  if (!book) {
    return (
      <div
        role="status"
        aria-label="Loading book"
        className="flex flex-1 items-center justify-center py-24"
      >
        <Spinner className="size-6 text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <Link
        href="/books"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" />
        Back to All Books
      </Link>

      <div className="mt-6 grid gap-8 md:grid-cols-[minmax(0,300px)_minmax(0,1fr)]">
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-muted ring-1 ring-foreground/10">
          <Image
            src={book.image}
            alt={`Cover of ${book.title}`}
            fill
            sizes="(max-width: 768px) 100vw, 300px"
            unoptimized
            className="object-cover"
          />
          <span className="absolute top-3 left-3 rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium text-foreground ring-1 ring-foreground/10">
            {book.category}
          </span>
        </div>

        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {book.title}
          </h1>
          <p className="mt-1 text-base text-muted-foreground">
            by {book.author}
          </p>

          <dl className="mt-6 grid grid-cols-1 gap-3 rounded-xl bg-card p-4 text-sm ring-1 ring-foreground/10 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Category
              </dt>
              <dd className="mt-0.5">{book.category}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Added
              </dt>
              <dd className="mt-0.5">{formatDate(book.addedAt)}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Added by
              </dt>
              <dd className="mt-0.5 truncate">{book.userName || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Contact
              </dt>
              <dd className="mt-0.5 truncate">{book.userEmail || "—"}</dd>
            </div>
          </dl>

          <div className="mt-6">
            <h2 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
              Short Description
            </h2>
            <p className="mt-2 leading-relaxed whitespace-pre-line text-foreground/85">
              {book.description || "No description yet."}
            </p>
          </div>

          <div className="mt-8">
            <Dialog open={borrowOpen} onOpenChange={setBorrowOpen}>
              <DialogTrigger
                render={
                  <Button size="lg" className="w-full sm:w-auto" />
                }
              >
                Borrow This Book
              </DialogTrigger>

              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Borrow this book</DialogTitle>
                  <DialogDescription>
                    Confirm your details and when you will bring “
                    {book.title}” back.
                  </DialogDescription>
                </DialogHeader>

                <form
                  onSubmit={handleBorrow}
                  className="flex flex-col gap-4"
                >
                  <div className="grid gap-2">
                    <Label htmlFor="borrow-user-name">User Name</Label>
                    <Input
                      id="borrow-user-name"
                      name="userName"
                      type="text"
                      readOnly
                      defaultValue={user?.name}
                      className="text-muted-foreground"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="borrow-user-email">User Email</Label>
                    <Input
                      id="borrow-user-email"
                      name="userEmail"
                      type="email"
                      readOnly
                      defaultValue={user?.email}
                      className="text-muted-foreground"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="borrow-return-date">Return Date</Label>
                    <Input
                      id="borrow-return-date"
                      name="returnDate"
                      type="date"
                      required
                      value={returnDate}
                      min={toDateInputValue(new Date().toISOString())}
                      onChange={(event) => setReturnDate(event.target.value)}
                    />
                  </div>

                  <DialogFooter>
                    <DialogClose render={<Button variant="outline" />}>
                      Cancel
                    </DialogClose>
                    <Button type="submit" disabled={borrowing}>
                      {borrowing ? (
                        <>
                          <Spinner />
                          Confirming…
                        </>
                      ) : (
                        "Confirm Borrow"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  )
}
