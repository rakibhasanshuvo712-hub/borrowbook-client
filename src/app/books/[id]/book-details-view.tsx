"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeftIcon, PencilIcon, Trash2Icon } from "lucide-react"
import {
  CATEGORIES,
  createBorrow,
  deleteBook,
  fetchBook,
  fetchBorrows,
  updateBook,
  type Book,
} from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { defaultReturnDate, formatDate, toDateInputValue } from "@/lib/format"
import { toast } from "@/components/ui/toast"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
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
  const router = useRouter()
  const [book, setBook] = React.useState<Book | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const requested = React.useRef(false)

  const [borrowOpen, setBorrowOpen] = React.useState(false)
  const [returnDate, setReturnDate] = React.useState(defaultReturnDate())
  const [borrowing, setBorrowing] = React.useState(false)

  const [editOpen, setEditOpen] = React.useState(false)
  const [savingEdit, setSavingEdit] = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)

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

  const canManageBooks =
    !!user &&
    !!token &&
    user.email.trim().toLowerCase() === book?.userEmail.trim().toLowerCase()

  async function handleEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (savingEdit || !book || !token) return

    const form = new FormData(event.currentTarget)
    const data = Object.fromEntries(form.entries())

    const payload: Record<string, string | number> = {
      title: String(data.title ?? "").trim(),
      author: String(data.author ?? "").trim(),
      category: String(data.category ?? CATEGORIES[0]),
      description: String(data.description ?? "").trim(),
      bookNumber: String(data.bookNumber ?? "").trim(),
    }

    const totalCopies = Math.max(1, Math.floor(Number(data.totalCopies) || 1))
    payload.totalCopies = totalCopies
    // Keep the checked-out count intact when changing the total stock.
    if (book) {
      const borrowedCopies = Math.max(0, book.totalCopies - book.availableCopies)
      if (totalCopies < borrowedCopies) {
        toast.add({
          type: "error",
          title: "Total copies is too low",
          description: `There are already ${borrowedCopies} copies checked out. Set total copies to at least ${borrowedCopies}.`,
        })
        return
      }
      payload.availableCopies = Math.max(0, totalCopies - borrowedCopies)
    }

    if (!payload.title || !payload.author || !payload.description) {
      toast.add({
        type: "error",
        title: "Missing details",
        description: "Title, author and description are all required.",
      })
      return
    }

    const imageUrl = String(data.image ?? "").trim()
    if (imageUrl) payload.image = imageUrl

    setSavingEdit(true)
    try {
      await updateBook(book._id, payload, token)
      setBook((prev) => (prev ? { ...prev, ...payload } : prev))
      toast.add({
        type: "success",
        title: "Book updated",
        description: `“${payload.title}” has been saved.`,
      })
      setEditOpen(false)
      router.push("/books")
    } catch (err: unknown) {
      toast.add({
        type: "error",
        title: "Could not update the book",
        description:
          err instanceof Error ? err.message : "Something went wrong.",
      })
    } finally {
      setSavingEdit(false)
    }
  }

  async function handleDelete() {
    if (deleting || !book || !token) return
    setDeleting(true)
    try {
      await deleteBook(book._id, token)
      toast.add({
        type: "success",
        title: "Book deleted",
        description: `“${book.title}” has been removed.`,
      })
      router.push("/books")
    } catch (err: unknown) {
      toast.add({
        type: "error",
        title: "Could not delete the book",
        description:
          err instanceof Error ? err.message : "Something went wrong.",
      })
      setDeleteOpen(false)
    } finally {
      setDeleting(false)
    }
  }

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

    if (book.availableCopies <= 0) {
      toast.add({
        type: "error",
        title: "Not available",
        description: `“${book.title}” has no copies left to borrow right now.`,
      })
      return
    }

    setBorrowing(true)
    try {
      // No double borrow: a user may not hold two active loans of the same
      // book. The borrows list is the source of truth — if a record for this
      // bookId already exists for the signed-in user, we stop before creating
      // a second one or decrementing stock again.
      const active = await fetchBorrows(user.email, token)
      const alreadyBorrowed = active.some((item) => item.bookId === book._id)
      if (alreadyBorrowed) {
        toast.add({
          type: "error",
          title: "Already borrowed",
          description: `You already have “${book.title}” checked out. Return it first to borrow it again.`,
        })
        return
      }

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

      // The backend atomically decrements stock when it creates the loan.
      // Refresh from the server so the displayed count is authoritative.
      let nextCopies = Math.max(0, book.availableCopies - 1)
      try {
        const updatedBook = await fetchBook(book._id)
        nextCopies = updatedBook.availableCopies
      } catch {
        // The borrow succeeded; preserve an optimistic count if refresh fails.
      }
      setBook((prev) =>
        prev ? { ...prev, availableCopies: nextCopies } : prev
      )

      toast.add({
        type: "success",
        title: "Book borrowed",
        description: `“${book.title}” is yours until ${formatDate(chosenReturnDate)}. Find it under My Borrows.`,
      })
      setBorrowOpen(false)
      router.push("/my-borrows")
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
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-3xl bg-gradient-to-br from-amber-200 to-teal-100 p-2 shadow-2xl shadow-teal-950/15 ring-1 ring-white/80">
          <Image
            src={book.image}
            alt={`Cover of ${book.title}`}
            fill
            sizes="(max-width: 768px) 100vw, 300px"
            unoptimized
            className="rounded-[1.2rem] object-cover"
          />
          <span className="absolute top-5 left-5 rounded-full bg-teal-950/85 px-3 py-1.5 text-xs font-semibold text-white shadow-lg backdrop-blur">
            {book.category}
          </span>
        </div>

        <div className="flex flex-col">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {book.title}
          </h1>
          <p className="mt-1 text-base text-muted-foreground">
            by {book.author}
          </p>

          <dl className="mt-6 grid grid-cols-1 gap-3 rounded-2xl bg-gradient-to-br from-amber-50 via-card to-teal-50 p-5 text-sm shadow-md shadow-teal-950/5 ring-1 ring-white/90 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Book Number
              </dt>
              <dd className="mt-0.5">{book.bookNumber || "—"}</dd>
            </div>
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
                Available Copies
              </dt>
              <dd className="mt-0.5">
                {book.availableCopies} of {book.totalCopies}
              </dd>
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

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Dialog open={borrowOpen} onOpenChange={setBorrowOpen}>
              <DialogTrigger
                render={
                  <Button
                    size="lg"
                    className="w-full sm:w-auto"
                    disabled={!user || !token || book.availableCopies <= 0}
                  />
                }
              >
                {book.availableCopies <= 0
                  ? "Not Available"
                  : !user || !token
                    ? "Log in to borrow"
                    : "Borrow This Book"}
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

            {/* Only the member who added this book can manage it. */}
            {canManageBooks ? (
              <>
                <Dialog open={editOpen} onOpenChange={setEditOpen}>
                  <DialogTrigger
                    render={
                      <Button size="lg" variant="outline" className="w-full sm:w-auto" />
                    }
                  >
                    <PencilIcon />
                    Edit
                  </DialogTrigger>

                  <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
                    <form onSubmit={handleEdit}>
                      <DialogHeader>
                        <DialogTitle>Edit book</DialogTitle>
                        <DialogDescription>
                          Update the details for “{book.title}”.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="mt-4 flex flex-col gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="detail-edit-title">Book Title</Label>
                          <Input
                            id="detail-edit-title"
                            name="title"
                            type="text"
                            required
                            defaultValue={book.title}
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="detail-edit-book-number">Book Number</Label>
                          <Input
                            id="detail-edit-book-number"
                            name="bookNumber"
                            type="text"
                            autoComplete="off"
                            placeholder="ISBN, shelf or inventory number"
                            defaultValue={book.bookNumber}
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="detail-edit-total-copies">Total Copies</Label>
                          <Input
                            id="detail-edit-total-copies"
                            name="totalCopies"
                            type="number"
                            min={1}
                            step={1}
                            required
                            defaultValue={book.totalCopies}
                          />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="grid gap-2">
                            <Label htmlFor="detail-edit-author">Author Name</Label>
                            <Input
                              id="detail-edit-author"
                              name="author"
                              type="text"
                              required
                              defaultValue={book.author}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="detail-edit-category">Category</Label>
                            <NativeSelect
                              id="detail-edit-category"
                              name="category"
                              className="w-full"
                              defaultValue={book.category}
                            >
                              {CATEGORIES.map((category) => (
                                <NativeSelectOption key={category} value={category}>
                                  {category}
                                </NativeSelectOption>
                              ))}
                            </NativeSelect>
                          </div>
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="detail-edit-image">Book Image URL</Label>
                          <Input
                            id="detail-edit-image"
                            name="image"
                            type="text"
                            autoComplete="off"
                            placeholder="https://…"
                            defaultValue={book.image}
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="detail-edit-description">Short Description</Label>
                          <Textarea
                            id="detail-edit-description"
                            name="description"
                            required
                            rows={4}
                            maxLength={2000}
                            defaultValue={book.description}
                          />
                        </div>
                      </div>

                      <DialogFooter className="mt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setEditOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={savingEdit}>
                          {savingEdit ? (
                            <>
                              <Spinner />
                              Saving…
                            </>
                          ) : (
                            "Save Changes"
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>

                <Button
                  size="lg"
                  variant="destructive"
                  className="w-full sm:w-auto"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2Icon />
                  Delete
                </Button>

                <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this book?</AlertDialogTitle>
                      <AlertDialogDescription>
                        “{book.title}” will be removed from BookNook for good.
                        This cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={deleting}>
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        variant="destructive"
                        disabled={deleting}
                        onClick={(event: React.MouseEvent) => {
                          // Keep the modal open until the server confirms.
                          event.preventDefault()
                          void handleDelete()
                        }}
                      >
                        {deleting ? (
                          <>
                            <Spinner />
                            Deleting…
                          </>
                        ) : (
                          "Delete Book"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
