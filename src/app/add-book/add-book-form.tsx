"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { BookOpenIcon, CircleCheckIcon, TriangleAlertIcon } from "lucide-react"
import { addBook, type NewBookInput } from "@/lib/books"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"

const bookTypes = ["Physical", "E-book", "Audiobook"]

const categories = [
  "Fiction",
  "Thriller",
  "Mystery",
  "Science Fiction",
  "Fantasy",
  "Self-Help",
  "History",
  "Biography",
  "Classic",
  "Children's",
]

const initialForm = {
  name: "",
  author: "",
  image: "",
  type: bookTypes[0],
  category: categories[0],
  copies: "1",
  description: "",
}

type FormState = typeof initialForm

type Status =
  | { kind: "idle" }
  | { kind: "success"; title: string }
  | { kind: "error"; message: string }

function RequiredMark() {
  return (
    <span aria-hidden="true" className="text-destructive">
      *
    </span>
  )
}

export function AddBookForm() {
  const [form, setForm] = React.useState<FormState>(initialForm)
  const [status, setStatus] = React.useState<Status>({ kind: "idle" })
  const [submitting, setSubmitting] = React.useState(false)
  const [previewFailed, setPreviewFailed] = React.useState(false)

  function update<Key extends keyof FormState>(
    key: Key,
    value: FormState[Key]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (key === "image") setPreviewFailed(false)
    setStatus((prev) => (prev.kind === "idle" ? prev : { kind: "idle" }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const image = form.image.trim()
    if (!/^https?:\/\/\S/.test(image) && !image.startsWith("/")) {
      setStatus({
        kind: "error",
        message:
          "Enter a valid image URL, such as https://… or /covers/my-book.svg.",
      })
      return
    }

    const title = form.name.trim()
    setSubmitting(true)
    const payload: NewBookInput = {
      title,
      author: form.author.trim(),
      image,
      type: form.type,
      category: form.category,
      quantity: Math.max(1, Number.parseInt(form.copies, 10) || 1),
      description: form.description.trim(),
    }
    const result = await addBook(payload)
    setSubmitting(false)

    if (result.ok) {
      setStatus({ kind: "success", title })
      setForm(initialForm)
      setPreviewFailed(false)
    } else {
      setStatus({ kind: "error", message: result.error })
    }
  }

  const previewSrc = form.image.trim()
  const showPreview = previewSrc !== "" && !previewFailed

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-lg">Add a New Book</CardTitle>
          <CardDescription>
            Fill in the details to share a book with the BookNook community.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status.kind === "success" && (
            <div
              role="status"
              className="mb-4 flex items-start gap-2 rounded-lg border border-emerald-600/30 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100"
            >
              <CircleCheckIcon className="mt-0.5 size-4 shrink-0" />
              <div>
                <p className="font-medium">Book added</p>
                <p className="text-emerald-800/80 dark:text-emerald-200/80">
                  “{status.title}” is now in your collection.{" "}
                  <Link
                    href="/my-books"
                    className="font-medium underline underline-offset-3"
                  >
                    View My Books
                  </Link>
                </p>
              </div>
            </div>
          )}

          {status.kind === "error" && (
            <Alert variant="destructive" className="mb-4">
              <TriangleAlertIcon />
              <AlertTitle>Could not add the book</AlertTitle>
              <AlertDescription>{status.message}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="book-name">
                Book Name <RequiredMark />
              </Label>
              <Input
                id="book-name"
                name="name"
                type="text"
                required
                autoComplete="off"
                placeholder="e.g. The Midnight Library"
                value={form.name}
                onChange={(event) => update("name", event.target.value)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="book-author">
                  Author <RequiredMark />
                </Label>
                <Input
                  id="book-author"
                  name="author"
                  type="text"
                  required
                  autoComplete="off"
                  placeholder="e.g. Matt Haig"
                  value={form.author}
                  onChange={(event) => update("author", event.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="book-type">Type</Label>
                <NativeSelect
                  id="book-type"
                  name="type"
                  className="w-full"
                  value={form.type}
                  onChange={(event) => update("type", event.target.value)}
                >
                  {bookTypes.map((type) => (
                    <NativeSelectOption key={type} value={type}>
                      {type}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="book-category">Category</Label>
                <NativeSelect
                  id="book-category"
                  name="category"
                  className="w-full"
                  value={form.category}
                  onChange={(event) => update("category", event.target.value)}
                >
                  {categories.map((category) => (
                    <NativeSelectOption key={category} value={category}>
                      {category}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="book-copies">Copies</Label>
                <Input
                  id="book-copies"
                  name="copies"
                  type="number"
                  min={1}
                  inputMode="numeric"
                  value={form.copies}
                  onChange={(event) => update("copies", event.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="book-image">
                Image URL <RequiredMark />
              </Label>
              <div className="flex items-center gap-3">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-md border border-border bg-muted sm:size-20">
                  {showPreview ? (
                    <Image
                      src={previewSrc}
                      alt="Cover preview"
                      fill
                      sizes="80px"
                      unoptimized
                      className="object-cover"
                      onError={() => setPreviewFailed(true)}
                    />
                  ) : (
                    <span className="flex size-full items-center justify-center text-muted-foreground">
                      <BookOpenIcon className="size-6" />
                    </span>
                  )}
                </div>
                <Input
                  id="book-image"
                  name="image"
                  type="text"
                  required
                  autoComplete="off"
                  className="min-w-0 flex-1"
                  placeholder="https://… or /covers/my-book.svg"
                  value={form.image}
                  onChange={(event) => update("image", event.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="book-description">
                Description <RequiredMark />
              </Label>
              <Textarea
                id="book-description"
                name="description"
                required
                rows={5}
                maxLength={2000}
                placeholder="A short summary that helps readers decide what to pick up next."
                value={form.description}
                onChange={(event) =>
                  update("description", event.target.value)
                }
              />
            </div>

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? (
                <>
                  <Spinner />
                  Adding…
                </>
              ) : (
                "Add Book"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
