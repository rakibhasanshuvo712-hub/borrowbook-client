"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { PencilIcon, Trash2Icon } from "lucide-react"
import {
  canUploadImages,
  CATEGORIES,
  deleteBook,
  fetchBooks,
  updateBook,
  uploadImage,
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
  const [books, setBooks] = React.useState<Book[] | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const requested = React.useRef(false)

  const [editing, setEditing] = React.useState<Book | null>(null)
  const [savingEdit, setSavingEdit] = React.useState(false)
  const [deleting, setDeleting] = React.useState<Book | null>(null)
  const [confirmingDelete, setConfirmingDelete] = React.useState(false)

  const load = React.useCallback(async () => {
    setError(null)
    setBooks(null)
    try {
      const all = await fetchBooks()
      setBooks(all.filter((book) => book.userEmail === user?.email))
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
  }, [user?.email])

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

    const payload: Record<string, string> = {
      title: String(data.title ?? "").trim(),
      author: String(data.author ?? "").trim(),
      category: String(data.category ?? CATEGORIES[0]),
      description: String(data.description ?? "").trim(),
    }

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
      const file = form.get("imageFile")
      if (file instanceof File && file.size > 0) {
        payload.image = await uploadImage(file)
      } else if (String(data.image ?? "").trim()) {
        payload.image = String(data.image ?? "").trim()
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
        description: `“${deleting.title}” has been removed from your shelf.`,
      })
      setDeleting(null)
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My Books</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            The books you have added — edit the details or remove them.
          </p>
        </div>
        <Link
          href="/add-book"
          className="inline-flex h-8 items-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
        >
          Add Book
        </Link>
      </div>

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
        <p className="mt-12 text-center text-sm text-muted-foreground">
          You have not added any books yet.{" "}
          <Link
            href="/add-book"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Add your first book
          </Link>
        </p>
      ) : (
        <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <li key={book._id} className="h-full">
              <article className="flex h-full flex-col overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted">
                  <Image
                    src={book.image}
                    alt={`Cover of ${book.title}`}
                    width={300}
                    height={400}
                    unoptimized
                    className="h-full w-full object-cover"
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
                  {canUploadImages() ? (
                    <div className="grid gap-2">
                      <Label htmlFor="edit-image-file">
                        Or upload a new cover
                      </Label>
                      <Input
                        id="edit-image-file"
                        name="imageFile"
                        type="file"
                        accept="image/*"
                        className="h-auto py-2 file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-sm file:font-medium"
                      />
                    </div>
                  ) : null}
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
