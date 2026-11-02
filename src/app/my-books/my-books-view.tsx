"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  BookOpenCheckIcon,
  BookPlusIcon,
  PencilIcon,
  SparklesIcon,
  Trash2Icon,
} from "lucide-react"
import {
  CATEGORIES,
  deleteBook,
  fetchBooks,
  updateBook,
  type Book,
} from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { formatDate } from "@/lib/format"
import { toast } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
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
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"

export function MyBooksView() {
  const { user, token } = useAuth()
  const router = useRouter()
  const [books, setBooks] = React.useState<Book[] | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const requested = React.useRef(false)

  const [editing, setEditing] = React.useState<Book | null>(null)
  const [savingEdit, setSavingEdit] = React.useState(false)
  const [deleting, setDeleting] = React.useState<Book | null>(null)
  const [confirmingDelete, setConfirmingDelete] = React.useState(false)
  const ownerEmail = user?.email.trim().toLowerCase()

  const load = React.useCallback(async () => {
    setError(null)
    setBooks(null)
    try {
      const all = await fetchBooks()
      setBooks(
        all.filter(
          (book) => book.userEmail.trim().toLowerCase() === ownerEmail
        )
      )
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong."
      setError(message)
      toast.add({
        type: "error",
        title: "Could not load your books",
        description: message,
      })
    }
  }, [ownerEmail])

  React.useEffect(() => {
    if (requested.current) return
    requested.current = true
    void load()
  }, [load])

  async function handleUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!editing || savingEdit || !token) return

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
    const borrowedCopies = Math.max(0, editing.totalCopies - editing.availableCopies)
    if (totalCopies < borrowedCopies) {
      toast.add({
        type: "error",
        title: "Total copies is too low",
        description: `There are already ${borrowedCopies} copies checked out. Set total copies to at least ${borrowedCopies}.`,
      })
      return
    }
    payload.totalCopies = totalCopies
    payload.availableCopies = Math.max(0, totalCopies - borrowedCopies)

    if (!payload.title || !payload.author || !payload.description) {
      toast.add({
        type: "error",
        title: "Missing details",
        description: "Title, author and description are all required.",
      })
      return
    }

    setSavingEdit(true)
    try {
      const imageUrl = String(data.image ?? "").trim()
      if (imageUrl) {
        payload.image = imageUrl
      }

      await updateBook(editing._id, payload, token)
      setBooks((prev) =>
        prev
          ? prev.map((book) =>
              book._id === editing._id ? { ...book, ...payload } : book
            )
          : prev
      )
      toast.add({
        type: "success",
        title: "Book updated",
        description: `“${payload.title}” has been saved.`,
      })
      setEditing(null)
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
    if (!deleting || confirmingDelete || !token) return

    setConfirmingDelete(true)
    try {
      await deleteBook(deleting._id, token)
      setBooks((prev) =>
        prev ? prev.filter((book) => book._id !== deleting._id) : prev
      )
      toast.add({
        type: "success",
        title: "Book deleted",
        description: `“${deleting.title}” has been removed from the catalog.`,
      })
      setDeleting(null)
      router.push("/books")
    } catch (err: unknown) {
      toast.add({
        type: "error",
        title: "Could not delete the book",
        description:
          err instanceof Error ? err.message : "Something went wrong.",
      })
    } finally {
      setConfirmingDelete(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <header className="account-banner mb-8 flex flex-wrap items-end justify-between gap-6">
        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/75 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-teal-800 ring-1 ring-teal-900/10">
            <SparklesIcon className="size-3.5" /> Your personal shelf
          </span>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">My Books</h1>
          <p className="mt-2 text-sm leading-relaxed text-foreground/70 sm:text-base">
            Welcome{user?.name ? `, ${user.name.split(" ")[0]}` : ""}. Manage
            the books you added from one place.
          </p>
        </div>
        <Link
          href="/add-book"
          className="relative inline-flex h-11 items-center gap-2 rounded-xl bg-teal-800 px-5 text-sm font-semibold text-white shadow-lg shadow-teal-950/15 transition-all hover:-translate-y-0.5 hover:bg-teal-700"
        >
          <BookPlusIcon className="size-4" /> Add a book
        </Link>
      </header>

      {books !== null && !error ? (
        <section aria-label="Your shelf summary" className="mb-8 grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 lg:grid-cols-3 sm:gap-4">
          <div className="flex items-center gap-4 rounded-2xl border border-teal-900/10 bg-white/75 p-5 shadow-sm backdrop-blur">
            <span className="flex size-11 items-center justify-center rounded-xl bg-teal-100 text-teal-800">
              <BookOpenCheckIcon className="size-5" />
            </span>
            <div>
              <p className="text-2xl font-semibold tracking-tight">{books.length}</p>
              <p className="text-sm text-muted-foreground">
                {books.length === 1 ? "Book on your shelf" : "Books on your shelf"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-amber-900/10 bg-white/75 p-5 shadow-sm backdrop-blur">
            <span className="flex size-11 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
              <SparklesIcon className="size-5" />
            </span>
            <div>
              <p className="text-2xl font-semibold tracking-tight">
                {new Set(books.map((book) => book.category)).size}
              </p>
              <p className="text-sm text-muted-foreground">Genres represented</p>
            </div>
          </div>
          <div className="flex min-w-0 items-center gap-4 rounded-2xl border border-[#875844]/15 bg-white/75 p-4 shadow-sm backdrop-blur sm:p-5">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#f1e3cf] text-[#765038]">
              <BookPlusIcon className="size-5" />
            </span>
            <div>
              <p className="text-2xl font-semibold tracking-tight">
                {books.reduce((total, book) => total + book.availableCopies, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Copies available to borrow</p>
            </div>
          </div>
        </section>
      ) : null}

      {books === null ? (
        error ? (
          <div className="mt-12 flex flex-col items-center gap-4 text-center">
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" size="sm" onClick={() => void load()}>
              Try again
            </Button>
          </div>
        ) : (
          <div
            role="status"
            aria-label="Loading your books"
            className="mt-16 flex justify-center"
          >
            <Spinner className="size-6 text-muted-foreground" />
          </div>
        )
      ) : books.length === 0 ? (
        <div className="mx-auto mt-10 max-w-lg rounded-3xl border border-dashed border-teal-900/20 bg-white/55 px-6 py-12 text-center shadow-sm">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-teal-100 text-teal-800">
            <BookOpenCheckIcon className="size-7" />
          </span>
          <h2 className="mt-4 text-lg font-semibold">Your shelf is ready for a story</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            You have not added any books yet. Add your first one and invite
            readers to borrow it.
          </p>
          <Link
            href="/add-book"
            className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-teal-800 px-4 text-sm font-semibold text-white shadow-md shadow-teal-950/10 transition hover:bg-teal-700"
          >
            <BookPlusIcon className="size-4" /> Add your first book
          </Link>
        </div>
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
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h2 className="font-medium leading-snug">{book.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {book.author}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground/80">
                    Added {formatDate(book.addedAt)}
                  </p>
                  <div className="mt-auto flex gap-2 pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setEditing(book)}
                    >
                      <PencilIcon />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                      onClick={() => setDeleting(book)}
                    >
                      <Trash2Icon />
                      Delete
                    </Button>
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}

      {/* Edit dialog — prefilled from the selected book, PATCHed on save. */}
      <Dialog
        open={editing !== null}
        onOpenChange={(open) => {
          if (!open) setEditing(null)
        }}
      >
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
          {editing ? (
            <form key={editing._id} onSubmit={handleUpdate}>
              <DialogHeader>
                <DialogTitle>Edit book</DialogTitle>
                <DialogDescription>
                  Update the details for “{editing.title}”.
                </DialogDescription>
              </DialogHeader>

              <div className="mt-4 flex flex-col gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-title">Book Title</Label>
                  <Input
                    id="edit-title"
                    name="title"
                    type="text"
                    required
                    defaultValue={editing.title}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-book-number">Book Number</Label>
                  <Input
                    id="edit-book-number"
                    name="bookNumber"
                    type="text"
                    autoComplete="off"
                    placeholder="ISBN, shelf or inventory number"
                    defaultValue={editing.bookNumber}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-total-copies">Total Copies</Label>
                  <Input
                    id="edit-total-copies"
                    name="totalCopies"
                    type="number"
                    min={1}
                    step={1}
                    required
                    defaultValue={editing.totalCopies}
                  />
                  <p className="text-xs text-muted-foreground">
                    Copies currently borrowed stay checked out.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-author">Author Name</Label>
                    <Input
                      id="edit-author"
                      name="author"
                      type="text"
                      required
                      defaultValue={editing.author}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-category">Category</Label>
                    <NativeSelect
                      id="edit-category"
                      name="category"
                      className="w-full"
                      defaultValue={editing.category}
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
                  <Label htmlFor="edit-image">Book Image URL</Label>
                  <Input
                    id="edit-image"
                    name="image"
                    type="text"
                    autoComplete="off"
                    placeholder="https://…"
                    defaultValue={editing.image}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-description">Short Description</Label>
                  <Textarea
                    id="edit-description"
                    name="description"
                    required
                    rows={4}
                    maxLength={2000}
                    defaultValue={editing.description}
                  />
                </div>
              </div>

              <DialogFooter className="mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditing(null)}
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
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation — a custom modal, never window.confirm(). */}
      <AlertDialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this book?</AlertDialogTitle>
            <AlertDialogDescription>
              “{deleting?.title}” will be removed from BookNook for good. This
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={confirmingDelete}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={confirmingDelete}
              onClick={(event: React.MouseEvent) => {
                // Keep the modal open until the server confirms the delete.
                event.preventDefault()
                void handleDelete()
              }}
            >
              {confirmingDelete ? (
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
    </div>
  )
}
